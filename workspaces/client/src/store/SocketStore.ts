import { create } from 'zustand';
import { GameState } from '../../../shared/types';


type Player = 'white' | 'black';    

interface Message {
    username?: string;
    content: string;
}

interface SocketState {
    messages: Message[];
    addMessage: (message: Message) => void;
    room: string | undefined;
    setRoom: (roomId: string) => void;
    username: string | null;
    setUsername: (value: string | null) => void;
    opponentUsername: string | null;
    setOpponentUsername: (value: string | null) => void;
    playerColor: Player | null;
    setPlayerColor: (value: Player | null) => void;
    
    gameState: GameState | null;
    setGameState: (value: GameState | null) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
    messages: [],
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    room: undefined,
    setRoom: (roomId) => set({ room: roomId }),
    username: null,
    setUsername: (value) => set({ username: value }),
    opponentUsername: null,
    setOpponentUsername: (value) => set({ opponentUsername: value }),
    playerColor: null,
    setPlayerColor: (value) => set({ playerColor: value }),
    gameState: null,
    setGameState: (value) => set({ gameState: value }),
}));
