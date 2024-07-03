import { Piece, PieceModel, PieceType, Position3D } from '../../../common/types';

export const pieceHeights: Record<PieceType, number> = {
    flatstone: 0.22,
    standingstone: 0.22,
    capstone: 0.65,
};

export type Piece3D = Piece & {
    position: Position3D;
    height: number;
    model: PieceModel;
};
