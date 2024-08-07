import { create } from 'zustand';
import type { ServerGameState } from '../../../common/types';

type Player = 'white' | 'black';

export interface Message {
    username?: string;
    content: string;
}

interface SocketState {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    room: string | null;
    setRoom: (roomId: string | null) => void;
    username: string | null;
    setUsername: (value: string | null) => void;
    opponentUsername: string | null;
    setOpponentUsername: (value: string | null) => void;
    playerColor: Player | null;
    setPlayerColor: (value: Player | null) => void;

    gameState: ServerGameState | null;
    setGameState: (value: ServerGameState | null) => void;
    resetSocketStore: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
    messages: [],
    setMessages: (messages) => set({ messages }),
    room: null,
    setRoom: (roomId) => set({ room: roomId }),
    username: null,
    setUsername: (value) => set({ username: value }),
    opponentUsername: null,
    setOpponentUsername: (value) => set({ opponentUsername: value }),
    playerColor: null,
    setPlayerColor: (value) => set({ playerColor: value }),
    gameState: null,
    setGameState: (value) => set({ gameState: value }),
    resetSocketStore: () =>
        set(
            {
                messages: [],
                room: null,
                username: null,
                opponentUsername: null,
                playerColor: null,
                gameState: null,
            },
            true
        ),
}));
