import create from 'zustand';
import {  TBoard } from '../logic/board';
import { Piece3D } from '../logic';
import { Color } from '@react-three/fiber';

type Player = 'black' | 'white';
type GameState = {
    gameStarted: boolean;
    setGameStarted: (value: boolean) => void;
    currentPlayer: Player;
    switchPlayer: () => void;
    stack: Piece3D[] | null;
    setStack: (value: Piece3D[]) => void;
    selectedColor: Color;
    
};

type GameSettings = {
    boardSize: 3 | 4 | 5 | 6;
};

export const useGlobalState = create<GameState & GameSettings>()((set) => ({
    gameStarted: false,
    setGameStarted: (value: boolean) => set({ gameStarted: value }),

    currentPlayer: 'black',
    switchPlayer: () =>
        set((state) => ({ currentPlayer: state.currentPlayer === 'black' ? 'white' : 'black' })),
    boardSize: 5,
    stack: null,
    setStack: (newStack) => set({ stack: newStack }),
    selectedColor: 'red',
}));
