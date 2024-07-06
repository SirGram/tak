/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { Sparkles } from '@react-three/drei';
import { useSettingsStore } from '../store/SettingsStore';

type GLTFResult = GLTF & {
    nodes: {
        Circle003_1: THREE.Mesh;
        Circle003_2: THREE.Mesh;
        Vert003: THREE.Mesh;
    };
    materials: {
        Candle: THREE.MeshStandardMaterial;
        Flame: THREE.MeshStandardMaterial;
        ['Material.002']: THREE.MeshStandardMaterial;
    };
};

export function Candle(props: JSX.IntrinsicElements['group']) {
    const { nodes, materials } = useGLTF('/candle.glb') as GLTFResult;

    const { lightTheme } = useSettingsStore();
    return (
        <group {...props} dispose={null}>
            <group
                position={[0.016,-0.1, 0.002]}
                rotation={[-Math.PI, 1.419, -Math.PI]}
                scale={[0.424, 0.3, 0.424]}>
                <mesh
                    name="Circle003_1"
                    geometry={nodes.Circle003_1.geometry}
                    material={materials.Candle}
                    morphTargetDictionary={nodes.Circle003_1.morphTargetDictionary}
                    morphTargetInfluences={nodes.Circle003_1.morphTargetInfluences}
                    castShadow
                />
                {!lightTheme && (
                    <mesh
                        name="Circle003_2"
                        geometry={nodes.Circle003_2.geometry}
                        material={materials.Flame}
                        morphTargetDictionary={nodes.Circle003_2.morphTargetDictionary}
                        morphTargetInfluences={nodes.Circle003_2.morphTargetInfluences}
                    />
                )}
                <mesh
                    geometry={nodes.Vert003.geometry}
                    material={materials['Material.002']}
                    position={[-0.001, 1.388, 0]}>
                    {!lightTheme && (
                        <Sparkles
                            scale={0.01}
                            position={[0, 0.5, 0]}
                            size={2}
                            color={'white'}
                            opacity={10}
                            count={3}
                            speed={1}
                        />
                    )}
                </mesh>
            </group>
        </group>
    );
}

useGLTF.preload('/candle.glb');
