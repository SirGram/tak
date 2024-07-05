import { create } from 'zustand';
import {
  BoardSize,
  Piece,
  PieceColor,
  PieceType,
  Position,
  TBoard,
  Tile,
} from '../../../common/types';
import { DFS } from '../utils/utils';

const createTile = (position: Position): Tile => {
  return {
    pieces: [],
    position,
  };
};

export function createPiece(
  id: string,
  type: PieceType,
  color: PieceColor,
): Piece {
  return {
    id,
    type,
    color,
  };
}

export function initializeBoard(size: BoardSize): TBoard {
  const initialBoard: TBoard = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const tile = createTile({ x, y });
      initialBoard.push(tile);
    }
  }
  return initialBoard;
}

export function initializePieces(size: BoardSize): Piece[] {
  const initialPieces: Piece[] = [];
  let numberOfWhitestones = 0;
  let numberOfBlackstones = 0;
  let numberOfWhiteCapstones = 0;
  let numberOfBlackCapstones = 0;

  if (size === 5) {
    numberOfWhitestones = 21;
    numberOfBlackstones = 21;
    numberOfWhiteCapstones = 1;
    numberOfBlackCapstones = 1;
  } else if (size === 6) {
    numberOfWhitestones = 30;
    numberOfBlackstones = 30;
    numberOfWhiteCapstones = 2;
    numberOfBlackCapstones = 2;
  } else {
    numberOfWhitestones = 15;
    numberOfBlackstones = 15;
    numberOfWhiteCapstones = 0;
    numberOfBlackCapstones = 0;
  }

  let idCounter = 1;

  for (let i = 0; i < numberOfWhitestones; i++) {
    initialPieces.push({
      id: `${idCounter++}`,
      type: 'flatstone',
      color: 'white',
    });
  }

  for (let i = 0; i < numberOfBlackstones; i++) {
    initialPieces.push({
      id: `${idCounter++}`,
      type: 'flatstone',
      color: 'black',
    });
  }
  for (let i = 0; i < numberOfWhiteCapstones; i++) {
    initialPieces.push({
      id: `${idCounter++}`,
      type: 'capstone',
      color: 'white',
    });
  }

  for (let i = 0; i < numberOfBlackCapstones; i++) {
    initialPieces.push({
      id: `${idCounter++}`,
      type: 'capstone',
      color: 'black',
    });
  }

  return initialPieces;
}

export function getTile(position: Position | null, tiles: TBoard): Tile | null {
  if (!position) return null;
  const tile = tiles.find(
    (tile) => tile.position.x === position.x && tile.position.y === position.y,
  );
  return tile ? tile : null;
}

/* 

function checkGameOver() {
    const playerColor = currentPlayer;
    const enemyColor = currentPlayer === 'white' ? 'black' : 'white';

    const whiteFlatstones = getFlatstones(tiles, 'white', pieces);
    const blackFlatstones = getFlatstones(tiles, 'black', pieces);
    setFlatstones({ white: whiteFlatstones, black: blackFlatstones });

   
} 

export function isAnyPlayerWithoutPieces(pieces: Piece3D[]): boolean {
    let whiteHasPieces = false;
    let blackHasPieces = false;

    for (const piece of pieces) {
        if (piece.selectable) {
            if (piece.color === 'white') {
                whiteHasPieces = true;
            } else if (piece.color === 'black') {
                blackHasPieces = true;
            }
        }
        if (whiteHasPieces && blackHasPieces) {
            break; // No need to continue checking
        }
    }

    return !whiteHasPieces || !blackHasPieces;
}
    
*/
export function checkRoadWin(
  tiles: Tile[],
  color: PieceColor,
  pieces: Piece[],
): boolean {
  const BoardSize = Math.sqrt(tiles.length);
  const grid: number[][] = [];

  for (let i = 0; i < BoardSize; i++) {
    grid[i] = [];
    for (let j = 0; j < BoardSize; j++) {
      grid[i][j] = 0;
    }
  }

  tiles.forEach((tile) => {
    const lastPiece: Piece | null =
      tile.pieces.length > 0
        ? getPiece(tile.pieces[tile.pieces.length - 1], pieces)
        : null;

    if (lastPiece?.color == color) {
      grid[tile.position.x][tile.position.y] = 1;
    }
  });

  console.log(tiles, grid, BoardSize);

  const isRoad = DFS(grid);

  return isRoad;
}

export function isBoardFull(tiles: TBoard): boolean {
  return tiles.every((tile) => tile.pieces.length > 0);
}

function getTileFromPiece(pieceId: string, tiles: TBoard): Tile | null {
  return tiles.find((tile) => tile.pieces.includes(pieceId)) ?? null;
}

function getPiece(pieceId: string, pieces: Piece[]): Piece | null {
  const piece = pieces.find((p) => p.id === pieceId);
  return piece ?? null;
}

export function getFlatstones(
  tiles: Tile[],
  color: PieceColor,
  pieces: Piece[],
): number {
  let number = 0;
  tiles.forEach((tile: Tile) => {
    const lastTilePiece = getPiece(tile.pieces[tile.pieces.length - 1], pieces);
    if (lastTilePiece?.color == color && lastTilePiece.type == 'flatstone')
      number += 1;
  });
  return number;
}

export function isAnyPlayerWithoutPieces(
  pieces: Piece[],
  board: TBoard,
): boolean {
  let whiteHasPieces = false;
  let blackHasPieces = false;

  // Check if any pieces are on the board
  pieces.forEach((piece) => {
    const tile = getTileFromPiece(piece.id, board);
    if (tile) {
      if (piece.color === 'white') {
        whiteHasPieces = true;
      } else if (piece.color === 'black') {
        blackHasPieces = true;
      }
    }
  });

  // Check if either player has no pieces
  return !whiteHasPieces || !blackHasPieces;
}
