import { TrayIcon, type TrayIconOptions } from '@tauri-apps/api/tray';
import { createMainMenu } from '$lib/services/tray/menu';
import { resourceDir } from '@tauri-apps/api/path';

export let tray: TrayIcon | null = null;

async function getTrayOptions(): Promise<TrayIconOptions> {
    return {
        icon: `${await resourceDir()}/icons/icon.iconset/icon_512x512@2x.png`,
        tooltip: 'Container Kit',
        showMenuOnLeftClick: true,
        menu: await createMainMenu()
    };
}

export async function createTray() {
    if (tray) {
        return tray;
    }
    tray = await TrayIcon.new(await getTrayOptions());
    return tray;
}

export async function destroyTray(): Promise<void> {
    await tray?.close();
}
