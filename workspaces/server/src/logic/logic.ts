import {
  BoardSize,
  Piece3D,
  Position,
  TBoard,
  Tile,
} from '../../../shared/types';

const pieceHeights: Record<string, number> = {
  flatstone: 0.22,
  capstone: 0.65,
};

export const initialPieces: Piece3D[] = [
  // Player 1 black stones (stacked vertically)
  ...(Array.from({ length: 21 }, (_, i) => ({
    id: (i + 1).toString(),
    model: 'Blackstone',
    position: [-2, 0, i * pieceHeights.flatstone + 0.5],
    type: 'standingstone',
    selectable: true,
    height: pieceHeights.flatstone,
    color: 'black',
    invisible: false,
  })) as Piece3D[]),

  // Player 2 white stones (stacked vertically)
  ...(Array.from({ length: 21 }, (_, i) => ({
    id: (i + 22).toString(),
    model: 'Whitestone',
    position: [6, 0, i * pieceHeights.flatstone - 1],
    type: 'standingstone',
    selectable: true,
    height: pieceHeights.flatstone,
    color: 'white',
    invisible: false,
  })) as Piece3D[]),

  // capstones
  {
    id: '43',
    model: 'Blackcapstone',
    position: [-2, 0, -0.5], // Place capstone on top of the black stones
    type: 'capstone',
    selectable: true,
    height: pieceHeights.capstone,
    color: 'black',
    invisible: false,
  },
  {
    id: '44',
    model: 'Whitecapstone',
    position: [6, 0, 4], // Place capstone on top of the black stones
    type: 'capstone',
    selectable: true,
    height: pieceHeights.capstone,
    color: 'white',
    invisible: false,
  },
];

const createTile = (position: Position): Tile => {
  return {
    pieces: [],
    position,
  };
};

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

export function updatePieces(
  updatedPieces: Piece3D[],
  pieces: Piece3D[],
): Piece3D[] {
  return pieces.map(
    (piece) =>
      updatedPieces.find((updated) => updated.id == piece.id) ?? piece,
  );
}

/* 


    placePiece(pieceId, position) {
        set((state) => ({
            tiles: state.tiles.map((tile) =>
                tile.position.x === position.x && tile.position.y === position.y
                    ? { ...tile, pieces: [...tile.pieces, pieceId] }
                    : tile
            ),
        }));
    },
    movePiece(pieceId: string, newPosition: Position) {
        set((state) => {
            const currentTileIndex = state.tiles.findIndex((tile) => tile.pieces.includes(pieceId));
            if (currentTileIndex === -1) {
                return state;
            }

            const targetTileIndex = state.tiles.findIndex(
                (tile) => tile.position.x === newPosition.x && tile.position.y === newPosition.y
            );

            if (targetTileIndex === -1) {
                return state;
            }

            const updatedTiles = [...state.tiles];

            // Find the index of the piece within the current tile
            const pieceIndex = updatedTiles[currentTileIndex].pieces.indexOf(pieceId);

            // If the piece is found within the current tile, move it
            if (pieceIndex !== -1) {
                // Remove the piece from the current tile
                updatedTiles[currentTileIndex].pieces.splice(pieceIndex, 1);
                // Add the piece to the target tile
                updatedTiles[targetTileIndex].pieces.push(pieceId);
            }

            // Return the new state with updated tiles
            return { tiles: updatedTiles };
        });
    },

function checkRound() {
    const playerColor = currentPlayer;
    const enemyColor = currentPlayer === 'white' ? 'black' : 'white';

    const whiteFlatstones = getFlatstones(tiles, 'white', pieces);
    const blackFlatstones = getFlatstones(tiles, 'black', pieces);
    setFlatstones({ white: whiteFlatstones, black: blackFlatstones });

    //check roads
    const playerWin = checkRoadWin(tiles, playerColor, pieces);
    if (!playerWin) {
        const enemyWin = checkRoadWin(tiles, enemyColor, pieces);
        if (enemyWin) {
            setWinner(enemyColor);
            return;
        }
    } else {
        setWinner(playerColor);
        return;
    }

    //check empty tiles and selectable pieces
    const boardFull = isBoardFull(tiles);
    const playerWithNoPieces = isAnyPlayerWithoutPieces(pieces);
    console.log(boardFull, playerWithNoPieces);
    if (boardFull || playerWithNoPieces) {
        if (whiteFlatstones > blackFlatstones) setWinner('white');
        else if (whiteFlatstones < blackFlatstones) setWinner('black');
        else setWinner('tie');
        console.log(boardFull, whiteFlatstones, blackFlatstones);
    }
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
    
export function checkRoadWin(tiles: Tile[], color: PieceColor, pieces: Piece3D[]): boolean {
    const BoardSize = Math.sqrt(tiles.length);
    const grid: number[][] = [];

    for (let i = 0; i < BoardSize; i++) {
        grid[i] = [];
        for (let j = 0; j < BoardSize; j++) {
            grid[i][j] = 0;
        }
    }

    tiles.forEach((tile) => {
        const lastPiece: Piece3D | null =
            tile.pieces.length > 0 ? getPiece(tile.pieces[tile.pieces.length - 1], pieces) : null;

        if (lastPiece?.color == color) {
            grid[tile.position.x][tile.position.y] = 1;
        }
    });

    console.log(tiles, grid, BoardSize);

    const isRoad = DFS(grid);

    return isRoad;
}
*/
