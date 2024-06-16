import create from 'zustand';
import { Piece3D, Position, Tile } from '../logic';
import { demoPieces, initialPieces, initializeBoard } from '../logic/board';
import { Vector3 } from '@react-three/fiber';

export type TBoard = Tile[];
export type BoardSize = 3 | 4 | 5 | 6;

interface BoardStore {
    tiles: TBoard;
    pieces: Piece3D[];
    changePieces: (updatedPieces: Piece3D[]) => void;
    changePiecePosition: (pieceId: string, newPosition: Vector3) => void;
    changePieceSelectable: (pieceId: string, value: boolean) => void;
    boardSize: BoardSize;
    resetBoard: (size: BoardSize) => void;
    placePiece: (pieceId: string, position: Position) => void;
    movePiece: (pieceId: string, newPosition: Position) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
    tiles: initializeBoard(5),
    boardSize: 5,
    pieces: demoPieces,
    changePieces: (updatedPieces) => {
        set({ pieces: updatedPieces });
    },
    changePiecePosition(pieceId, newPosition) {
        set((state) => ({
            pieces: state.pieces.map((piece) =>
                piece.id === pieceId ? { ...piece, position: newPosition } : piece
            ),
        }));
    },
    changePieceSelectable(pieceId, value) {
        set((state) => ({
            pieces: state.pieces.map((piece) =>
                piece.id === pieceId ? { ...piece, selectable: value } : piece
            ),
        }));
    },
    resetBoard(size: BoardSize) {
        const initialBoard = initializeBoard(5);
        set({ tiles: initialBoard });
    },

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
            const updatedTiles = state.tiles.map((tile) => {
                const pieceIndex = tile.pieces.findIndex((p) => p === pieceId);
                if (pieceIndex !== -1) {
                    const pieceToMove = tile.pieces.splice(pieceIndex, 1)[0];
                    const targetTile = state.tiles.find((t) => t.position === newPosition);
                    if (targetTile) {
                        targetTile.pieces.push(pieceToMove);
                    }
                }
                return tile;
            });
            return { tiles: updatedTiles };
        });
    },
}));
