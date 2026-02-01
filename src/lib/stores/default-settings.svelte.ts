import { PersistedState } from 'runed';

export const defaultSettingsStore = new PersistedState('defaultSettings', {
    imageTarSavePath: '',
})