<script lang="ts" generics="TData">
    import type { Table as TableType } from '@tanstack/table-core';
    import * as Table from '$lib/components/ui/table';
    import { Button } from '$lib/components/ui/button/index.js';
    import { FlexRender } from '$lib/components/ui/data-table';

    type Props = {
        table: TableType<TData>;
        showOnlyRunningContainers?: boolean;
    };

    let { table, showOnlyRunningContainers = $bindable(false) }: Props = $props();

</script>

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
                        <Table.Cell colspan={table.getAllColumns().length} class="h-24 text-center">
                            {showOnlyRunningContainers
                                ? 'No running containers.'
                                : 'No results.'}
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