export type Position = { x: number; y: number };
export type Position3D = [x: number, y: number, z: number];
export type Player =  "white" | "black" 
export type Tile = {
  pieces: string[];
  position: Position;
};
export type PieceType = "standingstone" | "flatstone" | "capstone";
export type PieceModel =
  | "Whitestone"
  | "Blackstone"
  | "Whitecapstone"
  | "Blackcapstone";
export type PieceColor = "white" | "black";
export type Piece = {
  id: string;
  type: PieceType;
  color: PieceColor;
}

export type Vector3 = [number, number, number];
export type TBoard = Tile[];
export type BoardSize = 3 | 4 | 5 | 6;

export type Move = {
  stack: Piece[];
  from: Position | null;
  to: Position;
}

export type GameMode = "local" | "multiplayer";

export type ServerGameState = {
  gameStarted: boolean;
  gameOver: boolean;
  winner: string | null;
  currentPlayer: string;
  boardSize: number;
  roundNumber: number;
  gameTime: number;
  history: Array<{ tiles: TBoard, pieces: Piece[] }>;
  tiles: TBoard;
  pieces: Piece[];
  selectedStack: Piece[];
}
