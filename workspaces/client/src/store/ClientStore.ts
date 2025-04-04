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

export const useClientStore = create<BoardSelections & BoardSettings>((set) => ({
    showMove: 0,
    setShowMove: (value) => {
        set({ showMove: value });
    },
    getSelectedColor: () => {
        const { lightTheme } = useSettingsStore.getState();
        return lightTheme ? '#973BDD' : '#FF5B3B';
    },
    mode: 'multiplayer',
    setMode: (value) => {
        set({ mode: value });
    },
}));