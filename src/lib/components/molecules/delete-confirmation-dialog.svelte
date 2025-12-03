<script lang="ts">
    import * as Dialog from '$lib/components/ui/dialog/index.js';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import type { Snippet } from 'svelte';

    type Props = {
        title: string;
        description: string;
        open: boolean;
        deleteAction: () => void;
        onClose: () => void;
        children?: Snippet
    };

    let { title, description, open = $bindable(false), deleteAction, onClose, children }: Props = $props();
</script>

<Dialog.Root bind:open onOpenChangeComplete={!open ? onClose : () => {}}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>
                {description}
            </Dialog.Description>
        </Dialog.Header>
        {@render children?.()}
        <Dialog.Footer class="flex flex-row gap-x-4">
            <Dialog.Close class={buttonVariants({ variant: 'secondary' })}>Cancel</Dialog.Close>
            <Button variant="destructive" onclick={deleteAction}>Delete</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
