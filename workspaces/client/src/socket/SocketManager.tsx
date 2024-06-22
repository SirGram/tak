import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSocketStore } from '../store/SocketStore';
import { useToast } from '../components/ui/use-toast';
import { GameState, Piece3D, Player } from '../../../common/types';

export const socket = io('https://tak-server.fly.dev/');

export const SocketManager = () => {
    const { setGameState, addMessage, setRoom, setUsername, setPlayerColor } = useSocketStore();

    const { toast } = useToast();

    useEffect(() => {
        socket.on('roomJoined', (joinedRoomId: string, username: string, playerColor: Player) => {
            sendMessage(joinedRoomId, `${username} joined the room`);
            setRoom(joinedRoomId);
            setUsername(username);
            setPlayerColor(playerColor);
            toast({
                title: `Successfully joined room ${joinedRoomId}`,
                description: `${username} playing as ${playerColor} `,
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
            console.log('game updated', gameState);
            setGameState(gameState);
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
    }, [addMessage, setRoom]);
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
