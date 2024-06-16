/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from 'three';
import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { GroupProps } from '@react-three/fiber';
import { useGlobalState } from '../store/store';

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
};

export function Whitestone({ isSelected, opacity, ...props }: Props) {
    const { nodes, materials } = useGLTF('/whitestone.glb') as GLTFResult;

    const { selectedColor } = useGlobalState();

    const material = useMemo(() => {
        const newMaterial = materials.Material.clone();
        newMaterial.opacity = opacity;
        newMaterial.transparent = true;
        return newMaterial;
    }, [materials.Material, opacity]);
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube002.geometry}
                material={material}
                position={[0.2, -0.9, 0.3]}
                scale={[1, 0.9, 1]}>
                {isSelected && <meshStandardMaterial attach="material" color={selectedColor} />}
            </mesh>
        </group>
    );
}

useGLTF.preload('/whitestone.glb');
