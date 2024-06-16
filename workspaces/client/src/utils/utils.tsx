import { Vector3 } from '@react-three/fiber';
import { Position } from '../logic';

export function randomAngle(): number {
    return Math.random() * Math.PI;
}

export function vector3ToPosition(vector: Vector3): Position {
    // Assuming z coordinate is not needed in Position
    return {
        x: Math.floor(vector[0]),
        y: Math.floor(vector[2]),
    };
}
