import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import { SocketManager } from './socket/SocketManager';
import { useSocketStore } from './store/SocketStore';
import ThemeButton from './components/ThemeButton';
import GameUI from './components/GameUI';
import JoinRoomCard from './components/JoinRoomCard';
import { Toaster } from './components/ui/toaster';

function App() {
    SocketManager();

    const { gameState } = useSocketStore();

    function handleCanvasClick() {}

    return (
        <>
            <main className="flex h-screen w-screen  bg-white text-black dark:bg-black dark:text-white ">
                {!gameState ? (
                    <header className="mt-10 fixed  w-full items-center flex flex-col z-20">
                        <h1 className="text-8xl">TAK</h1>
                        <h2>A beautiful game</h2>
                        <JoinRoomCard />
                    </header>
                ) : (
                    <>
                        <GameUI />
                    </>
                )}
                <div className="fixed top-2 right-2 z-20">
                    <ThemeButton />
                </div>
                <Canvas
                    className="z-10"
                    onPointerMissed={() => handleCanvasClick()}
                    shadows
                    camera={{ position: [5, 5, 13], fov: 60 }}>
                    <Scene />
                </Canvas>
            </main>
            <Toaster />
        </>
    );
}

export default App;
