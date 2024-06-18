import { BoardSize, useBoardStore } from './../store/BoardStore';
import { Piece3D,  PieceColor,  Position, Tile} from '.';
import { DFS } from '../utils/utils';

export type TBoard = Tile[];
export type BoardSize = 3 | 4 | 5 | 6;

const pieceHeights: Record<string, number> = {
    flatstone: 0.22,
    capstone: 0.65,
};

export const initialPieces: Piece3D[] = [
    // Player 1 black stones (stacked vertically)
    ...Array.from({ length: 21 }, (_, i) => ({
        id: (i + 1).toString(),
        model: "Blackstone",
        position: [-2, 0, i * pieceHeights.flatstone + 0.5],
        type: "standingstone",
        selectable: true,
        height: pieceHeights.flatstone,
        color: "black",
    })) as Piece3D[],

    // Player 2 white stones (stacked vertically)
    ...Array.from({ length: 21 }, (_, i) => ({
        id: (i + 22).toString(),
        model: 'Whitestone',
        position: [6, 0, (i * pieceHeights.flatstone) -1],
        type: 'standingstone',
        selectable: true,
        height: pieceHeights.flatstone,
        color: 'white',
    }))as Piece3D[],


    // capstones
    {
        id: '43',
        model: 'Blackcapstone',
        position: [-2, 0, -0.5], // Place capstone on top of the black stones
        type: 'capstone',
        selectable: true,
        height: pieceHeights.capstone,
        color: 'black',
    },
    {
        id: '44',
        model: 'Whitecapstone',
        position: [6, 0, 4], // Place capstone on top of the black stones
        type: 'capstone',
        selectable: true,
        height: pieceHeights.capstone,
        color: 'white',
    },
];
export const demoPieces: Piece3D[] = [
    // Player 1 black stones
    {
        id: '1',
        model: 'Blackstone',
        position: [2, 0.25, 0],
        type: 'flatstone',
        selectable: false,
        height: pieceHeights.flatstone,

        color: 'black',
    },
    {
        id: '2',
        model: 'Blackstone',
        position: [2, 0.25, 1],
        type: 'flatstone',
        selectable: false,
        height: pieceHeights.flatstone,

        color: 'black',
    },

    // Player 2 white stones
    {
        id: '5',
        model: 'Whitestone',
        position: [3, 0.25, 4],
        type: 'flatstone',
        selectable: false,
        height: pieceHeights.flatstone,
        color: 'white',
    },
    {
        id: '6',
        model: 'Whitestone',
        position: [3, 0.25, 3],
        type: 'flatstone',
        selectable: false,
        height: pieceHeights.flatstone,
        color: 'white',
    },

    {
        id: '7',
        model: 'Whitestone',
        position: [3, 0.25, 3],
        type: 'flatstone',
        selectable: false,
        height: pieceHeights.flatstone,
        color: 'white',
    },

    // Player 1 white capstone
    {
        id: '9',
        model: 'Whitecapstone',
        position: [4, 0.25, 2],
        type: 'capstone',
        selectable: false,
        height: pieceHeights.capstone,
        color: 'white',
    },

    // Player 2 black capstone
    {
        id: '10',
        model: 'Blackcapstone',
        position: [4, 0.25, 4],
        type: 'capstone',
        selectable: false,
        height: pieceHeights.capstone,
        color: 'black',
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

export function getTile(position: Position, tiles: TBoard): Tile | null {
    const tile =
        tiles.find((tile) => {
            return tile.position.x == position.x && tile.position.y == position.y;
        }) ?? null;

    return tile;
}

export function getTileFromPiece(pieceId: string, tiles: TBoard): Tile | null {
    return tiles.find(tile => tile.pieces.includes(pieceId)) ?? null;
}

export function getPiece(pieceId: string, pieces: Piece3D[]): Piece3D | null {
    return (
        pieces.find((p) => {
            return p.id === pieceId;
        }) ?? null
    );
}

export function isTileEmpty(position: Position, tiles: TBoard): boolean {
    const tile = getTile(position, tiles);
    return tile?.pieces.length === 0;
}

export function isPieceOnBoard(pieceId: string, tiles: TBoard): boolean {
    const isPiece = tiles.some((tile) => tile.pieces.includes(pieceId));
    console.log('is piece', isPiece, pieceId, tiles);
    return isPiece;
}


export function getAllBoardPositions(tiles: TBoard): Position[] {
    return tiles.map((tile) => tile.position);
}
export function getEmptyBoardPositions(tiles: TBoard): Position[] {
    return tiles.filter((tile) => tile.pieces.length === 0).map((tile) => tile.position);
}
export function isBoardFull(tiles: TBoard): boolean {
    return tiles.every((tile) => tile.pieces.length === 0)
}

export function calculateMoves(pieceId: string, tiles: TBoard, pieces: Piece3D[], directions:Position[]): Position[] {
    // piece not on  board
    if (!isPieceOnBoard(pieceId, tiles)) return getEmptyBoardPositions(tiles);
    //piece on board
    const pieceTile = tiles.find((tile) => tile.pieces.some((piece) => piece === pieceId));
    const possibleMoves: Position[] = [];
    const tilePosition = pieceTile?.position;
    const boardSize = Math.sqrt(tiles.length);
    if (!tilePosition) return possibleMoves;
    directions.forEach((direction) => {
        const newX = tilePosition.x + direction.x;
        const newY = tilePosition.y + direction.y;
        if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
            const targetTile = getTile({ x: newX, y: newY }, tiles);
            if (!targetTile) return;
            const originPiece = getPiece(pieceId, pieces);
            const lastPiece = getPiece(targetTile?.pieces[targetTile.pieces.length - 1], pieces);
            // origin: piece -> target: capstone
            if (lastPiece && lastPiece.type === 'capstone') return;
            // origin: flatstone -> target: standingstone
            if (originPiece?.type === 'flatstone' && lastPiece?.type === 'standingstone') return;
            possibleMoves.push({ x: newX, y: newY });
        }
    });
    return possibleMoves;
}


export function checkRoadWin(tiles: Tile[], color: PieceColor, pieces:Piece3D[]): boolean {
    const BoardSize = Math.sqrt(tiles.length);
    const grid: number[][] = [];

    for (let i = 0; i < BoardSize; i++) {
        grid[i] = [];
        for (let j = 0; j < BoardSize; j++) {
            grid[i][j] = 0;
        }
    }

    tiles.forEach(tile => {
        const lastPiece:Piece3D |null = tile.pieces.length > 0 ? getPiece(tile.pieces[tile.pieces.length - 1], pieces) :null
        
        if (lastPiece?.color == color) {
            grid[tile.position.x][tile.position.y] = 1;
        }
    });

    console.log(tiles,grid, BoardSize); 

    const isRoad = DFS(grid); 

    return isRoad;
}