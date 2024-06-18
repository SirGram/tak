import { Canvas } from '@react-three/fiber';
import { useGlobalState } from './store/store';
import Scene from './components/Scene';
import { useEffect, useState } from 'react';

function App() {
    const { gameStarted, currentPlayer, setGameStarted, roundNumber, winner } = useGlobalState();

    function handleCanvasClick() {
        if (!gameStarted) setGameStarted(true);
    }

    const [message, setMessage] = useState('');
    useEffect(() => {
        if (roundNumber == 1) {
            setMessage('Select opponent starting flatstone');
        }else if(winner) setMessage(`${winner} player wins`)
        
        else {
            setMessage('');
        }
    }, [roundNumber, winner]);

    return (
        <div className="flex h-screen w-screen font-segoe ">
            {!gameStarted ? (
                <section>
                    <header className="mt-10 fixed  w-full items-center flex flex-col ">
                        <h1 className="text-8xl">TAK</h1>
                        <h2>A beautiful game</h2>
                        <span className="text-base mt-20 animate-pulse">
                            Click anywhere to start a new game
                        </span>
                    </header>
                </section>
            ) : (
                <>
                    <div className="mt-10 fixed w-full justify-center flex flex-col  ">
                        <div className=" w-full justify-center flex gap-10">
                            <span className=""> Player Turn: {currentPlayer}</span>
                            <span className=""> Round: {roundNumber}</span>
                        </div>
                        <div className="mt-10 w-full flex justify-center">{message}</div>
                    </div>
                </>
            )}
            <Canvas
                onPointerMissed={() => handleCanvasClick()}
                shadows
                camera={{ position: [5, 5, 13], fov: 60 }}>
                <Scene />
            </Canvas>
        </div>
    );
}

export default App;
