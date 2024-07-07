import create from 'zustand';
import { GameMode, Piece, Position, Tile } from '../../../common/types';

export type TBoard = Tile[];
export type BoardSize = 3 | 4 | 5 | 6;

interface BoardSelections {
    showMove: number;
    setShowMove: (value: number) => void;
}

interface BoardSettings {
    selectedColor: string;
    setSelectedColor: (color: string) => void;
    mode: GameMode;
    setMode: (mode: GameMode) => void;
}

export const useClientStore = create<BoardSelections & BoardSettings>((set) => ({
    selectedColor: '#ff7b00',
    setSelectedColor: (color) => {
        set({ selectedColor: color });
    },
    showMove: 0,
    setShowMove: (value) => {
        set({ showMove: value });
    },
    mode: 'multiplayer',
    setMode: (value) => {
        set({ mode: value });
    },
}));
