import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import { SocketManager } from './manager/SocketManager';
import { useSocketStore } from './store/SocketStore';
import ThemeButton from './components/ThemeButton';
import JoinRoomCard from './components/JoinRoomCard';
import { Toaster } from './components/ui/toaster';
import { SoundManager } from './manager/SoundManager';
import AudioButton from './components/AudioButton';
import GameUI from './components/GameUI';
import HowToPlayAccordion from './components/HowToPlayAccordion';

function App() {
    SocketManager();
    SoundManager();

    const { gameState } = useSocketStore();

    function handleCanvasClick() {}

    return (
        <>
            <main className="flex h-screen w-screen  bg-white text-black dark:bg-black dark:text-white ">
                {!gameState ? (
                    <header className=" fixed  w-full items-center flex flex-col z-20 h-screen">
                        <h1 className="text-8xl mt-10">TAK</h1>
                        <h2>A beautiful game</h2>
                        <div className="flex flex-col gap-4 justify-center items-center h-full -mt-10 flex-1 w-fit ">
                            <JoinRoomCard />
                            <HowToPlayAccordion />
                        </div>
                    </header>
                ) : (
                    <>
                        <GameUI />
                    </>
                )}
                <div className="fixed top-2 right-2 z-20">
                    <AudioButton />
                    <ThemeButton />
                </div>
                <Canvas
                    className="z-10"
                    onPointerMissed={() => handleCanvasClick()}
                    shadows
                    camera={{ position: [8, 5, 8], rotation: [0, 0, 0], fov: 60 }}>
                    <Scene />
                </Canvas>
            </main>
            <Toaster />
        </>
    );
}

export default App;
