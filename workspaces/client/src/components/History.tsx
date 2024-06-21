import { ArrowLeft, ArrowLeftFromLine, ArrowRight, ArrowRightFromLine } from 'lucide-react';
import { Button } from '../../@/components/ui/button';
import { Card } from '../../@/components/ui/card';
import { useEffect } from 'react';
import { useSocketStore } from '../store/SocketStore';
import { useClientStore } from '../store/ClientStore';
import { useToast } from '../../@/components/ui/use-toast';

export default function History() {
    const { gameState } = useSocketStore();
    const { history } = gameState!;
    const { toast } = useToast();
    const { showRound, setShowRound, stack } = useClientStore();

    useEffect(() => {
        if (showRound === history.length - 2) {
            setShowRound(history.length - 1);
        } else {
            toast({
                title: 'Opponent made a move',
                description: 'Update history to show opponent move',
                variant: 'default',
            });
        }
    }, [history]);

    const disableAll = stack.length > 0;

    const disableFirst = showRound === 0;
    const disablePrevious = showRound <= 0;
    const disableNext = showRound >= history.length - 1;
    const disableLast = showRound === history.length - 1 || history.length === 0;

    const previousBoard = () => {
        if (showRound > 0) {
            setShowRound(showRound - 1);
        }
    };

    const nextBoard = () => {
        if (showRound < gameState.history.length - 1) {
            setShowRound(showRound + 1);
        }
    };

    const firstBoard = () => {
        if (!disableFirst) {
            setShowRound(0);
        }
    };

    const lastBoard = () => {
        if (!disableLast) {
            setShowRound(history.length - 1);
        }
    };

    return (
        <Card className="fixed bottom-0 right-0 m-3 w-fit h-[2.75rem] z-20 overflow-hidden bg-transparent">
            <div className="flex justify-center h-full">
                <Button
                    className={`rounded-none h-full text-background dark:text-foreground ${disableFirst ? 'pointer-events-none opacity-50' : ''}`}
                    variant={'ghost'}
                    onClick={firstBoard}
                    disabled={disableFirst || disableAll}>
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
                    disabled={disableLast || disableAll}>
                    <ArrowRightFromLine />
                </Button>
            </div>
        </Card>
    );
}

export function Separator() {
    return <div className="w-[1px] bg-muted my-1"></div>;
}
