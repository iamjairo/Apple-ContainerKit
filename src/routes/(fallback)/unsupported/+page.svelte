<script lang="ts">
    import UnsupportedPage from '$lib/components/pages/unsupported.svelte';
    import { isLoading } from '../../loading.svelte';

    isLoading.setFalse();
</script>

<UnsupportedPage />
