import { Fragment } from 'react/jsx-runtime';
import { BoardModel } from '../models/BoardModel';
import { Color, ThreeEvent, Vector3 } from '@react-three/fiber';
import { useCallback, useEffect, useState } from 'react';
import { useGlobalState } from '../store/store';
import { useBoardStore } from '../store/BoardStore';
import { Piece3D, Position, Tile } from '../logic';
import { calculateMoves, checkRoadWin, getPiece, getTile, isBoardFull, isTileEmpty } from '../logic/board';
import { Candle } from '../models/candle';
import { update } from '@react-spring/three';

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
        <mesh position={[2, -0.29, 2]}>
            <boxGeometry args={[10, 0.1, 10]} />
            <meshStandardMaterial color={'red'} opacity={0.07} transparent={true} />
        </mesh>
    );
}

function calculatePieceHeight(pieceId: string, tilePieces: Piece3D[]): number {
    let extraHeight = 0;
    for (const piece of tilePieces) {
        if (piece.id == pieceId) break;
        extraHeight += piece.height;
    }
    return extraHeight;
}

export default function Board() {
    const {
        tiles,
        selectedPiece,
        setSelectedPiece,
        possibleMoves,
        setPossibleMoves,
        movePiece,
        placePiece,
        changePiecePosition,
        changePieceSelectable,
        pieces,
        changePieces,
        stack,
        setStack,
    } = useBoardStore();
    const {
        currentTurnPhase,
        setCurrentTurnPhase,
        switchPlayer,
        currentPlayer,
        roundNumber,
        setRoundNumber,
        boardSize,
        setWinner,
    } = useGlobalState();

    const selectTileStack = (tile: Tile, pieces: Piece3D[]) => {
        const piecesToSelect = tile.pieces
            .map((pieceId) => pieces.find((piece) => piece.id === pieceId))
            .filter((piece): piece is Piece3D => !!piece);

        if (piecesToSelect.length > 0) {
            //select stack where last piece is from player
            const isLastPieceFromPlayer =
                piecesToSelect[piecesToSelect.length - 1].color == currentPlayer;
            if (!isLastPieceFromPlayer) return;
            setStack(piecesToSelect.slice(-boardSize));
        }
    };

    const [isRoundOver, setIsRoundOver] = useState(false);
    const directions = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
    ];

    const [allowedDirections, setAllowedDirections] = useState<Position[]>(directions);

    type Position3D = [x: number, y: number, z: number];

    const updateAllowedDirections = (lastPosition: Position3D) => {
        const dx = lastPosition[0] - selectedPiece!.position[0];
        const dy = lastPosition[2] - selectedPiece!.position[2];

        const updatedAllowedDirection = [{ x: dx, y: dy }];
        // leave pieces below stack square
        updatedAllowedDirection.push({ x: 0, y: 0 });

        setAllowedDirections(updatedAllowedDirection);
    };

    function handleTileClick(position: Position3D) {
        if (selectedPiece) {
            handlePlacement(position);
        } else {
            handleSelection(position);
        }
    }

    const handleSelection = (position: Position3D) => {
        const tile = getTile({ x: position[0], y: position[2] }, tiles);
        if (tile) {
            selectTileStack(tile, pieces);
        }
    };

    const handlePlacement = (position: Position3D) => {
        if (!possibleMoves.some((move) => move.x === position[0] && move.y === position[2])) return;

        const tile = getTile({ x: position[0], y: position[2] }, tiles);
        if (tile) {
            const tilePieces = tile.pieces
                .map((id) => pieces.find((p) => p.id === id))
                .filter(Boolean) as Piece3D[];

            let newHeight = 0.25;
            if (!selectedPiece!.selectable) {
                // capstone -> standingstone
                if (tilePieces.length > 0) {
                    const needsFlattening =
                        selectedPiece!.type == 'capstone' &&
                        tilePieces[tilePieces.length - 1].type == 'standingstone';
                    if (needsFlattening) makeFlatstone(tilePieces[tilePieces.length - 1]);
                }
                stack.forEach((piece) => {
                    movePiece(piece.id, { x: position[0], y: position[2] });
                    if (piece.id !== selectedPiece!.id) {
                        changePiecePosition(piece.id, [
                            position[0],
                            piece.position[1],
                            position[2],
                        ]);
                    }
                });

                newHeight += calculatePieceHeight(selectedPiece!.id, tilePieces);
                // restrict stack movement direction
                if (allowedDirections.length > 2) updateAllowedDirections(position);
            } else {
                placePiece(selectedPiece!.id, { x: position[0], y: position[2] });
                changePieceSelectable(selectedPiece!.id, false);
            }
            const newPosition = [position[0], newHeight, position[2]];
            changePiecePosition(selectedPiece!.id, newPosition as Vector3);
            const stackLength = shiftStack();
            if (stackLength === 0) {
                setIsRoundOver(true);
            }
        }
    };

    function makeFlatstone(piece: Piece3D) {
        const updatedPiece: Piece3D = { ...piece, type: 'flatstone' };
        const updatedPieces = pieces.map((p) => (p.id === piece.id ? updatedPiece : p));
        changePieces(updatedPieces);
    }

    const shiftStack = (): number => {
        const updatedStack = [...stack];
        updatedStack.shift();
        setStack(updatedStack);
        return updatedStack.length;
    };
    function checkRound() {
        const playerColor = currentPlayer 
        const enemyColor = currentPlayer === 'white' ? 'black' : 'white';

        //check roads
        const playerWin = checkRoadWin(tiles, playerColor, pieces);
        if (!playerWin) {
            const enemyWin = checkRoadWin(tiles, enemyColor, pieces);
            if (enemyWin) {
                setWinner(enemyColor);
            }
        } else {
            setWinner(playerColor);
        }

        //check empty tiles
        const boardFull = isBoardFull(tiles)
        if (boardFull) {
            const playerFlatstones = 
            
        }
    }

    useEffect(() => {
        if (stack.length > 0) {
            setSelectedPiece(stack[0]);
        } else {
            setSelectedPiece(null);
        }
    }, [stack]);

    useEffect(() => {
        if (!selectedPiece) {
            setPossibleMoves([]);
        } else {
            const moves = calculateMoves(selectedPiece?.id, tiles, pieces, allowedDirections);
            setPossibleMoves(moves);
        }
    }, [selectedPiece, allowedDirections]);

    useEffect(() => {
        if (isRoundOver) {
            checkRound();
            if (currentPlayer == 'black') setRoundNumber(roundNumber + 1);
            switchPlayer();
            setIsRoundOver(false);
            setAllowedDirections(directions);
        }
    }, [isRoundOver]);

    console.log(tiles);
    return (
        <>
            <BoardModel scale={0.244} position={[0, 0, 0]} />
            <BoardTable />

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
        </>
    );
}
