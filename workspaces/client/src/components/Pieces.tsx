import { useSpring, animated } from '@react-spring/three';
import { ThreeEvent } from '@react-three/fiber';
import { Blackstone } from '../models/Blackstone';
import { Blackcapstone } from '../models/Blackcapstone';
import { Whitestone } from '../models/Whitestone';
import { Whitecapstone } from '../models/Whitecapstone';
import type { Piece, Position3D, TBoard, PieceModel } from '../../../common/types';
import { Piece3D, pieceHeights } from '../logic/types';
import { useSocketStore } from '../store/SocketStore';
import { useState } from 'react';

export type Piece3DExtended = Piece3D & {
    isTopOfPile?: boolean;
    inPile?: boolean;
};

export default function Pieces({
    onClick,
    pieces,
    board,
    clickablePieces,
}: {
    onClick: (e: ThreeEvent<MouseEvent>, pieceId: string) => void;
    pieces: Piece[];
    board: TBoard;
    clickablePieces: Set<string>;
}) {
    const WHITE_PILES: Position3D[] = [
        [-2, 0, 0],
        [-2, 0, 1],
        [-2, 0, 2],
    ];
    const BLACK_PILES: Position3D[] = [
        [5.7, 0, 2],
        [5.7, 0, 3],
        [5.7, 0, 4],
    ];
    const WHITE_CAPSTONE_PILE: Position3D = [-2, 0, 4];
    const BLACK_CAPSTONE_PILE: Position3D = [5.7, 0, 0];

    const transformedPieces = transformPieces(pieces, board);

    function transformPieces(pieces: Piece[], board: TBoard): Piece3DExtended[] {
        const allWhiteFlat = pieces
            .filter(
                (p) => (p.type === 'flatstone' || p.type === 'standingstone') && p.color === 'white'
            )
            .sort((a, b) => pieces.indexOf(a) - pieces.indexOf(b));
        const allBlackFlat = pieces
            .filter(
                (p) => (p.type === 'flatstone' || p.type === 'standingstone') && p.color === 'black'
            )
            .sort((a, b) => pieces.indexOf(a) - pieces.indexOf(b));
        const allWhiteCap = pieces
            .filter((p) => p.type === 'capstone' && p.color === 'white')
            .sort((a, b) => pieces.indexOf(a) - pieces.indexOf(b));
        const allBlackCap = pieces
            .filter((p) => p.type === 'capstone' && p.color === 'black')
            .sort((a, b) => pieces.indexOf(a) - pieces.indexOf(b));

        const transformed = pieces.map((piece: Piece): Piece3DExtended => {
            const tile = board.find((t) => t.pieces.includes(piece.id));
            if (tile) {
                const pieceIndex = tile.pieces.indexOf(piece.id);
                const pieceHeight = tile.pieces.slice(0, pieceIndex).reduce((height, pieceId) => {
                    const p = pieces.find((p) => p.id === pieceId);
                    return height + (p ? pieceHeights[p.type] : 0);
                }, 0);
                return {
                    ...piece,
                    position: [tile.position.x, pieceHeight, tile.position.y],
                    height: pieceHeights[piece.type],
                    model: getPieceModel(piece),
                    inPile: false,
                    isTopOfPile: false,
                };
            } else {
                let position: Position3D = [0, 0, 0];
                let height = 0;

                if (piece.type === 'flatstone' || piece.type === 'standingstone') {
                    const isWhite = piece.color === 'white';
                    const group = isWhite ? allWhiteFlat : allBlackFlat;
                    const originalIndex = group.indexOf(piece);
                    if (originalIndex === -1) {
                        console.error('Piece not found in group:', piece.id);
                    } else {
                        const pileIndex = originalIndex % 3;
                        const pile = isWhite ? WHITE_PILES[pileIndex] : BLACK_PILES[pileIndex];
                        height = Math.floor(originalIndex / 3) * pieceHeights.flatstone;
                        position = [pile[0], pile[1] + height, pile[2]];
                    }
                } else if (piece.type === 'capstone') {
                    const isWhite = piece.color === 'white';
                    const group = isWhite ? allWhiteCap : allBlackCap;
                    const originalIndex = group.indexOf(piece);
                    if (originalIndex === -1) {
                        console.error('Piece not found in group:', piece.id);
                    } else {
                        const pile = isWhite ? WHITE_CAPSTONE_PILE : BLACK_CAPSTONE_PILE;
                        height = originalIndex * pieceHeights.capstone;
                        position = [pile[0], pile[1] + height, pile[2]];
                    }
                }

                return {
                    ...piece,
                    position,
                    height: pieceHeights[piece.type],
                    model: getPieceModel(piece),
                    inPile: true,
                    isTopOfPile: false,
                };
            }
        });

        // Determine top pieces in each pile
        const piles = new Map<string, Piece3DExtended[]>();
        transformed.forEach((piece) => {
            if (piece.inPile) {
                const key = `${piece.position[0]},${piece.position[2]}`;
                if (!piles.has(key)) {
                    piles.set(key, []);
                }
                piles.get(key)!.push(piece);
            }
        });

        piles.forEach((pilePieces) => {
            if (pilePieces.length === 0) return;
            const sorted = [...pilePieces].sort((a, b) => b.position[1] - a.position[1]);
            sorted[0].isTopOfPile = true;
        });

        return transformed;
    }

    function getPieceModel(piece: Piece): PieceModel {
        if (piece.color === 'white') {
            return piece.type === 'capstone' ? 'Whitecapstone' : 'Whitestone';
        } else {
            return piece.type === 'capstone' ? 'Blackcapstone' : 'Blackstone';
        }
    }

    const handlePieceClick = (e: ThreeEvent<MouseEvent>, pieceId: string) => {
        const clickedPiece = transformedPieces.find((p) => p.id === pieceId);
        if (!clickedPiece) return;

        // If piece is in a pile, return the top piece
        let topPieceId = pieceId;
        if (clickedPiece.inPile) {
            const pileKey = `${clickedPiece.position[0]},${clickedPiece.position[2]}`;
            const topPiece = transformedPieces.find(
                (p) => p.inPile && `${p.position[0]},${p.position[2]}` === pileKey && p.isTopOfPile
            );
            if (topPiece) {
                topPieceId = topPiece.id;
            }
        }

        onClick(e, topPieceId);
    };

    const [hoveredPileCounts, setHoveredPileCounts] = useState<Map<string, number>>(new Map());
    const [hoveredPieceIds, setHoveredPieceIds] = useState<Set<string>>(new Set());
    
    const getPileKey = (piece: Piece3DExtended): string | null => {
        if (piece.inPile) {
            return `${piece.position[0]},${piece.position[2]}`;
        }
        return null;
    };
    const handlePointerOver = (piece: Piece3DExtended) => {
        if (!clickablePieces.has(piece.id)) return;

        const pileKey = getPileKey(piece);
        if (pileKey) {
            setHoveredPileCounts((prev) => {
                const newMap = new Map(prev);
                newMap.set(pileKey, (newMap.get(pileKey) || 0) + 1);
                return newMap;
            });
        } else {
            const tile = board.find(
                (t) => t.position.x === piece.position[0] && t.position.y === piece.position[2]
            );
            if (tile) {
                const index = tile.pieces.indexOf(piece.id);
                if (index !== -1) {
                    const idsToHover = tile.pieces.slice(index);
                    setHoveredPieceIds((prev) => {
                        const newSet = new Set(prev);
                        idsToHover.forEach((id) => newSet.add(id));
                        return newSet;
                    });
                }
            }
        }
    };

    const handlePointerOut = (piece: Piece3DExtended) => {
        const pileKey = getPileKey(piece);
        if (pileKey) {
            setHoveredPileCounts((prev) => {
                const newMap = new Map(prev);
                const count = newMap.get(pileKey) || 0;
                if (count > 1) {
                    newMap.set(pileKey, count - 1);
                } else {
                    newMap.delete(pileKey);
                }
                return newMap;
            });
        } else {
            const tile = board.find(
                (t) => t.position.x === piece.position[0] && t.position.y === piece.position[2]
            );
            if (tile) {
                const index = tile.pieces.indexOf(piece.id);
                if (index !== -1) {
                    const idsToUnhover = tile.pieces.slice(index);
                    setHoveredPieceIds((prev) => {
                        const newSet = new Set(prev);
                        idsToUnhover.forEach((id) => newSet.delete(id));
                        return newSet;
                    });
                }
            }
        }
    };

    return (
        <>
            {transformedPieces.map((piece) => {
                const pileKey = getPileKey(piece);
                const pileIsHovered = pileKey ? (hoveredPileCounts.get(pileKey) || 0) > 0 : false;
                const isStackHovered = hoveredPieceIds.has(piece.id);
                return (
                    <Piece
                        key={piece.id}
                        piece={piece}
                        onClick={handlePieceClick}
                        isClickable={clickablePieces.has(piece.id)}
                        onPointerOver={() => handlePointerOver(piece)}
                        onPointerOut={() => handlePointerOut(piece)}
                        pileIsHovered={pileIsHovered}
                        isStackHovered={isStackHovered}
                    />
                );
            })}
        </>
    );
}

