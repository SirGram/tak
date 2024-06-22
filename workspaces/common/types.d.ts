export type Position = { x: number; y: number };
export type Player =  "white" | "black" 
export type Tile = {
  pieces: string[];
  position: Position;
};
export type Position3D = [x: number, y: number, z: number];
export type PieceType = "standingstone" | "flatstone" | "capstone";
export type PieceModel =
  | "Whitestone"
  | "Blackstone"
  | "Whitecapstone"
  | "Blackcapstone";
export type PieceColor = "white" | "black";
export interface Piece3D {
  id: string;
  model: PieceModel;
  position: Position3D;
  type: PieceType;
  selectable: boolean;
  invisible: boolean;
  height: number;
  color: PieceColor;
}

export type Vector3 = [number, number, number];
export type TBoard = Tile[];
export type BoardSize = 3 | 4 | 5 | 6;

export type GameBoard = {
  gameStarted: boolean;
  gameOver: boolean;
  winner: null | "black" | "white" | "tie";
  currentPlayer: "white" | "black";
  roundNumber: number;
  flatstones: { white: number; black: number };
  history: { tiles: TBoard; pieces: Piece3D[] }[];
  tiles: TBoard;
  pieces: Piece3D[];
};

export type GameSettings = {
  boardSize: 3 | 4 | 5 | 6;
  selectedColor: "red" | "blue";
};

export type GameExtra = {
  gameTime: number;
};

export type GameState = GameBoard & GameSettings & GameExtra;
