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
import { makeMove, selectStack } from '../socket/SocketManager';
import { useSocketStore } from '../store/SocketStore';
import { Move, Piece, Position, Position3D, Tile } from '../../../common/types';
import { useEffect, useState } from 'react';
import { Piece3D } from '../logic/pieces';
import { get } from 'http';

interface TileProps {
    position: [x: number, y: number, z: number];
    color: Color;
    onClick: (position: [x: number, y: number, z: number]) => void;
    isMovePossible: boolean;
}

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
    const { showRound } = useClientStore();

    console.log(gameState);

    const [shownPieces, setShownPieces] = useState<Piece3D[]>([]);

    const [firstMoveMade, setFirstMoveMade] = useState(false);

    const directions = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
    ];
    const [allowedDirections, setAllowedDirections] = useState<Position[]>(directions);

    const updateAllowedDirections = (lastPosition: Position3D) => {
        const dx = lastPosition[0] - selectedPiece!.position[0];
        const dy = lastPosition[2] - selectedPiece!.position[2];

        const updatedAllowedDirection = [{ x: dx, y: dy }];
        // leave pieces below stack square
        updatedAllowedDirection.push({ x: 0, y: 0 });

        setAllowedDirections(updatedAllowedDirection);
    };

    const selectedPiece: Piece | null =
        gameState && gameState.selectedStack.length > 0 ? gameState.selectedStack[0] : null;

    function handleTileClick(position: Position3D) {
        if (!selectedPiece) return;
        const fromTile = getTileFromPiece(selectedPiece.id, gameState!.tiles);

        const toTile = getTile({ x: position[0], y: position[2] }, gameState!.tiles);
        if (!toTile || !room) return;
        const move: Move = {
            stack: gameState!.selectedStack,
            from: fromTile ? fromTile.position : null,
            to: toTile.position,
        };
        makeMove(room, move);
    }
    console.log(gameState?.tiles);

    function handlePieceClick(e: ThreeEvent<MouseEvent>, pieceId: string) {
        e.stopPropagation();
        console.log('piece clicked');
        // outside board selection
        const piece = getPiece(pieceId, gameState!.pieces);
        if (piece && room) selectStack(room, [piece]);
    }

    const possibleMoves: Position[] = selectedPiece
        ? calculateMoves(selectedPiece.id, gameState!.tiles, gameState!.pieces, allowedDirections)
        : [];

    return (
        <>
            <BoardModel scale={0.244} position={[0, 0, 0]} />
            <BoardTable />
            {gameState && (
                <>
                    <Pieces
                        onClick={handlePieceClick}
                        pieces={gameState.pieces}
                        board={gameState.tiles}
                    />

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
                    {Array.from(Array(5), (_, i) => (
                        <Fragment key={i}>
                            <Candle position={[i, -0.24, -1.5]} scale={[1, 1, 1]} />
                            <Candle position={[i, -0.24, 5.5]} scale={[1, 1, 1]} />
                        </Fragment>
                    ))}
                </>
            )}
        </>
    );
}
