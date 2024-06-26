import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSocketStore } from '../store/SocketStore';
import { useToast } from '../components/ui/use-toast';
import { GameState, Piece3D, Player } from '../../../common/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket = io(SOCKET_URL, {
    transports: ['websocket'], // use webSocket only
});

export const SocketManager = () => {
    const { setGameState, addMessage, setRoom, setUsername, setPlayerColor, playerColor } =
        useSocketStore();

    const { toast } = useToast();

    console.log(playerColor);

    const playerColorRef = useRef(playerColor);

    useEffect(() => {
        playerColorRef.current = playerColor;
    }, [playerColor]);

    useEffect(() => {
        socket.on('roomJoined', (joinedRoomId: string, username: string, color: Player, gameState: GameState) => {
            sendMessage(joinedRoomId, `${username} joined the room`);
            setRoom(joinedRoomId);
            setUsername(username);
            setPlayerColor(color);
            setGameState(gameState);
            toast({
                title: `Successfully joined room ${joinedRoomId}`,
                description: `${username} playing as ${color} `,
                variant: 'default',
            });
        });

        socket.on('roomFull', (fullRoomId: string) => {
            toast({
                title: "Can't join room",
                description: `Room ${fullRoomId} is full`,
                variant: 'destructive',
            });
        });

        socket.on('gameUpdated', (gameState: GameState) => {
            if (gameState.roundNumber === 1) {
                setGameState(gameState);
            } else if (gameState.currentPlayer === playerColorRef.current) {
                setGameState(gameState);
            }
            // update opponent board
            console.log('updating for opponent', playerColorRef.current);
        });

        socket.on('messagePosted', (message: { username: string; content: string }) => {
            console.log(message);
            addMessage(message);
        });

        return () => {
            socket.off('roomJoined');
            socket.off('roomFull');
            socket.off('startGame');
            socket.off('messagePosted');
        };
    }, [addMessage, setRoom, playerColor, setPlayerColor]);
};

export function joinRoom(roomId: string, username: string) {
    socket.emit('joinRoom', roomId, username);
}

export function sendMessage(roomId: string, content: string, username?: string) {
    socket.emit('chatMessage', roomId, username, content);
}

export function makeMove(roomId: string, pieces: Piece3D[]) {
    socket.emit('makeMove', roomId, pieces);
    console.log('making move', pieces);
}
