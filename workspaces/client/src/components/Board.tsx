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
import { changePieceStand, makeMove, selectStack } from '../socket/SocketManager';
import { useSocketStore } from '../store/SocketStore';
import { Move, Piece, Position, Position3D, Tile } from '../../../common/types';
import { useEffect, useState } from 'react';
import { Piece3D, pieceHeights } from '../logic/pieces';
import { get } from 'http';

interface TileProps {
    position: [x: number, y: number, z: number];
    color: Color;
    onClick: (position: [x: number, y: number, z: number]) => void;
    isMovePossible: boolean;
    height: number;
}

function TileModel({ position, color, onClick, isMovePossible, height }: TileProps) {
    const [x, y, z] = position;
    const originalPosition = position;
    const elevatedPosition: [number, number, number] = [x, y + height + 0.07, z]; // Use the height prop

    const onClickHandler = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick(originalPosition);
    };
    return (
        <group position={position} castShadow={false} receiveShadow={false} renderOrder={1}>
            {/* Box for the clickable area */}
            <mesh onClick={onClickHandler}>
                <boxGeometry args={[1, 0.2, 1]} />

                <meshStandardMaterial transparent={true} opacity={0} color={color} />
            </mesh>

            {/* Cylinder for the visual representation */}
            <mesh position={[0, height + 0.1, 0]} onClick={onClickHandler}>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 8]} />
                <meshStandardMaterial
                    color={isMovePossible ? '#000000' : '#ff0000'}
                    opacity={isMovePossible ? 0.5 : 0}
                    transparent={true}
                />
            </mesh>
        </group>
    );
}

function BoardTable() {
    return (
        <mesh position={[2, -0.4, 2]} receiveShadow>
            <boxGeometry args={[10, 0.1, 10]} />
            <meshPhysicalMaterial
                color={'#ced0d1'}
                opacity={0.5}
                transparent={true}
                roughness={0.1}
                metalness={0.5}
                reflectivity={0.9}
                clearcoat={1}
                clearcoatRoughness={0}
            />
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
        { x: 0, y: 0 },
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
        if (!possibleMoves.some((move) => move.x === position[0] && move.y === position[2])) return;
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
    console.log(gameState?.tiles, selectedPiece);

    function handlePieceClick(e: ThreeEvent<MouseEvent>, pieceId: string) {
        e.stopPropagation();
        console.log('piece clicked');
        const piece = getPiece(pieceId, gameState!.pieces);
        if (!piece) return;

        const tile = getTileFromPiece(pieceId, gameState!.tiles);

        if (tile) {
            // Piece is on the board
            const pieceIndex = tile.pieces.indexOf(pieceId);
            if (pieceIndex === -1) return;
            const selectedPieceIds = tile.pieces.slice(pieceIndex);
            const selectedPieces = selectedPieceIds
                .map((id) => getPiece(id, gameState!.pieces))
                .filter((p): p is Piece => p !== null);

            if (room) selectStack(room, selectedPieces);
        } else {
            // Piece is outside the board (in a pile)
            // if piece is selected, change standing
            if (piece && room && piece.id === selectedPiece?.id) {
                if (piece.type === 'standingstone' || piece.type === 'flatstone') {
                    changePieceStand(room, piece.id);
                }
            } else if (piece && room) selectStack(room, [piece]);
        }
    }
    console.log(selectedPiece, gameState?.pieces);

    const possibleMoves: Position[] = selectedPiece
        ? calculateMoves(selectedPiece.id, gameState!.tiles, gameState!.pieces, allowedDirections)
        : [];

    const calculateTileHeight = (x: number, y: number): number => {
        const tile = gameState!.tiles.find((t) => t.position.x === x && t.position.y === y);
        if (!tile || !tile.pieces.length) return 0;
        // take into consideration if piece is standing or not
        let height = 0;
        if (tile.pieces.length === 1) {
            tile.pieces.forEach((pieceId) => {
                const piece = getPiece(pieceId, gameState!.pieces);
                if (piece) {
                    height += pieceHeights[piece.type];
                }
            });
        }
        return height;
    };

    return (
        <>
            <BoardModel scale={0.244} position={[0, -0.23, 0]} />
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
                                        height={calculateTileHeight(i, j)}
                                        position={[i, -0.3, j]}
                                        color={i % 2 === j % 2 ? '#4e1200' : '#7e000000'}
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
                            <Fragment>
                                <mesh position={[-2, -0.33, i]} receiveShadow>
                                    <boxGeometry args={[1, 0.2, 1]} />
                                    <meshStandardMaterial color={'#9F896C'} />
                                </mesh>
                            </Fragment>
                            <Fragment>
                                <mesh position={[5.7, -0.33, i]} receiveShadow>
                                    <boxGeometry args={[1, 0.2, 1]} />
                                    <meshStandardMaterial color={'#9F896C'} />
                                </mesh>
                            </Fragment>
                        </Fragment>
                    ))}
                    {Array.from(Array(5), (_, i) => (
                        <Fragment key={i}>
                            <Candle position={[i, -0.35, -1.5]} scale={[1, 1, 1]} />
                            <Candle position={[i, -0.35, 5.5]} scale={[1, 1, 1]} />
                        </Fragment>
                    ))}
                </>
            )}
        </>
    );
}
