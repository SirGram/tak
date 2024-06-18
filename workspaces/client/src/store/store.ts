import create from 'zustand';
import {  TBoard } from '../logic/board';
import { Piece3D } from '../logic';
import { Color } from '@react-three/fiber';

type Player = 'black' | 'white';
type TurnPhase = "pick" | "place" | "end"
interface GameState {
    gameStarted: boolean;
    setGameStarted: (value: boolean) => void;
    currentPlayer: Player;
    switchPlayer: () => void;
    selectedColor: Color;
    currentTurnPhase: TurnPhase;
    setCurrentTurnPhase: (value: TurnPhase) => void
    roundNumber: number;    
    setRoundNumber: (value: number) => void;
    gameOver: boolean;
    setGameOver: (value: boolean) => void;
    winner: Player | null;
    setWinner: (value:Player | null) => void
};

interface GameSettings  {
    boardSize: 3 | 4 | 5 | 6;
};

export const useGlobalState = create<GameState & GameSettings>()((set) => ({
    gameStarted: false,
    setGameStarted: (value) => set({ gameStarted: value }),
    gameOver: false,
    setGameOver: (value) => set({ gameOver: value }),
    winner: null,
    setWinner: (value) => set({ winner: value }),

    currentPlayer: 'white',
    switchPlayer: () =>
        set((state) => ({ currentPlayer: state.currentPlayer === 'black' ? 'white' : 'black' })),
    boardSize: 5,
    selectedColor: 'red',

    currentTurnPhase: "pick",
    setCurrentTurnPhase: (value) => set({ currentTurnPhase: value }) ,
    roundNumber: 1, 
    setRoundNumber: (value) => set({ roundNumber: value }) ,
}));
