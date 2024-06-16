import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { ThreeEvent } from '@react-three/fiber';
import { useGlobalState } from '../store/store';
import { useBoardStore } from '../store/BoardStore';
import { Piece3D } from '../logic';
import { Blackstone } from '../models/Blackstone';
import { Blackcapstone } from '../models/Blackcapstone';
import { Whitestone } from '../models/Whitestone';
import { Whitecapstone } from '../models/Whitecapstone';
import { initialPieces } from '../logic/board';

export type Piece3DExtended = Piece3D & {
    isHovered: boolean;
};

export default function Pieces() {
    const { pieces, changePieces } = useBoardStore();
    const { stack, setStack, gameStarted} = useGlobalState();

    useEffect(() => {
     if (gameStarted)changePieces(initialPieces)
    }, [gameStarted])
    

    const [hoveredPieces, setHoveredPieces] = useState<Piece3DExtended[]>(
        pieces.map((p) => ({ ...p, isHovered: false }))
    );

    function handlePieceClick(e: ThreeEvent<MouseEvent>, pieceId: string) {
        e.stopPropagation();
        const foundPiece = pieces.find((piece) => piece.id === pieceId);
        if (foundPiece && foundPiece.selectable) {
            setStack([foundPiece]);
        }
        if (foundPiece && stack?.includes(foundPiece)) {
            setStack([]);
        }
    }

    function handlePieceHover(pieceId: string, isHovered: boolean) {
        // Update hoveredPieces state based on the pieceId
        setHoveredPieces((prev) =>
            prev.map((piece) => (piece.id === pieceId ? { ...piece, isHovered: isHovered } : piece))
        );
    }


    function renderPiece(piece: Piece3D) {
        const isPieceSelected = stack?.includes(piece);

        const springProps = useSpring({
            position: isPieceSelected
                ? [piece.position[0], piece.position[1] + 1, piece.position[2]]
                : piece.position,
            config: { mass: 1, tension: 280, friction: 60 },
        });

        const hoveredPiece = hoveredPieces.find((p) => p.id === piece.id);
        const isPieceHovered = hoveredPiece ? hoveredPiece.isHovered : false;

        let opacity = 1.0;
        if (isPieceHovered && piece.selectable) {
            opacity = 0.5;
        }

        const pieceProps = {
            scale: 0.25,
            position: springProps.position as any,
            onClick: (e: ThreeEvent<MouseEvent>) => handlePieceClick(e, piece.id),
            onPointerEnter: () => handlePieceHover(piece.id, true),
            onPointerLeave: () => handlePieceHover(piece.id, false),
        };

        const pieceModels: Record<Piece3D['model'], JSX.Element> = {
            Blackstone: <Blackstone isSelected={isPieceSelected || false} opacity={opacity} />,
            Whitestone: <Whitestone isSelected={isPieceSelected || false} opacity={opacity} />,
            Blackcapstone: <Blackcapstone isSelected={isPieceSelected || false} opacity={opacity} />,
            Whitecapstone: <Whitecapstone isSelected={isPieceSelected || false} opacity={opacity} />,
        };

        return (
            <animated.mesh key={piece.id} {...pieceProps}>
                {pieceModels[piece.model]}
            </animated.mesh>
        );
    }

    return <>{pieces.map(renderPiece)}</>;
}
