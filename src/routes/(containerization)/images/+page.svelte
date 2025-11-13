<script lang="ts">
    import { getAllImages } from '$lib/services/containerization/images';
    import { onDestroy, onMount } from 'svelte';
    import type { ErrorLog } from '$lib/models/utils';
    import { toast } from 'svelte-sonner';
    import type { ContainerImage } from '$lib/models/container/image';
    import { columns } from './(components)/column.svelte';
    import ImageList from './(components)/image-list.svelte';
    import type { UnwatchFn } from '@tauri-apps/plugin-fs';
    import { watchImageChanges } from '$lib/services/fs-events/images';

    let error: ErrorLog | null = $state(null);
    let images: ContainerImage[] = $state([]);
    let imageDirChangesWatcher: UnwatchFn | null = $state(null)

    async function getImageList() {
        const output = await getAllImages();

        if (output.error) {
            toast.error('Unable to fetch images', {
                description: output.stderr
            });
            error = output;
            return;
        }

        if (!output.stdout) {
            toast.error('Unable to fetch images', {
                description: output.stderr
            });
            error = output;
            return;
        }
        images = JSON.parse(output.stdout) ?? [];
    }

    onMount(async () => {
        await getImageList();
        imageDirChangesWatcher = await watchImageChanges(getImageList, 500)
    });

    onDestroy(() => {
        if (imageDirChangesWatcher) imageDirChangesWatcher();
    })

    $inspect(images)
</script>

<div class="flex flex-1 flex-col">
    <div class="@container/main flex flex-1 flex-col gap-2">
        <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ImageList
                data={images}
                columns={columns()}
            />
        </div>
    </div>
</div>
