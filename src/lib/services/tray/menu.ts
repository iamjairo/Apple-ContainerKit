import { Menu } from '@tauri-apps/api/menu';

export async function createMainMenu() {
    const menu = await Menu.new({
        items: [
            {
                id: 'quit',
                text: 'Quit',
                action: async () => {
                    console.log('Quit Pressed');
                }
            }
        ]
    });

    return menu;
}
