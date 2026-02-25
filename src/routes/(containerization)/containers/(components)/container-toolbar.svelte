<script lang="ts" generics="TData">
    import type { Table } from '@tanstack/table-core';
    import * as DataTableExtensions from '$lib/components/atoms/data-table-extensions/index.js';
    import { Switch } from '$lib/components/ui/switch';
    import { Label } from '$lib/components/ui/label';

    let { table, showOnlyRunningContainers = $bindable(false) }: { table: Table<TData>, showOnlyRunningContainers: boolean } = $props();
</script>

<div class="flex items-center justify-between">
    <div class="flex flex-1 items-center space-x-2">
        <DataTableExtensions.SearchInput {table} />
        <div class="flex items-center space-x-2">
            <Switch
                disabled={!showOnlyRunningContainers && table.getRowCount() === 0}
                id="running-containers-only"
                bind:checked={showOnlyRunningContainers}
            />
            <Label for="running-containers-only">Running Containers Only</Label>
        </div>
    </div>
    <DataTableExtensions.ViewOptions {table} />
</div>