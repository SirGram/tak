import { Fragment } from 'react/jsx-runtime';
import { BoardModel } from '../models/BoardModel';
import { Color, ThreeEvent } from '@react-three/fiber';
import { useClientStore } from '../store/ClientStore';
import {
    calculateMoves,
    calculatePieceHeight,
    getPiece,
    getTile,
    getTileFromPiece,
} from '../logic/board';
import { Candle } from '../models/Candle';
import Pieces from './Pieces';
import { makeMove } from '../socket/SocketManager';
import { useSocketStore } from '../store/SocketStore';
import { Piece3D, Position, Position3D, Tile } from '../../../common/types';
import { useEffect, useState } from 'react';

type TileProps = {
    position: [x: number, y: number, z: number];
    color: Color;
    onClick: (position: [x: number, y: number, z: number]) => void;
    isMovePossible: boolean;
};

function TileModel({ position, color, onClick, isMovePossible }: TileProps) {
    return (
        <group position={position}>
            {/* Box for the clickable area */}
            <mesh onClick={() => onClick(position)}>
                <boxGeometry args={[1, 0.1, 1]} />
                <meshStandardMaterial transparent={true} opacity={0} color={'white'} />
            </mesh>

            {/* Cylinder for the visual representation */}
            <mesh>
                <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />{' '}
                <meshStandardMaterial
                    color={isMovePossible ? color : '#ff0000'}
                    opacity={isMovePossible ? 0.5 : 0}
                    transparent={true}
                />
            </mesh>
        </group>
    );
}
function BoardTable() {
    return (
        <mesh position={[2, -0.29, 2]} receiveShadow>
            <boxGeometry args={[10, 0.1, 10]} />
            <meshStandardMaterial color={'#9F896C'} opacity={0.5} transparent={true} />
        </mesh>
    );
}

export default function Board() {
    const { room, playerColor, gameState } = useSocketStore();
    const { stack, setStack, showRound } = useClientStore();

    console.log(gameState);

    const [selectedPiece, setSelectedPiece] = useState<Piece3D | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);

    const directions = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
    ];
    const [allowedDirections, setAllowedDirections] = useState<Position[]>(directions);

    const canDoAction =
        playerColor === gameState?.currentPlayer && showRound == gameState.history.length - 1;

    const selectTileStack = (tile: Tile, pieces: Piece3D[]) => {
        const piecesToSelect = tile.pieces
            .map((pieceId: string) => pieces.find((piece) => piece.id === pieceId))
            .filter((piece: Piece3D | undefined ): piece is Piece3D => !!piece);

        if (piecesToSelect.length > 0) {
            //select stack where last piece is from player
            const isLastPieceFromPlayer =
                piecesToSelect[piecesToSelect.length - 1].color == playerColor;
            if (!isLastPieceFromPlayer) return;
            setStack(piecesToSelect.slice(-gameState!.boardSize));
        }
    };

    const updateAllowedDirections = (lastPosition: Position3D) => {
        const dx = lastPosition[0] - selectedPiece!.position[0];
        const dy = lastPosition[2] - selectedPiece!.position[2];

        const updatedAllowedDirection = [{ x: dx, y: dy }];
        // leave pieces below stack square
        updatedAllowedDirection.push({ x: 0, y: 0 });

        setAllowedDirections(updatedAllowedDirection);
    };

    function handleTileClick(position: Position3D) {
        if (!gameState || !canDoAction) return;
        if (selectedPiece) {
            handlePlacement(position);
        } else {
            handleSelection(position);
        }
    }

    const handleSelection = (position: Position3D) => {
        const tile = getTile({ x: position[0], y: position[2] }, gameState!.tiles);
        if (tile) {
            selectTileStack(tile, gameState!.pieces);
        }
    };

    const handlePlacement = (position: Position3D) => {
        if (!possibleMoves.some((move) => move.x === position[0] && move.y === position[2])) return;

        const tile = getTile({ x: position[0], y: position[2] }, gameState!.tiles);
        if (tile) {
            const tilePieces = tile.pieces
                .map((id: string) => gameState!.pieces.find((p) => p.id === id))
                .filter(Boolean) as Piece3D[];

            let newHeight = 0.25;
            const updatedPieces = [];
            if (!selectedPiece!.selectable) {
                // capstone -> standingstone
                if (tilePieces.length > 0) {
                    const needsFlattening =
                        selectedPiece!.type == 'capstone' &&
                        tilePieces[tilePieces.length - 1].type == 'standingstone';
                    if (needsFlattening)
                        updatedPieces.push(makeFlatstone(tilePieces[tilePieces.length - 1]));
                }
                stack.forEach((piece) => {
                    const newPosition: Position3D = [position[0], piece.position[1], position[2]];
                    if (piece.id !== selectedPiece!.id) {
                        const updatedPiece: Piece3D = { ...piece, position: newPosition };
                        updatedPieces.push(updatedPiece);
                    }
                });

                newHeight += calculatePieceHeight(selectedPiece!.id, tilePieces);
                // restrict stack movement direction
                updateAllowedDirections(position);
            }
            const newPosition: Position3D = [position[0], newHeight, position[2]];

            const updatedPiece: Piece3D = { ...selectedPiece!, position: newPosition };

            updatedPiece!.invisible = false;
            updatedPieces.push(updatedPiece!);

            handleMove(updatedPieces);
        }
    };

    const handleMove = (updatedPieces: Piece3D[]) => {
        if (room) {
            makeMove(room, updatedPieces);
        }
    };

