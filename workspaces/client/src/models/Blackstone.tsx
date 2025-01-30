/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { GroupProps } from '@react-three/fiber';
import { useClientStore } from '../store/ClientStore';
import { animated, useSpring } from '@react-spring/three';
type GLTFResult = GLTF & {
    nodes: {
        Cylinder003: THREE.Mesh;
    };
    materials: {
        ['Material.018']: THREE.MeshStandardMaterial;
    };
};

type Props = GroupProps & {
    isSelected: boolean;
    opacity: number;
    isStanding: boolean;
    isHovered: boolean;
};

export function Blackstone({ isSelected, opacity, isStanding, isHovered, ...props }: Props) {
    const { nodes, materials } = useGLTF('/blackstone.glb') as GLTFResult;

    const { getSelectedColor } = useClientStore();
    const selectedColor = getSelectedColor();

    const material = useMemo(() => {
        const newMaterial = materials['Material.018'];
        newMaterial.opacity = opacity;
        newMaterial.transparent = true;
        return newMaterial;
    }, [materials, opacity]);

    const { rotation, position } = useSpring({
        rotation: isStanding ? [-Math.PI / 2, -0.1, 0] : [0, -0.1, 0],
        position: isStanding ? [0.2, 0.25, 0.3] : [0, -0.9, 0],
        config: { mass: 1, tension: 170, friction: 26 },
    });
    

    return (
        <group {...props} dispose={null}>
             {(isSelected || isHovered) && (
                <animated.mesh
                  
                    geometry={nodes.Cylinder003.geometry}
                    position={position as any}
                    rotation={rotation as any}
                    scale={[1.72, 0.34, 1.72]} // Slightly larger than the main mesh
                >
                    <meshBasicMaterial color={selectedColor} side={THREE.BackSide} />
                </animated.mesh>
            )}
              <animated.mesh
                castShadow
                receiveShadow
                geometry={nodes.Cylinder003.geometry}
                material={material}
                position={position as any}
                rotation={rotation as any}
                scale={[1.647, 0.318, 1.647]}
            />
            
        </group>
    );
}

useGLTF.preload('/blackstone.glb');
