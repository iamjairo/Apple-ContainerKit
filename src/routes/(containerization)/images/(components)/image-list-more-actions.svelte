<script lang="ts">
    import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";
    import Download from "@lucide/svelte/icons/download";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

    type SaveState = 'none' | 'saving' | 'saved' | 'error';

    type Props = {
        buttonProps: Record<string, unknown>
    };

    let { buttonProps }: Props = $props();

    let saveState: SaveState = $state('none')

    const saveImage = () => {
        // Implement the logic to save/download the image
        console.log("Save image action triggered");
    };
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger {...buttonProps}>
        <MoreHorizontal />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-40" align="end" side="right">
        <DropdownMenu.Label>Image Actions</DropdownMenu.Label>
        <DropdownMenu.Group>
            <DropdownMenu.Item onSelect={saveImage}>
                <Download /> Save
            </DropdownMenu.Item>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>