/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { GroupProps } from '@react-three/fiber';
import { useClientStore } from '../store/ClientStore';
import { Position3D } from '../../../common/types';

type GLTFResult = GLTF & {
    nodes: {
        Cube002: THREE.Mesh;
    };
    materials: {
        Material: THREE.MeshStandardMaterial;
    };
};

type Props = GroupProps & {
    isSelected: boolean;
    opacity: number;
    isStanding: boolean;
};

export function Whitestone({ isSelected, opacity, isStanding, ...props }: Props) {
    const { nodes, materials } = useGLTF('/whitestone.glb') as GLTFResult;

    const { selectedColor } = useClientStore();

    const material = useMemo(() => {
        const newMaterial = materials.Material.clone();
        newMaterial.opacity = opacity;
        newMaterial.transparent = true;
        return newMaterial;
    }, [materials.Material, opacity]);

    const rotation: Position3D = isStanding ? [Math.PI / 2, 0, 0] : [0, 0, 0];
    const position: Position3D = isStanding ? [0.2, 0.4, 0.3] : [0.2, -0.9, 0.3];
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube002.geometry}
                material={material}
                position={position}
                rotation={rotation}
                scale={[1, 0.9, 1]}>
                {isSelected && <meshStandardMaterial attach="material" color={selectedColor} />}
            </mesh>
        </group>
    );
}

useGLTF.preload('/whitestone.glb');
