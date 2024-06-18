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

export function DFS(grid: number[][]): boolean {
    const rows = grid.length;
    const cols = grid[0].length;

    // Visited matrix to keep track of visited cells
    const visited: boolean[][] = new Array(rows).fill(null).map(() => new Array(cols).fill(false));

    // Function to perform DFS
    function dfs(r: number, c: number): void {
        // Base cases for out of bounds or already visited cells
        if (r < 0 || r >= rows || c < 0 || c >= cols || visited[r][c] || grid[r][c] !== 1) {
            return;
        }

        // Mark current cell as visited
        visited[r][c] = true;

        // Perform DFS in all four directions
        dfs(r + 1, c); // Down
        dfs(r - 1, c); // Up
        dfs(r, c + 1); // Right
        dfs(r, c - 1); // Left
    }

    // Perform DFS from the left edge of the grid
    for (let r = 0; r < rows; ++r) {
        if (grid[r][0] === 1 && !visited[r][0]) {
            dfs(r, 0);
        }
    }

    // Check if there's any '1' in the last column that is connected to a visited cell
    for (let r = 0; r < rows; ++r) {
        if (visited[r][cols - 1] && grid[r][cols - 1] === 1) {
            return true;
        }
    }

    // Reset visited for the next DFS run
    visited.forEach(row => row.fill(false));

    // Perform DFS from the top edge of the grid
    for (let c = 0; c < cols; ++c) {
        if (grid[0][c] === 1 && !visited[0][c]) {
            dfs(0, c);
        }
    }

    // Check if there's any '1' in the last row that is connected to a visited cell
    for (let c = 0; c < cols; ++c) {
        if (visited[rows - 1][c] && grid[rows - 1][c] === 1) {
            return true;
        }
    }

    // If no connection found
    return false;
}