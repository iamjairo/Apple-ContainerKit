<script lang="ts">
    import * as Tooltip from '$lib/components/ui/tooltip';
    import { Separator } from '$lib/components/ui/separator/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import Delete from '@lucide/svelte/icons/trash-2';
    import Box from '@lucide/svelte/icons/box';
    import ListIndentIncrease from '@lucide/svelte/icons/list-indent-increase';
    import { createContainerDrawerData } from './images.svelte';
    import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
    import { removeImage } from '$lib/services/containerization/images';
    import { tryCatch } from '$lib/helpers/try-catch';
    import { getAllContainers } from '$lib/services/containerization/containers';
    import { toast } from 'svelte-sonner';
    import type { ContainerClient } from '$lib/models/container';
    import ImageListMoreActions from './image-list-more-actions.svelte';
    import * as ButtonGroup from "$lib/components/ui/button-group/index.js";

    type Props = {
        name: string;
        reference: string;
    };

    const { name, reference }: Props = $props();

    function showCreateContainerDrawer() {
        createContainerDrawerData.open = true;
        createContainerDrawerData.selected = name;
    }

    async function deleteImage() {
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
        const containersUsingImage = containers.filter((container) => reference === container.configuration.image.reference);
        if (containersUsingImage.length > 0) {
            return toast.error(`You can't delete an image which is being used in containers: ${containersUsingImage.join(', ')}`)
        }
        confirmDelete({
            title: "Delete Image?",
            description: `Are you sure you want to delete <strong>${reference?.split('/').at(-1) ?? name}</strong> image?`,
            onConfirm: async () => {
                await removeImage(reference);
            }
        })
    }
</script>

<div class="flex items-center h-full gap-x-0.5">
    <ButtonGroup.Root>
        <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    {#snippet child({ props })}
                        <Button
                            variant="outline"
                            {...props}
                            onclick={showCreateContainerDrawer}
                        >
                            <Box class="text-primary"/>
                        </Button>
                    {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content side="left">Create Container</Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
        <Tooltip.Provider delayDuration={10}>
            <Tooltip.Root>
                <Tooltip.Trigger class="">
                    {#snippet child({ props })}
                        <Button
                            {...props}
                            variant="outline"
                            size="icon"
                            onclick={deleteImage}
                        >
                            <Delete class="text-destructive"/>
                        </Button>
                    {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content
                    side="top"
                    class="bg-destructive text-destructive-foreground"
                    arrowClasses="bg-destructive"
                >
                    <p>Delete Image</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
        <Tooltip.Provider delayDuration={10}>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    {#snippet child({ props })}
                        <ImageListMoreActions buttonProps={props}/>
                    {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content side="right">
                    <p>More options</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
    </ButtonGroup.Root>
</div>
