<script lang="ts" generics="TData, TValue">
    import { FlexRender } from '$lib/components/ui/data-table';
    import type { ColumnDef, Table as TanStackTableType } from '@tanstack/table-core';
    import * as Table from '$lib/components/ui/table';

    let {table, columns}: {table: TanStackTableType<TData>, columns: ColumnDef<TData, TValue>[]} = $props();
</script>
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