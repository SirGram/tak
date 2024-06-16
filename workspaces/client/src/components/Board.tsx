import { Fragment } from 'react/jsx-runtime';
import { BoardModel } from '../models/BoardModel';
import { Color, ThreeEvent, Vector3 } from '@react-three/fiber';
import { useCallback, useEffect, useState } from 'react';
import { useGlobalState } from '../store/store';
import { useBoardStore } from '../store/BoardStore';
import { Piece3D, Tile } from '../logic';
import { getPiece, getTile, isTileEmpty } from '../logic/board';
import { Candle } from '../models/candle';

type TileProps = {
    position: [x: number, y: number, z: number];
    color: Color;
    onClick: (position: [x: number, y: number, z: number]) => void;
};

function TileModel({ position, color, onClick }: TileProps) {
    const [isHovered, setIsHovered] = useState(false);
    function onPointerEnter(e: ThreeEvent<PointerEvent>) {
        {
            e.stopPropagation();
            setIsHovered(true);
        }
    }
    function onPointerLeave() {
        {
            setIsHovered(false);
        }
    }

    return (
        <mesh
            onClick={() => onClick(position)}
            position={position}
            onPointerEnter={(e) => onPointerEnter(e)}
            onPointerLeave={() => onPointerLeave()}>
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial
                color={isHovered ? color : '#ff0000'}
                opacity={isHovered ? 0.5 : 0}
                transparent={true}
            />
        </mesh>
    );
}
function BoardTable() {
    const [isHovered, setIsHovered] = useState(false);
    function onPointerEnter(e: ThreeEvent<PointerEvent>) {
        {
            e.stopPropagation();
            setIsHovered(true);
        }
    }
    function onPointerLeave() {
        {
            setIsHovered(false);
        }
    }

    return (
        <mesh position={[2, -0.29, 2]}>
            <boxGeometry args={[10, 0.1, 10]} />
            <meshStandardMaterial color={'white'} opacity={0.1} transparent={true} />
        </mesh>
    );
}

function calculatePieceHeight(tilePieces: Piece3D[], pieceToCalculate: Piece3D): number {
    let extraHeight = 0;
    const pieceIndex = tilePieces.findIndex((p) => p.id === pieceToCalculate.id);

    for (let i = 0; i < pieceIndex; i++) {
        extraHeight += tilePieces[i].height;
    }
    console.log(tilePieces, pieceToCalculate, pieceIndex);

    return extraHeight;
}

export default function Board() {
    const { tiles, movePiece, placePiece, changePiecePosition, changePieceSelectable, pieces } =
        useBoardStore();
    const { stack, setStack } = useGlobalState();

    const [clickPosition, setClickPosition] = useState<[x: number, y: number, z: number] | null>(
        null
    );

    const selectTile = (tile: Tile, pieces: Piece3D[]) => {
        const piecesToSelect = tile.pieces
            .map((pieceId) => pieces.find((piece) => piece.id === pieceId))
            .filter((piece): piece is Piece3D => !!piece);

        if (piecesToSelect.length > 0) {
            setStack(piecesToSelect);
        }
        console.log(tile);
        console.log('sele');
    };

    const moveStack = (tile: Tile, position: [x: number, y: number, z: number]) => {
        const pieceToMove = stack[0];
        if (!pieceToMove) return;

        const piecesWithinTile: Piece3D[] = tile.pieces
            .map((p) => getPiece(p, pieces))
            .filter((p): p is Piece3D => p !== null);

        position[1] += 0.23 + calculatePieceHeight(piecesWithinTile, pieceToMove);

        if (tile.pieces.includes(pieceToMove.id)) {
            movePiece(pieceToMove.id, { x: position[0], y: position[2] });
        } else {
            // place new piece
            if (isTileEmpty({ x: position[0], y: position[2] }, tiles)) {
                placePiece(pieceToMove.id, { x: position[0], y: position[2] });
            } else {
                return;
            }
        }

        changePiecePosition(pieceToMove.id, position);

        setStack([]);
        if (pieceToMove.selectable) changePieceSelectable(pieceToMove.id, false);
    };

    function handleTileClick(position: [x: number, y: number, z: number]) {
        setClickPosition(position);
    }

    useEffect(() => {
        if (!clickPosition) return;
        const position2D = { x: clickPosition[0], y: clickPosition[2] };
        const toTile = getTile(position2D, tiles);
        if (!toTile) return;

        if (stack && stack.length > 0) {
            moveStack(toTile, clickPosition);
        } else {
            selectTile(toTile, pieces);
        }
    }, [clickPosition]);

    console.log(tiles);
    console.log('stack', stack);

    

    return (
        <>
            <BoardModel scale={0.244} position={[0, 0, 0]} />
            <Candle position={[5.2, -0.24, -1.2]}  scale={[1, 3, 1]} />
            <Candle position={[-1.3, -0.24, 5.3]}  scale={[1, 3, 1]} />
            <BoardTable />

            {/* Render board click tiles */}
            {Array.from(Array(5), (_, i) => (
                <Fragment key={i}>
                    {Array.from(Array(5), (_, j) => (
                        <Fragment key={j}>
                            <TileModel
                                position={[i, -0.04, j]}
                                color={'black'}
                                onClick={handleTileClick}
                            />
                        </Fragment>
                    ))}
                </Fragment>
            ))}
        </>
    );
}
