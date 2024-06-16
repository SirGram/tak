import { Canvas } from '@react-three/fiber';
import { useGlobalState } from './store/store';
import Scene from './components/Scene';

function App() {
    const { gameStarted, currentPlayer, setGameStarted } = useGlobalState();

    function handleCanvasClick() {
        if (!gameStarted) setGameStarted(true);
    }

    return (
        <div className="flex h-screen w-screen">
            {!gameStarted ? (
                <section>
                <header className="mt-10 fixed font-segoe w-full items-center flex flex-col ">
                    <h1 className="text-8xl">TAK</h1>
                    <h2>A beautiful game</h2>
                    <span className='text-base mt-20 animate-pulse'>Click anywhere to start a new game</span>
                </header>
                </section>
            ) : (
                <div className="mt-10 fixed font-segoe w-full justify-center flex  ">
                   <span className=''> Player: {currentPlayer}</span>
                </div>
            )}
            <Canvas onPointerMissed={() => handleCanvasClick()} shadows  camera={{ position: [0, 5, 1], fov: 60 }} >
            <Scene />
            </Canvas>
        </div>
    );
}

export default App;