function Piece({
    piece,
    onClick,
    isClickable,
    onPointerOver,
    onPointerOut,
    pileIsHovered,
    isStackHovered,
}: {
    piece: Piece3DExtended;
    onClick: (e: ThreeEvent<MouseEvent>, pieceId: string) => void;
    isClickable: boolean;
    onPointerOver: () => void;
    onPointerOut: () => void;
    pileIsHovered: boolean;
    isStackHovered: boolean;
}) {
    const { gameState } = useSocketStore();
    const isPieceSelected = gameState!.selectedStack.some((p) => p.id === piece.id);
    const [isPieceHovered, setPieceHovered] = useState(false);

    const springProps: any = useSpring({
        position: isPieceSelected
            ? [piece.position[0], piece.position[1] + 2, piece.position[2]]
            : piece.position,
        config: { mass: 0.5, tension: 200, friction: 20 },
    });

    const isPieceStanding = piece.type === 'standingstone';
    const opacity = 1;

    const pieceModels: Record<Piece3D['model'], JSX.Element> = {
        Blackstone: (
            <Blackstone
                isSelected={isPieceSelected ?? false}
                opacity={opacity}
                isStanding={isPieceStanding}
                isHovered={pileIsHovered || isStackHovered || isPieceHovered}
            />
        ),
        Whitestone: (
            <Whitestone
                isSelected={isPieceSelected ?? false}
                opacity={opacity}
                isStanding={isPieceStanding}
                isHovered={pileIsHovered || isStackHovered || isPieceHovered}
            />
        ),
        Blackcapstone: (
            <Blackcapstone
                isSelected={isPieceSelected ?? false}
                opacity={opacity}
                isHovered={pileIsHovered || isStackHovered || isPieceHovered}
            />
        ),
        Whitecapstone: (
            <Whitecapstone
                isSelected={isPieceSelected ?? false}
                opacity={opacity}
                isHovered={pileIsHovered || isStackHovered || isPieceHovered}
            />
        ),
    };

    return (
        <animated.mesh
            {...springProps}
            scale={0.25}
            onClick={(e) => {
                if (isClickable) {
                    onClick(e, piece.id);
                }
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                if (isClickable) {
                    onPointerOver();
                    setPieceHovered(true);
                }
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                if (isClickable) {
                    onPointerOut();
                    setPieceHovered(false);
                }
            }}>
            {pieceModels[piece.model]}
        </animated.mesh>
    );
}
