import { GameState, Piece3D, TBoard } from '../../../common/types';
import { initialPieces, initializeBoard } from '../logic/logic';

const boardSize = 5; 
const initialTiles = initializeBoard(boardSize); 

export const initialGameState: GameState = {
  gameStarted: false,
  gameOver: false,
  winner: null,
  currentPlayer: 'white',
  boardSize: boardSize,
  selectedColor: 'red',
  roundNumber: 1,
  flatstones: { white: 0, black: 0 },
  gameTime: 0,
  history: [{ tiles: initialTiles, pieces: initialPieces }],
  tiles: initialTiles,
  pieces: initialPieces,
};
