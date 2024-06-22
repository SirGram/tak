import { useSpring, animated } from '@react-spring/three';
import { ThreeEvent } from '@react-three/fiber';
import { useClientStore } from '../store/ClientStore';
import { Blackstone } from '../models/Blackstone';
import { Blackcapstone } from '../models/Blackcapstone';
import { Whitestone } from '../models/Whitestone';
import { Whitecapstone } from '../models/Whitecapstone';
import { Piece3D} from '../../../common/types';

export type Piece3DExtended = Piece3D & {
    isHovered: boolean;
};

export default function Pieces({
    onClick,
    pieces,
}: {
    onClick: (e: ThreeEvent<MouseEvent>, pieceId: string) => void;
    pieces: Piece3D[];
}) {
    return (
        <>
            {pieces.map((piece) => (
                <Piece key={piece.id} piece={piece} onClick={onClick} />
            ))}
        </>
    );
}

function Piece({
    piece,
    onClick,
}: {
    piece: Piece3D;
    onClick: (e: ThreeEvent<MouseEvent>, pieceId: string) => void;
}) {
    const { stack } = useClientStore();

    const isPieceSelected = stack.some((stackPiece) => {
        return stackPiece.id == piece.id;
    });

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
        <animated.mesh {...springProps} scale={0.25} onClick={(e) => onClick(e, piece.id)}>
            {pieceModels[piece.model]}
        </animated.mesh>
    );
}