/*     const shiftStack = (): number => {
        const updatedStack = [...stack];
        updatedStack.shift();
        setStack(updatedStack);
        return updatedStack.length;
    }; */

    function makeStackInvisible() {
        stack.forEach((piece) => {
            piece.invisible = true;
        });
    }
    function makeFlatstone(piece: Piece3D) {
        const updatedPiece: Piece3D = { ...piece, type: 'flatstone' };
        return updatedPiece;
    }

    function changePieceStand(piece: Piece3D): Piece3D {
        let newPiece = piece;
        if (piece.type == 'standingstone') {
            newPiece={ ...piece, type: 'flatstone' } as Piece3D;
        } else if (piece.type == 'flatstone') {
            newPiece= { ...piece, type: 'standingstone' }as Piece3D
        }
        return newPiece
    }

    const selectAbovePieces = (piece: Piece3D, pieces: Piece3D[]) => {
        const tile = getTileFromPiece(piece.id, gameState!.tiles);
        if (!tile) return;
        console.log(tile);
        //select stack if last piece is from player

        const pieceIndex = tile.pieces.indexOf(piece.id);
        // max stack size is boardsize
        if (tile.pieces.length - pieceIndex > gameState!.boardSize) return;
        const piecesToSelect = tile.pieces
            .slice(pieceIndex)
            .map((pieceId: string) => pieces.find((piece) => piece.id === pieceId))
            .filter((piece: Piece3D | undefined): piece is Piece3D => !!piece);

        if (piecesToSelect.length > 0) {
            setStack(piecesToSelect);
        }
        console.log(piecesToSelect);
    };

    function selectPiece(piece: Piece3D) {
        if (piece.color != playerColor) return
        console.log('selecting');
        // place rival piece 1st turn
        if (gameState!.roundNumber == 1) {
            // select only flatstones 1st turn
            if (piece.type == 'capstone') return;
            if (piece.type == 'standingstone') changePieceStand(piece);
        } else {
            if (
                stack.includes(piece) &&
                (piece.type === 'flatstone' || piece.type === 'standingstone')
            ) {
                changePieceStand(piece);
            }
        }
        setStack([piece]);
    }
    function handlePieceClick(e: ThreeEvent<MouseEvent>, pieceId: string) {
        e.stopPropagation();
        if (!gameState || !canDoAction) return;
        const piece = getPiece(pieceId, gameState!.pieces);
        if (!piece) return;
        if (piece.selectable) {
            selectPiece(piece);
        } else if (gameState!.roundNumber > 1) {
            selectAbovePieces(piece, gameState!.pieces);
        }
    }

    useEffect(() => {
        if (stack.length > 0) {
            setSelectedPiece(stack[0]);
            makeStackInvisible();
        } else {
            setSelectedPiece(null);
        }
    }, [stack]);

    useEffect(() => {
        if (!selectedPiece) {
            setPossibleMoves([]);
        } else {
            const moves = calculateMoves(
                selectedPiece?.id,
                gameState!.tiles,
                gameState!.pieces,
                allowedDirections
            );
            setPossibleMoves(moves);
        }
    }, [selectedPiece, allowedDirections]);


    const shownPieces = (gameState && gameState.history[showRound].pieces) ?? [];

    console.log(gameState?.history);

    return (
        <>
            <BoardModel scale={0.244} position={[0, 0, 0]} />
            <BoardTable />
            <Pieces onClick={handlePieceClick} pieces={shownPieces} />

            {/* Render board click tiles */}
            {Array.from(Array(5), (_, i) => (
                <Fragment key={i}>
                    {Array.from(Array(5), (_, j) => (
                        <Fragment key={j}>
                            <TileModel
                                position={[i, -0.04, j]}
                                color={'black'}
                                onClick={handleTileClick}
                                isMovePossible={possibleMoves.some(
                                    (move) => move.x === i && move.y === j
                                )}
                            />
                        </Fragment>
                    ))}
                </Fragment>
            ))}

            <Candle position={[5.2, -0.24, 5.3]} scale={[1, 3, 1]} />
            <Candle
                position={[-1.3, -0.24, -1.2]}
                scale={[1, 3, 1]}
                rotation={[0, -Math.PI / 2, 0]}
            />
        </>
    );
}
