import { commands } from '$lib/models/bindings';

let defaultShellPromise: Promise<string> | null = null;

export function getDefaultShell(): Promise<string> {
    if (defaultShellPromise) {
        return defaultShellPromise;
    }

    defaultShellPromise = commands.getDefaultShell();

    return defaultShellPromise;
}

// To use:
// const shell = await getDefaultShell();
