<script lang="ts" generics="TData">
    import Settings2Icon from "@lucide/svelte/icons/settings-2";
    import type { Table } from "@tanstack/table-core";
    import { buttonVariants } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

    let { table, title }: { table: Table<TData>, title?: string } = $props();
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger
        class={buttonVariants({
			variant: "outline",
			size: "sm",
			class: "ms-auto hidden h-8 lg:flex",
		})}
    >
        <Settings2Icon />
        { title ?? 'View' }
    </DropdownMenu.Trigger>
    <DropdownMenu.Content side="left">
        <DropdownMenu.Group>
            <DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
            <DropdownMenu.Separator />
            {#each table
                .getAllColumns()
                .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()) as column (column)}
                <DropdownMenu.CheckboxItem
                    closeOnSelect={false}
                    bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
                    class="capitalize"
                >
                    {column.id}
                </DropdownMenu.CheckboxItem>
            {/each}
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>