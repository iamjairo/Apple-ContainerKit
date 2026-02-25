import type { ColumnDef } from '@tanstack/table-core';

import type { ContainerClient } from '$lib/models/container';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import {
    DataTableCheckbox,
    DataTableFeaturedTextCell
} from '$lib/components/atoms/data-table-extensions/index.js';

import ContainerStatus from './container-status.svelte';
import ContainerActions from './container-actions.svelte';
import ContainerLastStarted from './container-last-started.svelte';
import { createRawSnippet } from 'svelte';

type ContainerColumnProps = {
    deleteContainer: (id: string) => Promise<void>;
};

export function columns({ deleteContainer }: ContainerColumnProps): ColumnDef<ContainerClient>[] {
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
            id: 'id',
            header: 'ID',
            accessorFn: (row) => row.configuration.id,
            cell: ({ row }) => {
                return renderComponent(DataTableFeaturedTextCell, {
                    content: row.getValue<string>('id'),
                    tooltip: row.original.configuration.id,
                    href: '/containers/' + row.original.configuration.id,
                    copyFirst: true
                })
            },
            enableHiding: false
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as ContainerClient['status'];
                return renderComponent(ContainerStatus, { status });
            },
            enableHiding: false
        },
        {
            id: 'image',
            header: 'Image',
            accessorFn: (row) => row.configuration.image.reference?.split('/')?.at(-1) ?? 'N/A',
            enableHiding: false
        },
        {
            id: 'host',
            header: 'Host',
            accessorFn: (row) => {
                console.log(row.configuration.hostname, row.configuration?.dns?.domain);
                return `${row.configuration.hostname}${row.configuration?.dns?.domain === null || row.configuration?.dns?.domain === undefined ? '' : `.${row.configuration.dns.domain}`}`
            }
                ,
            cell: ({ row }) => {
                const content = row.getValue<string>('host');
                return renderComponent(DataTableFeaturedTextCell, {
                    content: row.getValue<string>('host'),
                    tooltip: row.original.configuration.hostname,
                    copyFirst: true
                })
            }
        },
        {
            id: 'network',
            header: 'Network',
            enableHiding: true,
            accessorFn: (row) =>
                row.networks?.length > 0
                    ? row.networks?.map((network) => network.address?.split('/')?.[0]).join(', ')
                    : 'N/A'
        },
        {
            id: 'lastStarted',
            header: 'Last Started',
            accessorFn: (row) => row.startedDate,
            cell: ({ row }) => {
                return renderComponent(ContainerLastStarted, {
                    lastStarted: row.original.startedDate
                });
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const id = row.getValue('id') as ContainerClient['configuration']['id'];
                const status = row.getValue('status') as ContainerClient['status'];
                return renderComponent(ContainerActions, {
                    status,
                    id,
                    deleteContainer
                });
            },
            enableHiding: false
        }
    ];
}
