<script lang="ts">
    import TrafficLights from '$lib/components/atoms/terminal/traffic-lights.svelte';
    import HeaderIcon from '$lib/components/atoms/terminal/header-icon.svelte';
    import TabControls from '$lib/components/atoms/terminal/tab-controls.svelte';
    import { cn } from '$lib/utils';

    interface TerminalHeaderProps {
        title?: string;
        onClose?: () => void;
        onMinimize?: () => void;
        onMaximize?: () => void;
        class?: string;
        minimized?: boolean;
    }

    let {
        title = 'Terminal',
        onClose,
        onMinimize,
        onMaximize,
        minimized,
        class: className
    }: TerminalHeaderProps = $props();
</script>

<div
    class={cn(
        'flex items-center justify-between bg-muted px-4 py-2 border-b border-border',
        className
    )}
>
    <div class="flex items-center gap-3">
        <TrafficLights {onClose} {onMinimize} {onMaximize} />
        <HeaderIcon {title} />
    </div>

    <TabControls {onMinimize} {onClose} {minimized} />
</div>
