import { ArrowLeft, ArrowLeftFromLine, ArrowRight, ArrowRightFromLine } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useEffect } from 'react';
import { useSocketStore } from '../store/SocketStore';
import { useClientStore } from '../store/ClientStore';
import { useToast } from './ui/use-toast';

export default function History() {
    const { gameState, playerColor } = useSocketStore();
    const { showMove, setShowMove } = useClientStore();
    console.log(gameState?.history.length);
    console.log(showMove);
    const { toast } = useToast();

    const playerTurn = playerColor === gameState?.currentPlayer && gameState?.gameStarted;

    useEffect(() => {
        if (!gameState) return;

        const historyLength = gameState.history.length;
        console.log('History length:', historyLength);
        console.log('Current showMove:', showMove);

        setShowMove(historyLength - 1);

        /*  if (historyLength > 0 && showMove === historyLength - 1) {
            // We're at the latest move, update to new latest
        } else if (historyLength > showMove + 1) {
            // New move(s) added while we're viewing history
            toast({
                title: 'New move made',
                description: 'Use the history controls to view the latest move',
                variant: 'default',
            });
        } */
    }, [gameState?.history]);

    const disableAll =
       ( (playerTurn && gameState.selectedStack.length > 0) ||
        (gameState && gameState.history.length < 2)) || false;
    const disablePrevious = showMove <= 0;
    const disableNext = gameState && showMove > gameState.history.length - 2;
    /* 
    const disableLast = showMove === history.length - 1 || history.length === 0; */

    const disableLast = false;

    const previousBoard = () => {
        if (showMove > 0) {
            setShowMove(showMove - 1);
        }
    };

    const nextBoard = () => {
        if (!gameState) return;
        if (showMove <= gameState.history.length - 1) {
            setShowMove(showMove + 1);
        }
    };

    const firstBoard = () => {
        if (!disablePrevious) {
            setShowMove(0);
        }
    };

    const lastBoard = () => {
        if (!disableLast && gameState) {
            setShowMove(gameState.history.length - 1);
        }
    };

    return (
        <Card className="fixed bottom-0 right-0 m-3 w-fit h-[2.75rem] z-20 overflow-hidden bg-transparent">
            <div className="flex justify-center h-full">
                <Button
                    className={`rounded-none h-full text-background dark:text-foreground ${disablePrevious ? 'pointer-events-none opacity-50' : ''}`}
                    variant={'ghost'}
                    onClick={firstBoard}
                    disabled={disablePrevious || disableAll}>
                    <ArrowLeftFromLine />
                </Button>
                <Separator />

                <Button
                    className={`rounded-none h-full text-background dark:text-foreground ${disablePrevious ? 'pointer-events-none opacity-50' : ''}`}
                    variant={'ghost'}
                    onClick={previousBoard}
                    disabled={disablePrevious || disableAll}>
                    <ArrowLeft />
                </Button>
                <Separator />
                <Button
                    className={`rounded-none h-full text-background dark:text-foreground ${disableNext ? 'pointer-events-none opacity-50' : ''}`}
                    variant={'ghost'}
                    onClick={nextBoard}
                    disabled={disableNext || disableAll}>
                    <ArrowRight />
                </Button>
                <Separator />
                <Button
                    className={`rounded-none h-full text-background dark:text-foreground ${disableLast ? 'pointer-events-none opacity-50' : ''}`}
                    variant={'ghost'}
                    onClick={lastBoard}
                    disabled={disableNext || disableAll}>
                    <ArrowRightFromLine />
                </Button>
            </div>
        </Card>
    );
}

export function Separator() {
    return <div className="w-[1px] bg-muted my-1"></div>;
}
