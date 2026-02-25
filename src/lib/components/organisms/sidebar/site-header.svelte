<script lang="ts">
    import * as Breadcrumb from '$lib/components/ui/breadcrumb';
    import { Separator } from '$lib/components/ui/separator';
    import * as Card from '$lib/components/ui/card/index.js';
    import { Button } from '$lib/components/ui/button';
    import ArrowLeft from '@lucide/svelte/icons/arrow-left';
    import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
    import { goto } from '$app/navigation';
    import { useSidebar } from '$lib/components/ui/sidebar';

    let { route }: { route: string } = $props();

    let breadCrumbs = $derived(route.split('/')?.filter((item) => item !== ''));
    let parentRoute = $derived(
        breadCrumbs.length > 1 ? `/${breadCrumbs.slice(0, -1).join('/')}` : null
    );

    function goBack() {
        if (parentRoute) {
            goto(parentRoute);
        }
    }

    const {toggle} = useSidebar()
</script>

<header
    class="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear"
>
    <div class="flex items-center gap-2 px-4">
        <Button
            data-slot="sidebar-trigger"
            variant="outline"
            size="icon"
            onclick={toggle}
            aria-label="Go back"
        >
            <PanelLeftIcon class="h-4 w-4" />
            <span class="sr-only">Toggle Sidebar</span>
        </Button>
        <Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-7" />
        <Button
            variant="outline"
            size="icon"
            onclick={goBack}
            disabled={!parentRoute}
            aria-label="Go back"
        >
            <ArrowLeft class="h-4 w-4" />
        </Button>
        <Card.Root class="py-1.5 px-3 rounded-md shadow-sm">
            <Breadcrumb.Root>
                {#if breadCrumbs.length > 0}
                    <Breadcrumb.List>
                        {#each breadCrumbs as breadCrumb, index (index)}
                            <Breadcrumb.Item>
                                {#if index === breadCrumbs.length - 1}
                                    <Breadcrumb.Page class="first-letter:capitalize tracking-wider">
                                        {breadCrumb}
                                    </Breadcrumb.Page>
                                {:else}
                                    <Breadcrumb.Link
                                        href={`/${breadCrumbs.slice(0, index + 1).join('/')}`}
                                        class="first-letter:capitalize tracking-wider"
                                    >
                                        {breadCrumb}
                                    </Breadcrumb.Link>
                                {/if}
                            </Breadcrumb.Item>
                            {#if index < breadCrumbs.length - 1}
                                <Breadcrumb.Separator />
                            {/if}
                        {/each}
                    </Breadcrumb.List>
                {/if}
            </Breadcrumb.Root>
        </Card.Root>
    </div>
</header>
