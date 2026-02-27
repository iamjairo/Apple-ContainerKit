import { watchContainerDataDir } from '$lib/services/fs-events/watch';
import { isCreateEvent, isRemoveEvent, isDataModifyEvent } from '$lib/services/fs-events/utils';
import type { UnwatchFn, WatchEvent } from '@tauri-apps/plugin-fs';

/**
 * Watch for container changes (create, remove, or modify events)
 * @param callback - Function to call when container changes occur
 * @param delayMs - Debounce delay in milliseconds
 */
export async function watchContainerChanges(
    callback: () => void | Promise<void>,
    delayMs: number = 2000
): Promise<UnwatchFn> {
    return watchContainerDataDir(
        'containers',
        async (event: WatchEvent) => {
            if (isCreateEvent(event) || isRemoveEvent(event) || isDataModifyEvent(event)) {
                try {
                    await callback();
                } catch (error) {
                    console.error('Error in container changes callback:', error);
                }
            }
        },
        delayMs,
        true
    );
}

/**
 * Watch for container changes (create, remove, or modify events)
 * @param callback - Function to call when container changes occur
 * @param delayMs - Debounce delay in milliseconds
 * @param containerId - ID of the container to watch logs for
 */
export async function watchContainerLogFile(
    containerId: string,
    callback: () => void | Promise<void>,
    delayMs: number = 1000
): Promise<UnwatchFn> {
    const logFilePath = `containers/${containerId}/stdio.log`;
    console.log(logFilePath, 'logFilePath');
    return watchContainerDataDir(
        logFilePath,
        async (event: WatchEvent) => {
            console.log(`Received event for container log file ${logFilePath}:`, event);
            if (isDataModifyEvent(event) || isCreateEvent(event)) {
                try {
                    await callback();
                } catch (error) {
                    console.error(`Error in log file changes callback for container ${containerId}:`, error);
                }
            }
        },
        delayMs,
        false,
        true
    );
};

export async function watchContainerDir(containerId: string, callback: () => void | Promise<void>, delayMs: number = 500): Promise<UnwatchFn> {
    const containerDirPath = `containers/${containerId}`;
    console.log(containerDirPath, 'containerDirPath');
    return watchContainerDataDir(
        containerDirPath,
        async (event: WatchEvent) => {
            console.log(`Received event for container directory ${containerDirPath}:`, event);
            if (isCreateEvent(event) || isRemoveEvent(event) || isDataModifyEvent(event)) {
                try {
                    await callback();
                } catch (error) {
                    console.error(`Error in container directory changes callback for container ${containerId}:`, error);
                }
            }
        },
        delayMs,
        true,
        false
    );
}
