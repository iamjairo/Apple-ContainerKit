<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import TooltipWrapper from '$lib/components/atoms/tooltip.svelte';
    import Minimize from '@lucide/svelte/icons/minimize-2';
    import X from '@lucide/svelte/icons/x';
    import Maximize from '@lucide/svelte/icons/maximize-2';
    import { cn } from '$lib/utils';

    interface TabControlsProps {
        onMinimize?: () => void;
        onClose?: () => void;
        class?: string;
        minimized?: boolean;
    }

    let { minimized, onMinimize, onClose, class: className }: TabControlsProps = $props();
</script>

<div class={cn('flex items-center gap-2', className)}>
    <TooltipWrapper content={minimized ? 'Maximize' : 'Minimize'}>
        {#snippet children()}
            <Button
                variant="ghost"
                size="sm"
                class="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onclick={onMinimize}
            >
                {#if minimized}
                    <Maximize size={12} />
                {:else}
                    <Minimize size={12} />
                {/if}
            </Button>
        {/snippet}
    </TooltipWrapper>

    <TooltipWrapper content="Close">
        {#snippet children()}
            <Button
                variant="ghost"
                size="sm"
                class="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onclick={onClose}
            >
                <X size={12} />
            </Button>
        {/snippet}
    </TooltipWrapper>
</div>
