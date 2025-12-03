<script lang="ts">
    import * as Tooltip from '$lib/components/ui/tooltip';
    import { Separator } from '$lib/components/ui/separator/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import Delete from '@lucide/svelte/icons/trash-2';
    import Box from '@lucide/svelte/icons/box';
    import { createContainerDrawerData } from './images.svelte';

    type Props = {
        name: string;
    };

    const { name }: Props = $props();

    function showCreateContainerDrawer() {
        createContainerDrawerData.open = true;
        createContainerDrawerData.selected = name;
    }

    function deleteImage() {}
</script>

<div class="flex items-center h-full gap-x-0.5">
    <Tooltip.Provider delayDuration={150}>
        <Tooltip.Root>
            <Tooltip.Trigger>
                {#snippet child({ props })}
                    <Button
                        {...props}
                        variant="secondary"
                        size="icon"
                        onclick={showCreateContainerDrawer}
                        class=""
                    >
                        <Box class="text-primary" />
                    </Button>
                {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content side="left">Create Container</Tooltip.Content>
        </Tooltip.Root>
    </Tooltip.Provider>
    <Separator orientation="vertical" class="h-5 bg-emerald-600" />
    <Tooltip.Provider delayDuration={10}>
        <Tooltip.Root>
            <Tooltip.Trigger class="bg-destructive">
                {#snippet child({ props })}
                    <Button
                        {...props}
                        variant="ghost"
                        size="icon"
                        class="text-red-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-100"
                        onclick={deleteImage}
                    >
                        <Delete />
                    </Button>
                {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content
                side="right"
                class="bg-destructive text-destructive-foreground"
                arrowClasses="bg-destructive"
            >
                <p>Delete Image</p>
            </Tooltip.Content>
        </Tooltip.Root>
    </Tooltip.Provider>
</div>
