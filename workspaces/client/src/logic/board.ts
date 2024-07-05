import { Piece, PieceColor, Position, TBoard, Tile } from '../../../common/types';

export function getTile(position: Position, tiles: TBoard): Tile | null {
    const tile =
        tiles.find((tile) => {
            return tile.position.x == position.x && tile.position.y == position.y;
        }) ?? null;

    return tile;
}

export function getTileFromPiece(pieceId: string, tiles: TBoard): Tile | null {
    return tiles.find((tile) => tile.pieces.includes(pieceId)) ?? null;
}

export function getPiece(pieceId: string, pieces: Piece[]): Piece | null {
    const piece = pieces.find((p) => p.id === pieceId);
    return piece ?? null;
}
export function isTileEmpty(position: Position, tiles: TBoard): boolean {
    const tile = getTile(position, tiles);
    return tile?.pieces.length === 0;
}

export function isPieceOnBoard(pieceId: string, tiles: TBoard): boolean {
    const isPiece = tiles.some((tile) => tile.pieces.includes(pieceId));
    console.log('is piece', isPiece, pieceId, tiles);
    return isPiece;
}

export function getAllBoardPositions(tiles: TBoard): Position[] {
    return tiles.map((tile) => tile.position);
}
export function getEmptyBoardPositions(tiles: TBoard): Position[] {
    return tiles.filter((tile) => tile.pieces.length === 0).map((tile) => tile.position);
}
export function isBoardFull(tiles: TBoard): boolean {
    return tiles.every((tile) => tile.pieces.length > 0);
}

export function isBoardEmpty(tiles: TBoard): boolean {
  return tiles.every((tile) => tile.pieces.length === 0);
}

export function calculateMoves(
    pieceId: string,
    tiles: TBoard,
    pieces: Piece[],
    directions: Position[]
): Position[] {
    console.log(pieceId, tiles, pieces, directions);
    // piece not on  board
    if (!isPieceOnBoard(pieceId, tiles)) return getEmptyBoardPositions(tiles);
    //piece on board
    const pieceTile = tiles.find((tile) => tile.pieces.some((piece) => piece === pieceId));
    const possibleMoves: Position[] = [];
    const tilePosition = pieceTile?.position;
    const boardSize = Math.sqrt(tiles.length);
    if (!tilePosition) return possibleMoves;
    directions.forEach((direction) => {
        const newX = tilePosition.x + direction.x;
        const newY = tilePosition.y + direction.y;
        if (direction.x === 0 && direction.y === 0) {
            possibleMoves.push({ x: tilePosition.x, y: tilePosition.y });
            return;
        }
        if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
            const targetTile = getTile({ x: newX, y: newY }, tiles);
            if (!targetTile) return;
            const originPiece = getPiece(pieceId, pieces);
            const targetablePieces = targetTile.pieces.map((pieceId) => getPiece(pieceId, pieces));
            console.log(targetablePieces);

            const lastPiece = targetablePieces[targetablePieces.length - 1];
            // origin: piece -> target: capstone
            if (lastPiece && lastPiece.type === 'capstone') return;
            // origin: flatstone/standingstone -> target: standingstone
            if (
                (originPiece?.type === 'flatstone' || originPiece?.type === 'standingstone') &&
                lastPiece?.type === 'standingstone'
            )
                return;
            possibleMoves.push({ x: newX, y: newY });
        }
    });
    return possibleMoves;
}

export function getFlatstones(tiles: Tile[], color: PieceColor, pieces: Piece[]): number {
    let number = 0;
    tiles.forEach((tile: Tile) => {
        const lastTilePiece = getPiece(tile.pieces[tile.pieces.length - 1], pieces);
        if (lastTilePiece?.color == color && lastTilePiece.type == 'flatstone') number += 1;
    });
    return number;
}
