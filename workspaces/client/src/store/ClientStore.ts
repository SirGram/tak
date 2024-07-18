import create from 'zustand';
import { GameMode } from '../../../common/types';
import { useSettingsStore } from './SettingsStore';

interface BoardSelections {
    showMove: number;
    setShowMove: (value: number) => void;
}

interface BoardSettings {
    getSelectedColor: () => string;
    mode: GameMode;
    setMode: (mode: GameMode) => void;
}

export const useClientStore = create<BoardSelections & BoardSettings>((set, get) => ({
    showMove: 0,
    setShowMove: (value) => {
        set({ showMove: value });
    },
    getSelectedColor: () => {
        const { lightTheme } = useSettingsStore.getState();
        return lightTheme ? '#ca8300ff' : '#ffe873'; // Example colors for light and dark themes
    },
    mode: 'multiplayer',
    setMode: (value) => {
        set({ mode: value });
    },
}));