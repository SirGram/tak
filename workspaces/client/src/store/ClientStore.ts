import create from 'zustand';
import { Piece, Position, Tile } from '../../../common/types';

export type TBoard = Tile[];
export type BoardSize = 3 | 4 | 5 | 6;

interface BoardSelections {
    stack: Piece[];
    setStack: (value: Piece[]) => void;
    selectedPiece: Piece | null;
    setSelectedPiece: (value: Piece | null) => void;
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
