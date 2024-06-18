
export type Position = { x: number; y: number };

export type Tile = {
    pieces: string[];
    position: Position;
};
export type Vector3 = [x:number, y:number, z:number]


export const PieceTypes = ['standingstone', 'flatstone', 'capstone'] as const;
export type PieceType = typeof PieceTypes[number];
export type PieceModel = 'Whitestone' | 'Blackstone' | 'Whitecapstone' | 'Blackcapstone';
export type PieceColor = "white" | "black"
export interface Piece3D  {
    id: string;
    model:PieceModel
    position: Vector3
    type: PieceType;
    selectable:boolean;
    height: number
    color: PieceColor
};


export type PieceArgs = Piece3D;

