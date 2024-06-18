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
import { demoPieces, getPiece, getTile, getTileFromPiece, initialPieces } from '../logic/board';
import { Vector3 } from '@react-three/fiber';

export type Piece3DExtended = Piece3D & {
    isHovered: boolean;
};

export default function Pieces() {
    const { pieces, changePieces, stack, setStack, tiles } = useBoardStore();
    const { gameStarted, currentPlayer, roundNumber, boardSize } = useGlobalState();

    useEffect(() => {
        if (gameStarted) changePieces(initialPieces);
    }, [gameStarted]);

    const [hoveredPieces, setHoveredPieces] = useState<Piece3DExtended[]>(
        pieces.map((p) => ({ ...p, isHovered: false }))
    );

    function changePieceStand(piece: Piece3D) {
        let updatedPiece: Piece3D;
        if (piece.type == 'standingstone') {
            updatedPiece = { ...piece, type: 'flatstone' };
        } else {
            updatedPiece = { ...piece, type: 'standingstone' };
        }
        const updatedPieces = pieces.map((p) => (p.id === piece.id ? updatedPiece : p));
        changePieces(updatedPieces);
    }

    const selectAbovePieces = (piece: Piece3D, pieces: Piece3D[]) => {
        const tile = getTileFromPiece(piece.id, tiles);
        if (!tile) return;
        console.log(tile);
        //select stack if last piece is from player
        const lastPieceId = tile.pieces[tile.pieces.length - 1];
        const lastPiece = pieces.find((piece) => piece.id === lastPieceId);
        if (lastPiece!.color != currentPlayer) return;

        const pieceIndex = tile.pieces.indexOf(piece.id);
        // max stack size is boardsize
        if (tile.pieces.length - pieceIndex  > boardSize) return
        const piecesToSelect = tile.pieces
            .slice(pieceIndex)
            .map((pieceId) => pieces.find((piece) => piece.id === pieceId))
            .filter((piece): piece is Piece3D => !!piece);

        if (piecesToSelect.length > 0) {
            setStack(piecesToSelect);
        }
        console.log(piecesToSelect);
    };

    function selectPiece(piece: Piece3D) {
        // place rival piece 1st turn
        if (piece.color == currentPlayer && roundNumber == 1) return;
        if (piece.color != currentPlayer && roundNumber > 1) return;
        if (roundNumber == 1) {
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
        const piece = getPiece(pieceId, pieces);
        if (!piece) return;
        if (piece.selectable) {
            selectPiece(piece);
        } else if (roundNumber > 1) {
            selectAbovePieces(piece, pieces);
        }
    }

    function handlePieceHover(pieceId: string, isHovered: boolean) {}

    function renderPiece(piece: Piece3D) {
        const isPieceSelected = stack?.some(stackPiece => stackPiece.id === piece.id) ?? false;

        const springProps = useSpring({
            position: isPieceSelected
                ? [piece.position[0], piece.position[1] + 1, piece.position[2]]
                : piece.position,
            config: { mass: 1, tension: 400, friction: 30 },
        });

        const hoveredPiece = hoveredPieces.find((p) => p.id === piece.id);
        const isPieceHovered = hoveredPiece ? hoveredPiece.isHovered : false;

        const isPieceStanding = piece.type === 'standingstone';

        let opacity = 1.0;
        if (isPieceHovered && piece.selectable) {
            opacity = 0.5;
        }

        const pieceProps = {
            scale: 0.25,
            position: springProps.position,
            onClick: (e: ThreeEvent<MouseEvent>) => handlePieceClick(e, piece.id),
            onPointerEnter: () => handlePieceHover(piece.id, true),
            onPointerLeave: () => handlePieceHover(piece.id, false),
        };

        const pieceModels: Record<Piece3D['model'], JSX.Element> = {
            Blackstone: (
                <Blackstone
                    isSelected={isPieceSelected ?? false}
                    opacity={opacity}
                    isStanding={isPieceStanding}
                />
            ),
            Whitestone: (
                <Whitestone
                    isSelected={isPieceSelected ?? false}
                    opacity={opacity}
                    isStanding={isPieceStanding}
                />
            ),
            Blackcapstone: (
                <Blackcapstone isSelected={isPieceSelected ?? false} opacity={opacity} />
            ),
            Whitecapstone: (
                <Whitecapstone isSelected={isPieceSelected ?? false} opacity={opacity} />
            ),
        };

        return (
            <animated.mesh key={piece.id} {...pieceProps} >
                {pieceModels[piece.model]}
            </animated.mesh>
        );
    }

    return <>{pieces.map(renderPiece)}</>;
}
