import { Server, Socket } from 'socket.io';
import { GameState, Piece3D } from '../../common/types';
import { initialGameState } from './state/state';
import { updatePieces } from './logic/logic';
import express from 'express';

import http from 'http';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8088/',
  },
});
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist'));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

interface Room {
  id: string;
  players: { id: string; username: string; color: 'white' | 'black' }[];
  gameState: GameState;
}
const rooms: Record<string, Room> = {};

io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('joinRoom', (roomId, username) => {
    handleJoinRoom(socket, roomId, username);
  });

  socket.on('leaveRoom', (roomId) => {
    handleLeaveRoom(socket, roomId);
  });

  socket.on('disconnect', () => {
    handleDisconnect(socket);
  });
  socket.on('chatMessage', (roomId, username, messageContent) => {
    handleChatMessage(socket, roomId, username, messageContent);
  });
  socket.on('makeMove', (room, move) => {
    handleMakeMove(room, move);
  });
});

const handleJoinRoom = (socket: any, roomId: string, username: string) => {
  // Create or join room
  if (!rooms[roomId]) {
    rooms[roomId] = {
      id: roomId,
      players: [],
      gameState: initialGameState,
    };

    console.log(`Created room ${roomId}`);
  }

  // Check room space
  if (rooms[roomId].players.length < 2) {
    rooms[roomId].players.push(socket.id);
    socket.join(roomId);

    // Determine player color based on number of players
    const playerColor = rooms[roomId].players.length === 1 ? 'white' : 'black';
    socket.emit('roomJoined', roomId, username, playerColor, rooms[roomId].gameState);
    console.log(`User ${username} joined room ${roomId} as ${playerColor}`);

    if (rooms[roomId].players.length === 2) {
      rooms[roomId].gameState.gameStarted = true;
    }
    console.log(rooms[roomId].players);
    sendGameUpdate(roomId, rooms[roomId].gameState);
  } else {
    socket.emit('roomFull', roomId);
  }
};

const handleLeaveRoom = (socket: any, roomId: string) => {
  if (rooms[roomId]) {
    rooms[roomId].players = rooms[roomId].players.filter(
      (id) => id !== socket.id,
    );
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);

    if (rooms[roomId].players.length === 0) {
      delete rooms[roomId];
    }
  }
};

const handleDisconnect = (socket: any) => {
  console.log('user disconnected');
  for (const roomId in rooms) {
    rooms[roomId].players = rooms[roomId].players.filter(
      (id) => id !== socket.id,
    );
    if (rooms[roomId].players.length === 0) {
      delete rooms[roomId];

      console.log(`Room ${roomId} deleted because it became empty`);
    }
  }
};

const handleChatMessage = (
  socket: Socket,
  roomId: string,
  username: string,
  content: string,
) => {
  const room = rooms[roomId];
  if (room) {
    const chatMessage = { username, content };
    io.to(roomId).emit('messagePosted', chatMessage);
  }
};

const handleMakeMove = (roomId: string, pieces: Piece3D[]) => {
  const room = rooms[roomId];

  if (room) {
    const newPieces = updatePieces(pieces, room.gameState.pieces);
    room.gameState = roundOver(room.gameState, newPieces);
    sendGameUpdate(roomId, room.gameState);
  }
  console.log(pieces);
};

const roundOver = (gameState: GameState, newPieces: Piece3D[]) => {
  const nextPlayer: 'white' | 'black' =
    gameState.currentPlayer === 'white' ? 'black' : 'white';
  const nextRoundNumber =
    gameState.currentPlayer === 'black'
      ? gameState.roundNumber + 1
      : gameState.roundNumber;
  const updatedGameState = {
    ...gameState,
    pieces: newPieces,
    history: [
      ...gameState.history,
      {
        tiles: gameState.tiles,
        pieces: newPieces,
      },
    ],
    roundNumber: nextRoundNumber,
    currentPlayer: nextPlayer,
  };

  return updatedGameState;
};
const sendGameUpdate = (roomId: string, gameState: GameState) => {
  io.to(roomId).emit('gameUpdated', gameState);
};
