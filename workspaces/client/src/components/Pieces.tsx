import { useSpring, animated } from '@react-spring/three';
import { ThreeEvent } from '@react-three/fiber';
import { useClientStore } from '../store/ClientStore';
import { Blackstone } from '../models/Blackstone';
import { Blackcapstone } from '../models/Blackcapstone';
import { Whitestone } from '../models/Whitestone';
import { Whitecapstone } from '../models/Whitecapstone';
import type { Piece, Position3D, TBoard, PieceModel } from '../../../common/types';
import { Piece3D, pieceHeights } from '../logic/pieces';
import { useSocketStore } from '../store/SocketStore';

export type Piece3DExtended = Piece3D & {};

export default function Pieces({
    onClick,
    pieces,
    board,
}: {
    onClick: (e: ThreeEvent<MouseEvent>, pieceId: string) => void;
    pieces: Piece[];
    board: TBoard;
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
    const topPieces = getTopPieces(transformedPieces, board);

    function transformPieces(pieces: Piece[], board: TBoard): Piece3DExtended[] {
        let whiteFlatstoneCount = 0;
        let blackFlatstoneCount = 0;
        let whiteCapstoneCount = 0;
        let blackCapstoneCount = 0;
        return pieces.map((piece: Piece): Piece3DExtended => {
            const tile = board.find((t) => t.pieces.includes(piece.id));
            if (tile) {
                // If the piece is on the board
                const stackIndex = tile.pieces.indexOf(piece.id);
                return {
                    ...piece,
                    position: [
                        tile.position.x,
                        stackIndex * pieceHeights[piece.type],
                        tile.position.y,
                    ],
                    height: pieceHeights[piece.type],
                    model: getPieceModel(piece),
                };
            } else {
                // If the piece is not on the board, place it in a pile
                let position: Position3D;
                let height: number;

                if (piece.type === 'flatstone') {
                    if (piece.color === 'white') {
                        const pileIndex = whiteFlatstoneCount % 3;
                        position = WHITE_PILES[pileIndex];
                        height = Math.floor(whiteFlatstoneCount / 3) * pieceHeights[piece.type];
                        whiteFlatstoneCount++;
                    } else {
                        const pileIndex = blackFlatstoneCount % 3;
                        position = BLACK_PILES[pileIndex];
                        height = Math.floor(blackFlatstoneCount / 3) * pieceHeights[piece.type];
                        blackFlatstoneCount++;
                    }
                } else {
                    // capstone
                    if (piece.color === 'white') {
                        position = WHITE_CAPSTONE_PILE;
                        height = whiteCapstoneCount * pieceHeights[piece.type];
                        whiteCapstoneCount++;
                    } else {
                        position = BLACK_CAPSTONE_PILE;
                        height = blackCapstoneCount * pieceHeights[piece.type];
                        blackCapstoneCount++;
                    }
                }

                return {
                    ...piece,
                    position: [position[0], position[1] + height, position[2]],
                    height: pieceHeights[piece.type],
                    model: getPieceModel(piece),
                };
            }
        });
    }

    function getPieceModel(piece: Piece): PieceModel {
        if (piece.color === 'white') {
            return piece.type === 'capstone' ? 'Whitecapstone' : 'Whitestone';
        } else {
            return piece.type === 'capstone' ? 'Blackcapstone' : 'Blackstone';
        }
    }

    function getTopPieces(pieces: Piece3D[], board: TBoard): Set<string> {
        const topPieces = new Set<string>();

        // Get top pieces on the board
        board.forEach((tile) => {
            if (tile.pieces.length > 0) {
                topPieces.add(tile.pieces[tile.pieces.length - 1]);
            }
        });

        // Get top pieces in the piles
        const piles = [...WHITE_PILES, ...BLACK_PILES, WHITE_CAPSTONE_PILE, BLACK_CAPSTONE_PILE];
        piles.forEach((pile) => {
            const pilePieces = pieces.filter(
                (piece) => piece.position[0] === pile[0] && piece.position[2] === pile[2]
            );
            if (pilePieces.length > 0) {
                topPieces.add(pilePieces[pilePieces.length - 1].id);
            }
        });

        return topPieces;
    }

    return (
        <>
            {transformedPieces.map((piece) => (
                <Piece
                    key={piece.id}
                    piece={piece}
                    onClick={onClick}
                    isClickable={topPieces.has(piece.id)}
                />
            ))}
        </>
    );
}

function Piece({
    piece,
    onClick,
    isClickable,
}: {
    piece: Piece3D;
    onClick: (e: ThreeEvent<MouseEvent>, pieceId: string) => void;
    isClickable: boolean;
}) {
    const { gameState } = useSocketStore();
    const isPieceSelected = gameState!.selectedStack.some((p) => p.id === piece.id);

    const springProps: any = useSpring({
        position: isPieceSelected
            ? [piece.position[0], piece.position[1] + 2, piece.position[2]]
            : piece.position,
        config: { mass: 1, tension: 200, friction: 20 },
    });

    const isPieceStanding = piece.type === 'standingstone';
    let opacity = 1;

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
        Blackcapstone: <Blackcapstone isSelected={isPieceSelected ?? false} opacity={opacity} />,
        Whitecapstone: <Whitecapstone isSelected={isPieceSelected ?? false} opacity={opacity} />,
    };

    return (
        <animated.mesh
            {...springProps}
            scale={0.25}
            onClick={(e) => {
                if (isClickable) {
                    onClick(e, piece.id);
                }
            }}>
            {pieceModels[piece.model]}
        </animated.mesh>
    );
}
