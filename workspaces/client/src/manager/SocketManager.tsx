import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Message, useSocketStore } from '../store/SocketStore';
import { useToast } from '../components/ui/use-toast';
import { GameMode, Move, Piece, Player, ServerGameState } from '../../../common/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket = io(SOCKET_URL, {
    transports: ['websocket'], // use webSocket only
});

export const SocketManager = () => {
    const {
        setGameState,
        setMessages,
        setRoom,
        setUsername,
        setPlayerColor,
        playerColor,
        username,
    } = useSocketStore();

    const { toast } = useToast();

    console.log(playerColor);

    const playerColorRef = useRef(playerColor);

    useEffect(() => {
        playerColorRef.current = playerColor;
    }, [playerColor]);

    useEffect(() => {
        socket.on(
            'roomJoined',
            (joinedRoomId: string, username: string, color: Player, gameState: ServerGameState) => {
                sendMessage(joinedRoomId, `${username} joined the room`, `System`);
                setRoom(joinedRoomId);
                setUsername(username);
                setPlayerColor(color);
                setGameState(gameState);
                toast({
                    title: `Successfully joined room ${joinedRoomId}`,
                    description: `${username} playing as ${color} `,
                    variant: 'default',
                });
            }
        );

        socket.on('roomFull', (fullRoomId: string) => {
            toast({
                title: "Can't join room",
                description: `Room ${fullRoomId} is full`,
                variant: 'destructive',
            });
        });

        socket.on('gameUpdated', (gameState: ServerGameState) => {
            setGameState(gameState);
            console.log(gameState);
        });

        socket.on('messagePosted', (messages: Message[]) => {
            setMessages(messages);
        });

        socket.on('roomLeft', () => {
            setRoom(null);
            setUsername(null);
            setPlayerColor(null);
            setGameState(null);
            toast({
                title: 'Left the room',
                description: 'You have successfully left the room',
                variant: 'default',
            });
        });

        socket.on('playAgainVote', ({ usernameVote }) => {
            if (username === usernameVote) {
                toast({
                    title: 'Play Again Vote',
                    description: `Vote sent. Waiting for the other users to vote.`,
                    variant: 'default',
                });
            } else {
                toast({
                    title: 'Play Again Vote',
                    description: `${usernameVote} wants to play again.`,
                    variant: 'default',
                });
            }
        });

        return () => {
            socket.off('roomJoined');
            socket.off('roomFull');
            socket.off('startGame');
            socket.off('messagePosted');
            socket.off('roomLeft');
            socket.off('playAgainVote');
        };
    }, [setMessages, setRoom, playerColor, setPlayerColor]);
};

export function joinRoom(roomId: string, username: string, mode: GameMode) {
    socket.emit('joinRoom', roomId, username, mode);
}

export function leaveRoom(roomId: string) {
    socket.emit('leaveRoom', roomId);
}

export function sendMessage(roomId: string, content: string, username?: string) {
    socket.emit('chatMessage', roomId, username, content);
    console.log(roomId, content, username);
}

export function selectStack(roomId: string, pieces: Piece[]) {
    socket.emit('selectStack', roomId, pieces);
}

export function makeMove(roomId: string, move: Move) {
    socket.emit('makeMove', roomId, move);
    console.log('making move', move);
}

export function changePieceStand(roomId: string, pieceId: string) {
    socket.emit('changePieceStand', roomId, pieceId);
}

export function playAgain(roomId: string, username: string) {
    socket.emit('playAgain', roomId, username);
}
