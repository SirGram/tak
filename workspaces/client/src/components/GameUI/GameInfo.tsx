import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronsLeft, ChevronsRight, ChevronsUp, ChevronsDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Piece, Tile } from '../../../../common/types';
import useSeconds from '../../hooks';
import { getFlatstones } from '../../logic/board';
import { leaveRoom, playAgain } from '../../manager/SocketManager';
import { useSocketStore } from '../../store/SocketStore';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../../store/ClientStore';

export default function GameInfo() {
    const { gameState, room, playerColor, username, resetSocketStore } = useSocketStore();
    const { mode } = useClientStore();

    const { gameStarted, currentPlayer, roundNumber, winner, gameOver } = gameState!;

    const whiteFlatstones = getFlatstones(gameState!.tiles, 'white', gameState!.pieces);
    const blackFlatstones = getFlatstones(gameState!.tiles, 'black', gameState!.pieces);

    const { startStopWatch, stopStopwatch, seconds } = useSeconds();

    const [message, setMessage] = useState('');

    useEffect(() => {
        if (gameStarted && !gameOver) {
            startStopWatch();
        } else if (gameOver) {
            console.log('game over');
            stopStopwatch();
        }
        console.log(gameState);
    }, [gameState, gameStarted, gameOver]);

    useEffect(() => {
        if (gameState?.gameOver) {
            switch (gameState?.winner) {
                case 'white':
                    return setMessage('White player wins!');
                case 'black':
                    return setMessage('Black player wins!');
                case 'tie':
                    return setMessage("It's a tie!");
            }
        }
        if (!gameState?.gameStarted)
            return setMessage('Share your room with a friend to play with!');

        if (currentPlayer != playerColor && mode == 'multiplayer')
            return setMessage('Waiting for your opponent move');

        if (roundNumber == 1) {
            setMessage('Select opponent starting flatstone');
        } else if (winner) {
            if (winner == 'tie') {
                setMessage(`It's a tie!`);
            } else {
                setMessage(`${winner} player wins!`);
            }
        } else {
            setMessage('');
        }
    }, [winner, roundNumber, gameState]);

    const [isOpen, setIsOpen] = useState(true);
    const [is2DBoardOpen, setIs2DBoardOpen] = useState(false);

    function formatGameTime(time: number) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);

        const formattedHours = hours > 0 ? String(hours).padStart(2, '0') : '';
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        if (hours > 0) {
            return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        } else {
            return `${formattedMinutes}:${formattedSeconds}`;
        }
    }
    const navigate = useNavigate();
    const handleExitRoom = () => {
        if (room) {
            leaveRoom(room);
            resetSocketStore();
            setTimeout(() => navigate('/'), 0);
        }
    };

    const handlePlayAgain = () => {
        if (room && username) {
            playAgain(room, username);
        }
    };

    const renderBoard2D = () => {
        if (!gameState) return null;
        const boardSize = Math.sqrt(gameState.tiles.length);
        const board: Piece[][][] = Array(boardSize)
            .fill(null)
            .map(() =>
                Array(boardSize)
                    .fill(null)
                    .map(() => [])
            );

        gameState.tiles.forEach((tile: Tile) => {
            if (tile.pieces.length > 0) {
                tile.pieces.forEach((pieceId) => {
                    const piece = gameState.pieces.find((p) => p.id === pieceId);
                    if (piece) {
                        // push pieces instead of overwriting
                        if (board[tile.position.y][tile.position.x]) {
                            board[tile.position.y][tile.position.x].push(piece);
                        }
                    }
                });
            }
        });
        console.log(board);

        return (
            <div className="w-48 h-48 p-2 bg-gray-200 dark:bg-gray-900 rounded-lg shadow-inner">
                <div
                    className="w-full h-full grid  bg-gray-400 dark:bg-gray-700"
                    style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}>
                    {board.map((row, y) =>
                        row.map((tile, x) => {
                            const lastPiece = tile.length > 0 ? tile[tile.length - 1] : null;
                            const lastPieceColor = lastPiece ? lastPiece.color : '';

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className={`relative aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-950
                                    ${(x + y) % 2 === 0 ? ' bg-gray-100 dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                    {tile.length > 0 && lastPiece && (
                                        <>
                                            <div className="w-4/5 h-4/5 transition-transform hover:scale-110 overflow-hidden">
                                                <div
                                                    className={`flex items-center justify-center w-full h-full overflow-hidden ${
                                                        lastPiece.color === 'black'
                                                            ? 'rounded-full bg-orange-950 text-white '
                                                            : 'rounded-sm w-4/5 h-4/5 bg-yellow-300 text-black'
                                                    } ${
                                                        lastPiece.type === 'capstone'
                                                            ? 'border-red-500'
                                                            : 'border-transparent'
                                                    } border-4 `}
                                                    title={`${lastPiece.color} ${lastPiece.type}`}>
                                                    <span className="z-10 font-bold text-sm">
                                                        {tile.length}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Adjusted standingstone base */}
                                            {lastPiece.type === 'standingstone' && (
                                                <div
                                                    className={`absolute inset-x-0 bottom-0 w-full h-1/6 ${
                                                        lastPieceColor === 'black'
                                                            ? 'bg-orange-950'
                                                            : 'bg-yellow-300'
                                                    }`}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };
    return (
        <>
            {' '}
            <div className="mt-4 fixed w-full justify-center flex z-20">
                <div className="flex-1 w-full items-center flex flex-col">
                    <div className="flex gap-4">
                        <div className="flex flex-col ">
                            <Card className="overflow-hidden h-10">
                                <Collapsible
                                    open={isOpen}
                                    onOpenChange={setIsOpen}
                                    className="w-fit flex items-center justify-between h-10">
                                    <div className="flex items-center justify-between gap-2 pl-4">
                                        <span className="pr-2 border-r border-border flex items-center gap-1">
                                            <span> Turn:</span>
                                            <b>
                                                {currentPlayer
                                                    ? `${currentPlayer.charAt(0).toUpperCase()}${currentPlayer.slice(1).toLowerCase()}`
                                                    : ''}
                                            </b>
                                        </span>
                                        <span className=" flex items-center gap-1">
                                            <span>Player:</span>
                                            <b>
                                                {playerColor
                                                    ? `${playerColor.charAt(0).toUpperCase()}${playerColor.slice(1).toLowerCase()}`
                                                    : ''}
                                            </b>
                                        </span>
                                    </div>
                                    <CollapsibleContent className=" flex flex-wrap items-center justify-center gap-2 mx-2">
                                        <span className="pl-2 pr-2 border-r border-l border-border flex items-center gap-1">
                                            <span> Round:</span> <b>{gameState?.roundNumber}</b>
                                        </span>
                                        <span className="pr-2 border-r border-border flex items-center gap-1">
                                            <span> Room: </span>
                                            <b>{room}</b>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span>Time:</span>
                                            <b>{formatGameTime(seconds)}</b>
                                        </span>
                                        <Button
                                            onClick={handleExitRoom}
                                            variant={'destructive'}
                                            className="m-2">
                                            Exit Room
                                        </Button>
                                    </CollapsibleContent>
                                    <CollapsibleTrigger asChild className=" h-full">
                                        <Button variant="ghost" size="sm" className="w-9 p-0 m-0">
                                            {isOpen ? (
                                                <ChevronsLeft className="h-full w-4" />
                                            ) : (
                                                <ChevronsRight className="h-full w-4" />
                                            )}

                                            <span className="sr-only">Toggle</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </Collapsible>{' '}
                            </Card>

                            {message && (
                                <Card className="w-fit mx-auto px-2 py-2 mt-2  flex justify-center items-center gap-4">
                                    {message}
                                    {winner && (
                                        <Button variant="default" onClick={handlePlayAgain}>
                                            Play again
                                        </Button>
                                    )}
                                </Card>
                            )}
                        </div>
                        <Card
                            className="w-fit flex gap-2 h-fit px-2 items-center "
                            title="Number of flatstones">
                            <Collapsible open={is2DBoardOpen} onOpenChange={setIs2DBoardOpen}>
                                <div className="flex items-center justify-between gap-2 pl-4 h-10">
                                    <span className=" h-full items-center flex gap-1 font-semibold">
                                        {blackFlatstones}
                                        <div className="size-6 bg-orange-950  border-orange-900 border-foreground border-2  rounded-full"></div>
                                    </span>

                                    <div className="py-1 w-[1px] mx-2 h-6 bg-muted dark:bg-gray-600 "></div>
                                    <span className="h-full flex items-center gap-1 font-semibold">
                                        <div className="size-6 bg-yellow-300 border-yellow-600 border-2 rounded-sm"></div>
                                        {whiteFlatstones}
                                    </span>

                                    <CollapsibleTrigger asChild className=" h-full">
                                        <Button variant="ghost" size="sm" className="w-9 p-0 m-0">
                                            {is2DBoardOpen ? (
                                                <ChevronsUp className="h-full w-4" />
                                            ) : (
                                                <ChevronsDown className="h-full w-4" />
                                            )}

                                            <span className="sr-only">Toggle</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent className="p-1 pb-2">
                                    {renderBoard2D()}
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
