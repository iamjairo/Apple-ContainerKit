<script lang="ts">
    import Setup from './(components)/setup.svelte';
    import { hasContainerCli } from '$lib/services/containerization/setup';
    import { onMount } from 'svelte';
    // create symlink
    // create default network
    // create default dns
    onMount(async () => {
        await hasContainerCli();
    });
</script>

<Setup />
