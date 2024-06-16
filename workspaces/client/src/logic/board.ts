import { Piece3D, PieceArgs, Position, Tile } from '.';

export type TBoard = Tile[];
export type BoardSize = 3 | 4 | 5 | 6;

export const initialPieces: Piece3D[] = [
    // Player 1 black stones
    {
        id: '1',
        model: 'Blackstone',
        position: [-2, 0, 0],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },
    {
        id: '2',
        model: 'Blackstone',
        position: [-2, 0, 1],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },

    // Player 2 white stones
    {
        id: '5',
        model: 'Whitestone',
        position: [6, 0, 4],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },
    {
        id: '6',
        model: 'Whitestone',
        position: [6, 0, 3],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },

    {
        id: '7',
        model: 'Whitestone',
        position: [6, 0, 3],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },

    // Player 1 white capstone
    {
        id: '9',
        model: 'Whitecapstone',
        position: [6, 0, 2],
        type: 'capstone',
        selectable: true,
        height: 0.8,
    },

    // Player 2 black capstone
    {
        id: '10',
        model: 'Blackcapstone',
        position: [-2, 0, 2],
        type: 'capstone',
        selectable: true,
        height: 0.8,
    },
];
export const demoPieces: Piece3D[] = [
    // Player 1 black stones
    {
        id: '1',
        model: 'Blackstone',
        position: [2, 0.25, 0],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },
    {
        id: '2',
        model: 'Blackstone',
        position: [2, 0.25, 1],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },

    // Player 2 white stones
    {
        id: '5',
        model: 'Whitestone',
        position: [3, 0.25, 4],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },
    {
        id: '6',
        model: 'Whitestone',
        position: [3, 0.25, 3],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },

    {
        id: '7',
        model: 'Whitestone',
        position: [3, 0.25, 3],
        type: 'flatstone',
        selectable: true,
        height: 0.25,
    },

    // Player 1 white capstone
    {
        id: '9',
        model: 'Whitecapstone',
        position: [4, 1, 2],
        type: 'capstone',
        selectable: true,
        height: 0.8,
    },

    // Player 2 black capstone
    {
        id: '10',
        model: 'Blackcapstone',
        position: [3, 1, 4],
        type: 'capstone',
        selectable: true,
        height: 0.8,
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
        }) || null;

    return tile;
}

export function getPiece(pieceId: string, pieces: Piece3D[]): Piece3D | null {
    return (
        pieces.find((p) => {
            return p.id === pieceId;
        }) || null
    );
}

export function isTileEmpty(position: Position, tiles: TBoard): boolean {
    const tile = getTile(position, tiles);
    return tile?.pieces.length === 0;
}
