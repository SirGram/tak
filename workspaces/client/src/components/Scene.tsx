import { Environment, OrbitControls } from '@react-three/drei';
import Board from './Board';
import { useSettingsStore } from '../store/SettingsStore';
import { useSocketStore } from '../store/SocketStore';

export default function Scene() {
    const { gameState } = useSocketStore();
    const { lightTheme } = useSettingsStore();

    return (
        <>
            {lightTheme ? (
                <>
                    <Environment
                        background={true}
                        backgroundBlurriness={0.8}
                        backgroundIntensity={1}
                        backgroundRotation={[0, Math.PI / 2, 0]}
                        environmentIntensity={0.5}
                        environmentRotation={[0, Math.PI / 2, 0]}
                        files={['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']}
                        path="/"
                        preset={'dawn'}
                        scene={undefined}
                        encoding={undefined}
                    />

                    <ambientLight intensity={0.1} color={'#BDD9FF'} />
                    <directionalLight
                        castShadow
                        shadow-bias={-0.001}
                        color={'#FFC161'}
                        intensity={3}
                        position={[-20, 25, -20]}
                    />
                </>
            ) : (
                <>
                    <Environment
                        background={true}
                        backgroundBlurriness={0.3}
                        backgroundIntensity={0.2}
                        backgroundRotation={[0, Math.PI / 2, 0]}
                        environmentIntensity={1}
                        environmentRotation={[0, Math.PI / 2, 0]}
                        files={'nightbg.jpg'}
                        scene={undefined}
                        encoding={undefined}
                    />
                    <ambientLight intensity={0.01} />

                    <directionalLight
                        shadow-bias={-0.001}
                        color={'#CEEBFF'}
                        intensity={1}
                        position={[1, 3, -1]}
                        castShadow
                    />

                    <pointLight position={[-1, 2, -1.5]} intensity={10} color="orange" />
                    <pointLight position={[5.2, 2, 5]} intensity={10} color="orange" />
                    <directionalLight
                        shadow-bias={-0.001}
                        color={'blue'}
                        intensity={0.3}
                        position={[-10, 5, -10]}
                    />
                </>
            )}

            <OrbitControls
                minDistance={5}
                maxDistance={20}
                target={[2, 0, 2]}
                enablePan={false}
                enabled={gameState?.gameStarted || false}
            />

            <Board />
            
        </>
    );
}
