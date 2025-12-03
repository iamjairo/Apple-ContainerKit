<script lang="ts" generics="TData, TValue">
    import {
        type ColumnDef,
        type ColumnFiltersState,
        type RowSelectionState,
        type PaginationState,
        type SortingState,
        getCoreRowModel,
        getFilteredRowModel,
        getPaginationRowModel
    } from '@tanstack/table-core';
    import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
    import DeleteConfirmationDialog from '$lib/components/molecules/delete-confirmation-dialog.svelte';
    import * as Alert from "$lib/components/ui/alert/index.js";
    import * as Table from '$lib/components/ui/table';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Switch } from '$lib/components/ui/switch';
    import { PressedKeys } from 'runed';
    import { Button } from '$lib/components/ui/button';
    import Refresh from '@lucide/svelte/icons/rotate-ccw';
    import Search from '@lucide/svelte/icons/search';
    import Import from '@lucide/svelte/icons/import';
    import CloudDownload from '@lucide/svelte/icons/cloud-download';
    import Delete from '@lucide/svelte/icons/trash-2';
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import { Badge } from '$lib/components/ui/badge/index.js';
    import { getAllContainers } from '$lib/services/containerization/containers';
    import { tryCatch } from '$lib/helpers/try-catch.js';
    import { toast } from 'svelte-sonner';
    import type { ContainerClient, ContainerImage } from '$lib/models/container';
    import { removeMultipleImages } from '$lib/services/containerization/images';

    type DataTableProps<TData, TValue> = {
        columns: ColumnDef<TData, TValue>[];
        data: TData[];
    };

    type Props = {} & DataTableProps<TData, TValue>;

    let { data, columns }: Props = $props();

    let searchInputBox: HTMLInputElement | null = $state(null);
    let showKeyboardShortcut = $state(true);
    let showMultipleDeleteDialog = $state(false);
    let imagesInUse: Record<string, string[]> = $state({});
    let imagesToDelete: string[] = $state([]);

    const keys = new PressedKeys();
    keys.onKeys(['meta', 'k'], () => {
        searchInputBox?.focus();
    });

    let columnFilters = $state<ColumnFiltersState>([]);
    let rowSelection = $state<RowSelectionState>({});
    let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
    let sorting = $state<SortingState>([]);

    const table = createSvelteTable({
        get data() {
            return data;
        },
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            get columnFilters() {
                return columnFilters;
            },
            get pagination() {
                return pagination;
            },
            get sorting() {
                return sorting;
            },
            get rowSelection() {
                return rowSelection;
            }
        },
        onColumnFiltersChange: (updater) => {
            if (typeof updater === 'function') {
                columnFilters = updater(columnFilters);
            } else {
                columnFilters = updater;
            }
        },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                pagination = updater(pagination);
            } else {
                pagination = updater;
            }
        },
        onRowSelectionChange: (updater) => {
            if (typeof updater === 'function') {
                rowSelection = updater(rowSelection);
            } else {
                rowSelection = updater;
            }
        }
    });

    let searchValue = $state((table.getColumn('name')?.getFilterValue() as string) ?? '');

    async function deleteSelectedImages() {
        if (imagesToDelete.length === 0) {
            toast.warning('No images to delete', {
                description: 'All selected images are currently in use by containers.'
            });
            closeDeleteDialog();
            return;
        }

        const {data, error} = await tryCatch(removeMultipleImages(imagesToDelete))
        closeDeleteDialog();
        if (error) {
            toast.error(error.message);
            return;
        }

        if (data.error) {
            toast.error(data.stderr)
            return;
        }

        if (data && data.stdout) {
            toast.success('Selected images deleted successfully', {description: data.stdout});
            table.resetRowSelection();
        }
    }

    async function startMultipleImagesDelete() {
        const { data: output, error } = await tryCatch(getAllContainers());
        if (error) {
            console.error('Error fetching containers:', error);
            toast.error(error.message);
            return;
        }

        if (output.error || output.stderr) {
            toast.error('Error in getting container list', {
                description: output.stderr
            });
            return;
        }

        if (!output.stdout) {
            toast.error('Error in getting container list');
            return;
        }

        const containers: ContainerClient[] = JSON.parse(output.stdout) ?? [] satisfies ContainerClient[];
        const selectedRowIds = Object.keys(rowSelection);
        const selectedRowsData = selectedRowIds.map((rowId) => table.getRow(rowId).original) as Array<ContainerImage>;
        const imagesInUseMap: Record<string, string[]> = {};
        for (const image of selectedRowsData) {
            const containersUsingImage = containers.filter((container) => image.reference === container.configuration.image.reference);
            if (containersUsingImage.length > 0) {
                const containerIds = containersUsingImage.map((container) => container.configuration.id);
                imagesInUseMap[image.reference] = containerIds;
            } else {
                imagesToDelete.push(image.reference)
            }
        }

        imagesInUse = imagesInUseMap;
        showMultipleDeleteDialog = true;
    }

    function closeDeleteDialog() {
        imagesInUse = {};
        imagesToDelete = [];
        showMultipleDeleteDialog = false;
    }
