import { Environment, OrbitControls} from '@react-three/drei';
import Board from './Board';
import { useSettingsStore } from '../store/SettingsStore';
import { useSocketStore } from '../store/SocketStore';

export default function Scene() {
    const {gameState}= useSocketStore()
    const { lightTheme } = useSettingsStore();

    return (
        <>
            {lightTheme ? (
                <>
                    <Environment
                        background={true} // can be true, false or "only" (which only sets the background) (default: false)
                        backgroundBlurriness={0.8} // optional blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
                        backgroundIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
                        backgroundRotation={[0, Math.PI / 2, 0]} // optional rotation (default: 0, only works with three 0.163 and up)
                        environmentIntensity={0.5} // optional intensity factor (default: 1, only works with three 0.163 and up)
                        environmentRotation={[0, Math.PI / 2, 0]} // optional rotation (default: 0, only works with three 0.163 and up)
                        files={['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']}
                        path="/"
                        preset={'dawn'}
                        scene={undefined} // adds the ability to pass a custom THREE.Scene, can also be a ref
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
                        background={true} // can be true, false or "only" (which only sets the background) (default: false)
                        backgroundBlurriness={0.3} // optional blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
                        backgroundIntensity={0.2} // optional intensity factor (default: 1, only works with three 0.163 and up)
                        backgroundRotation={[0, Math.PI / 2, 0]} // optional rotation (default: 0, only works with three 0.163 and up)
                        environmentIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
                        environmentRotation={[0, Math.PI / 2, 0]} // optional rotation (default: 0, only works with three 0.163 and up)
                        files={'nightbg.jpg'}
                        scene={undefined} // adds the ability to pass a custom THREE.Scene, can also be a ref
                        encoding={undefined} // adds the ability to pass a custom THREE.TextureEncoding (default: THREE.sRGBEncoding for an array of files and THREE.LinearEncoding for a single texture)
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

            {gameState && gameState.gameStarted && <OrbitControls />}

            <Board />
           

           
        </>
    );
}
