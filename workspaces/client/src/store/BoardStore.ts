import create from 'zustand';
import { Piece3D, Position, Tile } from '../logic';
import { demoPieces, initialPieces, initializeBoard } from '../logic/board';
import { Vector3 } from '@react-three/fiber';

export type TBoard = Tile[];
export type BoardSize = 3 | 4 | 5 | 6;

interface BoardStore {
    tiles: TBoard;    
    stack: Piece3D[] ;
    setStack: (value: Piece3D[]) => void;
    pieces: Piece3D[];
    selectedPiece: Piece3D | null;
    setSelectedPiece: (value: Piece3D | null) => void;
    possibleMoves: Position[];
    setPossibleMoves: (moves: Position[]) => void;
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
    
    stack: [],
    setStack: (newStack) => set({ stack: newStack }),

    boardSize: 5,
    pieces: initialPieces,
    selectedPiece: null,
    setSelectedPiece: (piece) => {
        set({ selectedPiece: piece });
    },
    possibleMoves: [],
    setPossibleMoves: (moves) => {
        set({ possibleMoves: moves });
    },
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
            const currentTileIndex = state.tiles.findIndex((tile) =>
                tile.pieces.includes(pieceId)
            );    
            if (currentTileIndex === -1) {
                return state;
            }    
    
            const targetTileIndex = state.tiles.findIndex((tile) =>
                tile.position.x === newPosition.x && tile.position.y === newPosition.y
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
    }
    
    
}));
