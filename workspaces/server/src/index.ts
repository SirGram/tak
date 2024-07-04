import { Server, Socket } from 'socket.io';
import { Move, Piece, ServerGameState, TBoard, Tile } from '../../common/types';
import { initialGameState } from './state/state';
import express from 'express';

import http from 'http';
import path from 'path';
import { getTile } from './logic/logic';

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
  gameState: ServerGameState;
  messages: { username: string; content: string }[];
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

  socket.on('selectStack', (roomId, pieces) => {
    handleSelectStack(roomId, pieces);
  });
  socket.on('makeMove', (room, move) => {
    handleMakeMove(room, move);
  });
  socket.on('changePieceStand', (roomId, pieceId, stand) => {
    handleChangePieceStand(roomId, pieceId);
  });
});

const handleJoinRoom = (socket: any, roomId: string, username: string) => {
  // Create or join room
  if (!rooms[roomId]) {
    rooms[roomId] = {
      id: roomId,
      players: [],
      gameState: JSON.parse(JSON.stringify(initialGameState)), // deep copy
      messages: [],
    };

    console.log(`Created room ${roomId}`);
  }

  // Check room space
  if (rooms[roomId].players.length < 2) {
    rooms[roomId].players.push(socket.id);
    socket.join(roomId);

    // Determine player color based on number of players
    const playerColor = rooms[roomId].players.length === 1 ? 'white' : 'black';
    socket.emit(
      'roomJoined',
      roomId,
      username,
      playerColor,
      rooms[roomId].gameState,
    );
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
    room.messages.push(chatMessage);
    io.to(roomId).emit('messagePosted', room.messages);
  }
};

const handleSelectStack = (roomId: string, pieces: Piece[]) => {
  const room = rooms[roomId];
  room.gameState.selectedStack = pieces;

  io.to(roomId).emit('gameUpdated', room.gameState);
};

const handleMakeMove = (roomId: string, move: Move) => {
  const room = rooms[roomId];
  if (!room) return;

  const gameState = room.gameState;
  let updatedTiles = [...gameState.tiles];

  if (move.from === null) {
    // Place a new piece on the board
    updatedTiles = updatedTiles.map((tile) => {
      if (tile.position.x === move.to.x && tile.position.y === move.to.y) {
        return { ...tile, pieces: [...tile.pieces, move.stack[0].id] };
      }
      return tile;
    });
  } else {
    // Move piece(s) on the board
    const fromTile = getTile(move.from, updatedTiles);
    const toTile = getTile(move.to, updatedTiles);

    if (!fromTile || !toTile) return;

    // Remove stack pieces from the source tile
    fromTile.pieces = fromTile.pieces.filter(
      (pieceId) => !move.stack.some((stackPiece) => stackPiece.id === pieceId),
    );

    // capstone -> standingstone
    const lastPieceInStack = move.stack[move.stack.length - 1];
    const topPieceId = toTile.pieces[toTile.pieces.length - 1];
    const topPiece = gameState.pieces.find((piece) => piece.id === topPieceId);
    if (
      lastPieceInStack.type === 'capstone' &&
      topPiece?.type === 'standingstone'
    ) {
      topPiece.type = 'flatstone';
    }

    // Add stack pieces to the destination tile
    move.stack.forEach((stackPiece) => {
      if (!toTile.pieces.includes(stackPiece.id)) {
        toTile.pieces.push(stackPiece.id);
      }
    });

    // Update the tiles in the updatedTiles array
    updatedTiles = updatedTiles.map((tile) => {
      if (
        tile.position.x === fromTile.position.x &&
        tile.position.y === fromTile.position.y
      ) {
        return fromTile;
      }
      if (
        tile.position.x === toTile.position.x &&
        tile.position.y === toTile.position.y
      ) {
        return toTile;
      }
      return tile;
    });
  }
  room.gameState.tiles = updatedTiles;
  // remove last piece from stack
  room.gameState.selectedStack.pop();
  // change turn if stack is empty
  if (room.gameState.selectedStack.length === 0) {
    room.gameState = roundOver(gameState);
  }

  sendGameUpdate(roomId, room.gameState);
  console.log(gameState);
};

const handleChangePieceStand = (roomId: string, pieceId: string) => {
  const room = rooms[roomId];
  if (!room) return;

  const gameState = room.gameState;
  let updatedPieces = [...gameState.pieces];

  const piece = updatedPieces.find((piece) => piece.id === pieceId);
  if (!piece) return;
  if (piece.type === 'standingstone') piece.type = 'flatstone';
  else if (piece.type === 'flatstone') piece.type = 'standingstone';
  updatedPieces = updatedPieces.map((piece) => {
    if (piece.id === pieceId) {
      return piece;
    }
    return piece;
  });
  room.gameState.pieces = updatedPieces;
  sendGameUpdate(roomId, room.gameState);
};

const roundOver = (gameState: ServerGameState) => {
  const updatedGameState = gameState;
  const nextPlayer: 'white' | 'black' =
    updatedGameState.currentPlayer === 'white' ? 'black' : 'white';
  const nextRoundNumber =
    updatedGameState.currentPlayer === 'black'
      ? updatedGameState.roundNumber + 1
      : updatedGameState.roundNumber;
  updatedGameState.currentPlayer = nextPlayer;
  updatedGameState.roundNumber = nextRoundNumber;

  return updatedGameState;
};
const sendGameUpdate = (roomId: string, gameState: ServerGameState) => {
  io.to(roomId).emit('gameUpdated', gameState);
};
