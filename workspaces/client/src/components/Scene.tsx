import { CameraControls, SpotLight } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import PhysicalBoard from './Board';
import Pieces from './Pieces';
import { useGlobalState } from '../store/store';
import { useEffect, useRef, useState } from 'react';
import { useControls } from 'leva';
import { Candle } from '../models/candle';

export default function Scene() {
    const {  gameStarted } = useGlobalState();

    const controls = useRef();

    useEffect(() => {
        if (gameStarted && controls.current) {
           //move camera
        }
    }, [gameStarted]);

    return (
        <>
            <ambientLight intensity={0.01} />

            <CameraControls ref={controls} />
            <directionalLight
                shadow-bias={-0.001}
                color={'white'}
                intensity={0.2}
                position={[-10, 25, -10]}
            />

            <pointLight position={[-1, 2,-1.5]} intensity={10} color="orange"   />
            <pointLight position={[5.2, 2, 5]} intensity={10} color="orange"   />
            <directionalLight
                shadow-bias={-0.001}
                color={'blue'}
                intensity={0.3}
                position={[-10, 5, -10]}
            />
            <PhysicalBoard />
            <Pieces />

            <Candle position={[5.2, -0.24,  5.3]} scale={[1, 3, 1]} />
            <Candle position={[-1.3, -0.24,-1.2]} scale={[1, 3, 1]} rotation={[0,-Math.PI/2, 0]}/>
        </>
    );
}
