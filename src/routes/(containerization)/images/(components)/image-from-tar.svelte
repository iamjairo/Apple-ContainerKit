<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { open } from '@tauri-apps/plugin-dialog';
    import { Button } from '$lib/components/ui/button';
    import UploadIcon from '@lucide/svelte/icons/upload';
    import { toast } from 'svelte-sonner';

    type Props = {
        show: boolean;
    }

    let {show = $bindable(false)}: Props = $props();

    async function selectFilePath() {
        const file = await open({
            multiple: false,
            directory: false
        })

        if(!file) {
            return toast.error('No selected file', {
                description: 'You need to select a image tar archive.'
            })
        }
    }
    // container i save --arch aarch64 --output /Users/shivammeena/Projects/ContainerKit/static/test-tar.tar redis
</script>

<Dialog.Root open={show} onOpenChange={(val) => (show = val)}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Import Image Tar Archive</Dialog.Title>
            <Dialog.Description> Load images from an OCI compatible tar archive</Dialog.Description>
        </Dialog.Header>
        <Button variant="ghost" onclick={selectFilePath} class="border-border hover:bg-accent/25 flex h-48 w-full place-items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all hover:cursor-pointer aria-disabled:opacity-50 aria-disabled:hover:cursor-not-allowed">
            <div class="flex flex-col place-items-center justify-center gap-2">
                <div
                    class="border-border text-muted-foreground flex size-14 place-items-center justify-center rounded-full border border-dashed"
                >
                    <UploadIcon class="size-7" />
                </div>
                <div class="flex flex-col gap-0.5 text-center">
                    <span class="text-muted-foreground font-medium">
                        Click to select image tar archive
                    </span>
                </div>
            </div>
        </Button>
    </Dialog.Content>
</Dialog.Root>