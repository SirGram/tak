import { Fragment } from 'react/jsx-runtime';
import { BoardModel } from '../models/BoardModel';
import { Color, ThreeEvent } from '@react-three/fiber';
import { useClientStore } from '../store/ClientStore';
import {
    calculateMoves,
    calculateTileHeight,
    getPiece,
    getTile,
    getTileFromPiece,
    isPieceAtTopFromPlayer,
} from '../logic/board';
import { Candle } from '../models/Candle';
import Pieces from './Pieces';
import { changePieceStand, makeMove, selectStack } from '../manager/SocketManager';
import { useSocketStore } from '../store/SocketStore';
import { Move, Piece, Player, Position, Position3D } from '../../../common/types';
import { useEffect, useMemo, useState } from 'react';
import { useSettingsStore } from '../store/SettingsStore';

interface TileProps {
    position: [x: number, y: number, z: number];
    color: Color;
    onClick: (position: [x: number, y: number, z: number]) => void;
    isMovePossible: boolean;
    height: number;
}

function TileModel({ position, color, onClick, isMovePossible, height }: TileProps) {
    const originalPosition = position;

    const onClickHandler = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick(originalPosition);
    };

    const { getSelectedColor } = useClientStore();
    const selectedColor = getSelectedColor();

    return (
        <group position={position} castShadow={false} receiveShadow={false} renderOrder={1}>
            {/* Box for the clickable area */}
            <mesh onClick={onClickHandler}>
                <boxGeometry args={[1, 0.2, 1]} />

                <meshStandardMaterial transparent={true} opacity={0} color={color} />
            </mesh>

            {/* Cylinder for the visual representation */}
            <mesh position={[0, height + 0.1, 0]} onClick={onClickHandler} >
                <cylinderGeometry args={[0.2, 0.2, 0.05, 8]} />
                <meshStandardMaterial
                    color={isMovePossible ? selectedColor : '#ff0000'}
                    opacity={isMovePossible ? 1 : 0}
                    transparent={true}
                />
            </mesh>
        </group>
    );
}