</script>

<div class="space-y-4">
    <div class="flex justify-between w-full">
        <div class="flex items-center space-x-2">
            <div class="relative flex-1">
                <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                {#if showKeyboardShortcut}
                    <kbd
                        class="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex"
                    >
                        <span class="text-xs tracking-wider">⌘</span>K
                    </kbd>
                {/if}
                <Input
                    bind:ref={searchInputBox}
                    type="text"
                    placeholder="Search images..."
                    bind:value={searchValue}
                    oninput={() => table.getColumn('name')?.setFilterValue(searchValue)}
                    onkeydown={(e) => {
                        if (e.key === 'Escape') {
                            return searchInputBox?.blur();
                        }
                        if (e.key === 'Enter') {
                            table.getColumn('name')?.setFilterValue(searchValue);
                        }
                    }}
                    onfocus={() => (showKeyboardShortcut = false)}
                    onblur={() => (showKeyboardShortcut = searchValue?.length === 0)}
                    class="pl-8 text-pretty"
                />
            </div>
            <div class="flex items-center space-x-2">
                <!-- TODO: Implement a dialog to fetch a new image -->
                <Button variant="outline">
                    <Import /> Import Image
                </Button>
            </div>
            <div class="flex items-center space-x-2">
                <!-- TODO: Implement a dialog to fetch a new image -->
                <Button variant="outline">
                    <CloudDownload />
                    Pull Image
                </Button>
            </div>
        </div>
        {#if Object.keys(rowSelection).length > 0 }
            <div class="flex items-center space-x-2">
                <Button class="relative" variant="destructive" onclick={startMultipleImagesDelete}>
                    <Delete />
                    Delete
                    <Badge
                        variant="destructive"
                        class="absolute rounded-full -top-3 -right-2 bg-destructive-foreground! text-destructive!"
                    >
                        {@const totalSelectedRows = Object.keys(rowSelection).length}
                        {#if totalSelectedRows !== data.length}
                            {totalSelectedRows}
                        {:else}
                            All
                        {/if}
                    </Badge>
                </Button>
            </div>
        {/if}
    </div>

    <div class="flex flex-col space-y-2">
        <div class="rounded-md border">
            <Table.Root>
                <Table.Header>
                    {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                        <Table.Row>
                            {#each headerGroup.headers as header (header.id)}
                                <Table.Head>
                                    {#if !header.isPlaceholder}
                                        <FlexRender
                                            content={header.column.columnDef.header}
                                            context={header.getContext()}
                                        />
                                    {/if}
                                </Table.Head>
                            {/each}
                        </Table.Row>
                    {/each}
                </Table.Header>
                <Table.Body>
                    {#each table.getRowModel().rows as row (row.id)}
                        {#key row.id}
                            <Table.Row
                                data-state={row.getIsSelected() && 'selected'}
                                class="table-animate"
                            >
                                {#each row.getVisibleCells() as cell (cell.id)}
                                    <Table.Cell>
                                        <FlexRender
                                            content={cell.column.columnDef.cell}
                                            context={cell.getContext()}
                                        />
                                    </Table.Cell>
                                {/each}
                            </Table.Row>
                        {/key}
                    {:else}
                        <Table.Row>
                            <Table.Cell colspan={columns.length} class="h-24 text-center">
                                No Results
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </div>
        <div class="flex items-center justify-end space-x-2">
            <div class="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div class="space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onclick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onclick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    </div>
</div>

<DeleteConfirmationDialog
    bind:open={showMultipleDeleteDialog}
    title="Delete Images"
    description="Are you sure you want to delete the selected images? This action cannot be undone."
    deleteAction={deleteSelectedImages}
    onClose={closeDeleteDialog}
>
    {#if Object.keys(imagesInUse).length > 0}
        <Alert.Root variant="destructive" class="mb-4">
            <AlertCircleIcon />
            <Alert.Title>Some images are currently in use.</Alert.Title>
            <Alert.Description>
                The following images are being used by running containers and cannot be deleted:
                <ul class="list-inside list-disc mt-2">
                    {#each Object.keys(imagesInUse) as reference (reference)}
                        <li>Container -> {imagesInUse[reference].join(', ')} uses image -> {reference.split('/').at(-1)}</li>
                    {/each}
                </ul>
                <p class="font-semibold tracking-wider">Cannot delete image(s): Container dependencies exist. Delete the containers first.</p>
            </Alert.Description>
        </Alert.Root>
    {/if}
</DeleteConfirmationDialog>
