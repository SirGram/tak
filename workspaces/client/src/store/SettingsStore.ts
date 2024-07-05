import { create } from 'zustand';

interface Settings {
    lightTheme: boolean;
    audioEnabled: boolean;
    updateTheme: (value: boolean) => void;
    toggleAudio: () => void;
}

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('lightTheme');
    if (savedTheme !== null) {
        return JSON.parse(savedTheme);
    } else {
        return window.matchMedia('(prefers-color-scheme: light)').matches;
    }
};

const getInitialAudioSetting = () => {
    const savedAudioSetting = localStorage.getItem('audioEnabled');
    if (savedAudioSetting !== null) {
        return JSON.parse(savedAudioSetting);
    } else {
        return true;
    }
};

export const useSettingsStore = create<Settings>()((set) => ({
    lightTheme: getInitialTheme(),
    audioEnabled: getInitialAudioSetting(),
    updateTheme: (value: boolean) => {
        set({ lightTheme: value });
        localStorage.setItem('lightTheme', JSON.stringify(value));
    },
    toggleAudio: () => {
        set((state) => {
            const newAudioEnabled = !state.audioEnabled;
            localStorage.setItem('audioEnabled', JSON.stringify(newAudioEnabled));
            return { audioEnabled: newAudioEnabled };
        });
    },
}));
