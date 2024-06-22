import { useState, useEffect, useRef } from 'react';

const useSeconds = () => {

    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [seconds, setSeconds] = useState(0);
    const addSecond = () => {
        setSeconds(prev=>prev + 1);
    };

    const resetSeconds = () => {
        setSeconds(0);
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                addSecond();
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    const startStopWatch = () => {
        setIsRunning(true);
        resetSeconds();
    };

    const stopStopwatch = () => {
        setIsRunning(false);
    };
    const resetStopwatch = () => {
        resetSeconds();
        setIsRunning(false);
    };

    return { seconds, startStopWatch, resetStopwatch, stopStopwatch };
};

export default useSeconds;