function BoardTable() {
    const { lightTheme } = useSettingsStore();
    return (
        <mesh position={[2, -0.4, 2]} receiveShadow>
            <boxGeometry args={[10, 0.1, 10]} />
            <meshPhysicalMaterial
                color={lightTheme ? '#ced0d1' : '#872609'}
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
    const { showMove, mode } = useClientStore();

    //console.log(gameState);

    let playerTurn = playerColor === gameState?.currentPlayer && gameState?.gameStarted;
    if (mode === 'local') playerTurn = true;

    const initialDirections = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
    ];
    const [allowedDirections, setAllowedDirections] = useState<Position[]>(initialDirections);
    const [firstMove, setFirstMove] = useState(false);

    const updateAllowedDirections = (lastPosition: Position) => {
        if (!selectedPiece) return;

        const selectedPieceTile = getTileFromPiece(selectedPiece.id, gameState!.tiles);
        if (!selectedPieceTile) return;

        const dx = lastPosition.x - selectedPieceTile.position.x;
        const dy = lastPosition.y - selectedPieceTile.position.y;

        const updatedAllowedDirection = [{ x: dx, y: dy }];
        // leave pieces below stack square
        updatedAllowedDirection.push({ x: 0, y: 0 });

        setAllowedDirections(updatedAllowedDirection);
        setFirstMove(true);
    };


    const selectedPiece: Piece | null =
        gameState && gameState.selectedStack.length > 0 ? gameState.selectedStack[0] : null;

    function handleTileClick(position: Position3D) {
        if (isViewingHistory) return;
        if (!selectedPiece || !playerTurn || gameState!.gameOver) return;
        if (!possibleMoves.some((move) => move.x === position[0] && move.y === position[2])) return;

        const fromTile = getTileFromPiece(selectedPiece.id, gameState!.tiles);

        const toTile = getTile({ x: position[0], y: position[2] }, gameState!.tiles);
        if (!toTile || !room) return;
        const move: Move = {
            stack: gameState!.selectedStack,
            from: fromTile ? fromTile.position : null,
            to: toTile.position,
        };
        if (allowedDirections.length > 2)
            updateAllowedDirections({ x: position[0], y: position[2] });
        makeMove(room, move);
    }

    useEffect(() => {
        if (gameState?.currentPlayer) {
            setAllowedDirections(initialDirections);
            setFirstMove(false)
        }
    }, [gameState?.currentPlayer]);

    //console.log(gameState);

    const playerThatPlays = mode === 'multiplayer' ? playerColor : gameState?.currentPlayer;

    function handlePieceClick(e: ThreeEvent<MouseEvent>, pieceId: string) {
        if (isViewingHistory) return;
        if (!playerTurn || gameState!.gameOver) return;
        e.stopPropagation();
        const piece = getPiece(pieceId, gameState!.pieces);
        if (!piece) return;

        const tile = getTileFromPiece(pieceId, gameState!.tiles);

        if (tile) {
            // Piece is on the board
            if (!isPieceAtTopFromPlayer(tile, gameState!.pieces, playerThatPlays)) return;
            const pieceIndex = tile.pieces.indexOf(pieceId);
            if (pieceIndex === -1) return;
            const selectedPieceIds = tile.pieces.slice(Math.max(pieceIndex, tile.pieces.length - gameState!.boardSize)); // max stack size
            const selectedPieces = selectedPieceIds
                .map((id) => getPiece(id, gameState!.pieces))
                .filter((p): p is Piece => p !== null);
        
            if (room) selectStack(room, selectedPieces);
        } else {
            // Piece is outside the board (in a pile)
            if (gameState!.roundNumber === 1) {
                console.log('first round', playerThatPlays, piece.color, piece.type);
                // In the first round, can only select opponent's pieces
                if (piece.color === playerThatPlays || piece.type !== 'flatstone') return;
            } else {
                // After first round, can only select own pieces
                if (piece.color !== playerThatPlays) return;
            }
            // Piece is selected, we can change the stand
            if (piece && room && piece.id === selectedPiece?.id) {
                if (
                    gameState!.roundNumber !== 1 &&
                    (piece.type === 'standingstone' || piece.type === 'flatstone')
                ) {
                    changePieceStand(room, piece.id);
                }
            } else if (piece && room) selectStack(room, [piece]);
        }
    }

    const possibleMoves: Position[] = selectedPiece
        ? calculateMoves(selectedPiece.id, gameState!.tiles, gameState!.pieces, allowedDirections)
        : [];


    const isViewingHistory = gameState && showMove < gameState.history.length - 1;
    const currentGameState = isViewingHistory ? gameState.history[showMove + 1] : gameState;
    const clickablePieces = useMemo(() => {
        if (!currentGameState || !playerTurn) return new Set<string>();

        if (firstMove) {
            // If first move has been made within turn, cannot move pieces that are outside the stack
            return new Set();
        }

        return new Set(
            currentGameState.pieces
                .filter((piece) => {
                    const tile = getTileFromPiece(piece.id, currentGameState.tiles);

                    if (tile) {
                        if (gameState?.roundNumber === 1) {
                            return false;
                        }
                        // On-board pieces - must be top of stack and player's color
                        return isPieceAtTopFromPlayer(
                            tile,
                            currentGameState.pieces,
                            playerThatPlays as Player
                        );
                    } else {
                        // Pile pieces
                        if (gameState?.roundNumber === 1) {
                            return piece.color !== playerThatPlays && piece.type === 'flatstone';
                        }
                        return piece.color === playerThatPlays;
                    }
                })
                .map((piece) => piece.id)
        );
    }, [currentGameState, playerThatPlays, firstMove]);

    return (
        <>
            <BoardModel scale={0.244} position={[0, -0.23, 0]} />
            <BoardTable />
            {currentGameState && (
                <>
                    <Pieces
                        onClick={handlePieceClick}
                        pieces={currentGameState.pieces}
                        board={currentGameState.tiles}
                        clickablePieces={clickablePieces}
                    />

                    {/* Render board click tiles */}
                    {playerTurn &&
                        gameState &&
                        Array.from(Array(5), (_, i) => (
                            <Fragment key={i}>
                                {Array.from(Array(5), (_, j) => (
                                    <Fragment key={j}>
                                        <TileModel
                                            height={calculateTileHeight(
                                                i,
                                                j,
                                                gameState.tiles,
                                                gameState.selectedStack,
                                                gameState.pieces
                                            )}
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
                    {Array.from(Array(2), (_, i) => (
                        <Fragment key={i}>
                            <Candle position={[i * 3 + 0.5, -0.35, -1.5]} scale={[1, 1, 1]} />
                            <Candle position={[i * 3 + 0.5, -0.35, 5.5]} scale={[1, 1, 1]} />
                        </Fragment>
                    ))}
                </>
            )}
        </>
    );
}
