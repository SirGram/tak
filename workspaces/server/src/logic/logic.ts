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
export const checkRoadWin = (
  tiles: TBoard,
  color: PieceColor,
  pieces: Piece[],
): boolean => {
  const boardSize = Math.sqrt(tiles.length);
  const grid: number[][] = Array(boardSize)
    .fill(null)
    .map(() => Array(boardSize).fill(0));

  // Fill the grid based on the top pieces of each tile
  tiles.forEach((tile) => {
    if (tile.pieces.length > 0) {
      const topPieceId = tile.pieces[tile.pieces.length - 1];
      const topPiece = pieces.find((p) => p.id === topPieceId);
      if (
        topPiece &&
        topPiece.color === color &&
        topPiece.type !== 'standingstone'
      ) {
        grid[tile.position.y][tile.position.x] = 1;
      }
    }
  });

  // Use DFS to check for a road
  return DFS(grid);
};

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

export function isAnyPlayerWithoutPieces(pieces: Piece[], board: TBoard): boolean {
  let whiteHasPieces = false;
  let blackHasPieces = false;

  // Get all piece IDs that are on the board
  const piecesOnBoard = new Set(board.flatMap(tile => tile.pieces));

  // Check pieces that are not on the board
  for (const piece of pieces) {
    if (!piecesOnBoard.has(piece.id)) {
      if (piece.color === 'white') {
        whiteHasPieces = true;
      } else if (piece.color === 'black') {
        blackHasPieces = true;
      }
    }
    
    // If both players have pieces, we can stop checking
    if (whiteHasPieces && blackHasPieces) {
      return false;
    }
  }

  // If we've checked all pieces and either player doesn't have pieces, return true
  return !whiteHasPieces || !blackHasPieces;
}
