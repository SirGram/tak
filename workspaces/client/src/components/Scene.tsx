import { CameraControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import PhysicalBoard from './Board';
import Pieces from './Pieces';
import { useGlobalState } from '../store/store';
import { useEffect, useRef, useState } from 'react';
import { useControls } from 'leva';

export default function Scene() {
    const { setGameStarted, gameStarted } = useGlobalState();

    const controls = useRef();

    if (gameStarted && controls.current) {
        controls.current.moveTo(2, 2.5, 6, true);
        controls.current.rotate(0, -0.4, true);
    }

    return (
        <>
            <ambientLight intensity={0.1} />

            <CameraControls ref={controls} />
            <directionalLight
                shadow-bias={-0.001}
                castShadow
                color={'white'}
                intensity={2}
                position={[-10, 25, -10]}
            />
            <directionalLight
                shadow-bias={-0.001}
                color={'orange'}
                intensity={3.2}
                position={[0, 5, 10]}
            />
            <directionalLight
                shadow-bias={-0.001}
                color={'blue'}
                intensity={2}
                position={[-10, 5, -10]}
            />
            <PhysicalBoard />
            <Pieces />
        </>
    );
}
