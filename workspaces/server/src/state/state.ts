import { Piece, ServerGameState, TBoard } from "../../../common/types";
import { initializeBoard, initializePieces } from "../logic/logic";

const boardSize = 5; 
const initialTiles = initializeBoard(boardSize); 
const initialPieces: Piece[] = initializePieces(boardSize);


export const initialGameState: ServerGameState = {
  gameStarted: false,
  gameOver: false,
  winner: null,
  currentPlayer: 'white',
  boardSize: boardSize,
  roundNumber: 1,
  gameTime: 0,
  history: [{ tiles: initialTiles, pieces: initialPieces }],
  tiles: initialTiles,
  pieces: initialPieces,
  selectedStack: [],
};
