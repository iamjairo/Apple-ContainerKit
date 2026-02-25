<script lang="ts">
    import CirclePlay from '@lucide/svelte/icons/circle-play';
    import CircleStop from '@lucide/svelte/icons/circle-stop';
    import Delete from '@lucide/svelte/icons/trash-2';
    import Loader from '@lucide/svelte/icons/loader';
    import Information from '@lucide/svelte/icons/sliders-horizontal';

    import { toast } from 'svelte-sonner';

    import type { ContainerClient } from '$lib/models/container';

    import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
    import { Button } from '$lib/components/ui/button';
    import * as Tooltip from '$lib/components/ui/tooltip';
    import { Separator } from '$lib/components/ui/separator';
    import { startContainer, stopContainer } from '$lib/services/containerization/containers';
    import ContainerDeleteDialog from './container-delete-dialog.svelte';
    import InformationDrawer from './information-drawer.svelte';

    type Props = {
        status: ContainerClient['status'];
        id: string;
        deleteContainer: (id: string) => Promise<void>;
    };

    let { status, id, deleteContainer }: Props = $props();

    let disableActions = $state(false);
    let startingContainer = $state(false);
    let showDeleteDialog = $state(false);
    let showInformationDrawer = $state(false);

    async function handleContainerRunningState() {
        startingContainer = disableActions = true;
        const message = status === 'running' ? 'stopped' : 'started';
        const output = status === 'running' ? await stopContainer(id) : await startContainer(id);
        startingContainer = disableActions = false;
        if (output.error) {
            toast.error(output.stderr);
            return;
        }

        if (output.stdout && !output.error) {
            toast.success(`Container ${output.stdout} ${message} successfully`);
        }
    }

    function handleDeleteContainer() {
        deleteContainer(id);
        showDeleteDialog = false;
    }

    function handleShowInformationDrawer() {
        showInformationDrawer = true;
    }
</script>

<div class="flex items-center h-full">
    <ButtonGroup.Root>
        <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    {#snippet child({ props })}
                        <Button
                            {...props}
                            variant="outline"
                            size="icon"
                            onclick={handleContainerRunningState}
                            class={[
                                status === 'stopped'
                                    ? 'text-green-400'
                                    : 'text-red-400 hover:bg-red-100 hover:text-red-400'
                            ]}
                            disabled={disableActions}
                        >
                            {#if status === 'running'}
                                <CircleStop />
                            {:else if startingContainer}
                                <Loader class="animate-spin" />
                            {:else}
                                <CirclePlay />
                            {/if}
                        </Button>
                    {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content side="left">
                    <p>{status === 'running' ? 'Stop' : 'Start'}</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
        {#if status === 'stopped'}
            <Tooltip.Provider delayDuration={10}>
                <Tooltip.Root>
                    <Tooltip.Trigger class="bg-destructive">
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant="outline"
                                size="icon"
                                disabled={disableActions}
                                onclick={() => (showDeleteDialog = true)}
                            >
                                <Delete class="text-destructive"/>
                            </Button>
                        {/snippet}
                    </Tooltip.Trigger>
                    <Tooltip.Content
                        side="right"
                        class="bg-destructive text-destructive-foreground"
                        arrowClasses="bg-destructive"
                    >
                        <p>Delete</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
            <ContainerDeleteDialog bind:open={showDeleteDialog} {handleDeleteContainer} {id} />
        {/if}

        {#if status === 'running'}
        <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    {#snippet child({ props })}
                        <Button
                            {...props}
                            variant="outline"
                            size="icon"
                            onclick={handleShowInformationDrawer}
                            disabled={disableActions}
                        >
                            <Information />
                        </Button>
                    {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content side="right">
                    <p>Container details</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
        <InformationDrawer bind:open={showInformationDrawer} {id} />
    {/if}
    </ButtonGroup.Root>
</div>
