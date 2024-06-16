
export type Position = { x: number; y: number };

export type Tile = {
    pieces: string[];
    position: Position;
};


export const PieceTypes = ['standingstone', 'flatstone', 'capstone'] as const;
export type PieceType = typeof PieceTypes[number];
export type Piece3D = {
    id: string;
    model: 'Whitestone' | 'Blackstone' | 'Whitecapstone' | 'Blackcapstone';
    position: [x:number, y:number, z:number];
    type: PieceType;
    selectable:boolean;
    height:number
};


export type PieceArgs = Piece3D;

