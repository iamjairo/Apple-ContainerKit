import type { ColumnDef } from '@tanstack/table-core';
import type { ContainerImage } from '$lib/models/container';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import DataTableCheckbox from '$lib/components/atoms/data-table-checkbox.svelte';
import ImageListActions from './image-list-actions.svelte';
import prettyBytes from 'pretty-bytes';

export function columns(): ColumnDef<ContainerImage>[] {
    return [
        {
            id: 'select',
            header: ({ table }) =>
                renderComponent(DataTableCheckbox, {
                    checked: table.getIsAllPageRowsSelected(),
                    indeterminate:
                        table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
                    onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
                    'aria-label': 'Select all'
                }),
            cell: ({ row }) =>
                renderComponent(DataTableCheckbox, {
                    checked: row.getIsSelected(),
                    onCheckedChange: (value) => row.toggleSelected(!!value),
                    'aria-label': 'Select row'
                }),
            enableSorting: false,
            enableHiding: false
        },
        {
            id: 'name',
            header: 'Name',
            accessorFn: (row) => row.reference?.split('/')?.at(-1)?.split(':')?.at(0) ?? 'N/A'
        },
        {
            id: 'tag',
            header: 'Tag',
            accessorFn: (row) => row.reference?.split('/')?.at(-1)?.split(':')?.at(-1) ?? 'N/A'
        },
        {
            id: 'size',
            header: 'Size',
            accessorFn: (row) => prettyBytes(row.descriptor.size) ?? 'N/A'
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const name = row.getValue('name') as string;
                return renderComponent(ImageListActions, {
                    name
                });
            }
        }
    ];
}
