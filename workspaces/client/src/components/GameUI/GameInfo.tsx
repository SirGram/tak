import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { useSocketStore } from '../../store/SocketStore';
import { Button } from '../ui/button';
import { ChevronsDown, ChevronsLeft, ChevronsRight, ChevronsUp } from 'lucide-react';
import useSeconds from '../../hooks';
import { useClientStore } from '../../store/ClientStore';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { getFlatstones } from '../../logic/board';

export default function GameInfo() {
    const { gameState, room, playerColor } = useSocketStore();
    const { showRound } = useClientStore();
    const { gameStarted, currentPlayer, roundNumber, winner } = gameState!;
    const { startStopWatch, stopStopwatch, seconds } = useSeconds();
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [is2DBoardOpen, setIs2DBoardOpen] = useState(false);

    useEffect(() => {
        if (gameStarted) {
            startStopWatch();
        } else {
            stopStopwatch();
        }
    }, [gameStarted, startStopWatch, stopStopwatch]);

    useEffect(() => {
        if (!gameState?.gameStarted)
            return setMessage('Share your room with a friend to play with!');

        if (currentPlayer !== playerColor) return setMessage('Waiting for your opponent move');

        if (roundNumber === 1) {
            setMessage('Select opponent starting flatstone');
        } else if (winner) {
            if (winner === 'tie') {
                setMessage(`It's a tie!`);
            } else {
                setMessage(`${winner} player wins!`);
            }
        } else {
            setMessage('');
        }
    }, [winner, roundNumber, gameState, currentPlayer, playerColor]);

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

    return (
        <div className="mt-4 fixed w-full justify-center flex z-20">
            <div className="flex-1 w-full items-center flex flex-col">
                <div className="flex gap-4">
                    <Card className="overflow-hidden">
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
                            <CollapsibleContent className=" flex items-center justify-center gap-2 mx-2">
                                <span className="pl-2 pr-2 border-r border-l border-border flex items-center gap-1">
                                    <span> Round:</span> <b>{showRound}</b>
                                </span>
                                <span className="pr-2 border-r border-border flex items-center gap-1">
                                    <span> Room: </span>
                                    <b>{room}</b>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span>Time:</span>
                                    <b>{formatGameTime(seconds)}</b>
                                </span>
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
                        </Collapsible>
                    </Card>

                    <Card className="  overflow-hidden ">
                        <Collapsible
                            open={is2DBoardOpen}
                            onOpenChange={setIs2DBoardOpen}
                            className="w-fit flex items-center justify-between h-10">
                            <div className="flex items-center justify-between gap-2 pl-4">
                                <span className="pr-2 h-full items-center flex gap-1 font-semibold">
                                    {getFlatstones(gameState!.tiles, 'black', gameState!.pieces)}
                                    <div className="size-6 bg-orange-950 border-foreground border-2  rounded-full"></div>
                                </span>

                                <div className="py-1 w-[1px] h-6 bg-muted "></div>
                                <span className=" h-full items-center flex  gap-1 font-semibold">
                                    <div className="size-6 bg-brown border-muted border-2 bg-yellow-100 "></div>
                                    {getFlatstones(gameState!.tiles, 'white', gameState!.pieces)}
                                </span>
                            </div>
                            <CollapsibleContent className=" flex items-center justify-center gap-2 mx-2">
                                <span>hola</span>
                                {/* TODO: Show 2D board of take */}
                            </CollapsibleContent>
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
                        </Collapsible>
                    </Card>
                </div>
                {message && <Card className="w-fit p-2 mt-2  flex justify-center">{message}</Card>}
            </div>
        </div>
    );
}
