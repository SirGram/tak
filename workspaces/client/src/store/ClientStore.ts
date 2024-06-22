import create from 'zustand';
import { Piece3D, Position, Tile } from '../../../common/types';

export type TBoard = Tile[];
export type BoardSize = 3 | 4 | 5 | 6;

interface BoardSelections {
    stack: Piece3D[];
    setStack: (value: Piece3D[]) => void;
    selectedPiece: Piece3D | null;
    setSelectedPiece: (value: Piece3D | null) => void;
    possibleMoves: Position[];
    setPossibleMoves: (moves: Position[]) => void;
    showRound: number;
    setShowRound: (value: number) => void;
}

interface BoardSettings {
    selectedColor: string;
    setSelectedColor: (color: string) => void;
}

export const useClientStore = create<BoardSelections & BoardSettings>((set) => ({
    stack: [],
    setStack: (newStack) => set({ stack: newStack }),

    selectedPiece: null,
    setSelectedPiece: (piece) => {
        set({ selectedPiece: piece });
    },
    possibleMoves: [],
    setPossibleMoves: (moves) => {
        set({ possibleMoves: moves });
    },
    selectedColor: '#ffffff',
    setSelectedColor: (color) => {
        set({ selectedColor: color });
    },

    showRound: 0,
    setShowRound: (value) => {
        set({ showRound: value });
    },
}));
