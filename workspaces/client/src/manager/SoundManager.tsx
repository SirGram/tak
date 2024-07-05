import { useSocketStore } from '../store/SocketStore';
import { useEffect, useRef } from 'react';
import startBoardSound from '../assets/sounds/startBoard.mp3';
import placePieceSound from '../assets/sounds/placePiece.mp3';
import { isBoardEmpty } from '../logic/board';
import { useSettingsStore } from '../store/SettingsStore';

export const SoundManager = () => {
    const { gameState } = useSocketStore();
    const { audioEnabled } = useSettingsStore();

    const startGameSoundRef = useRef(new Audio(startBoardSound));
    const placePieceSoundRef = useRef(new Audio(placePieceSound));
    const prevTilesRef = useRef(gameState?.tiles);

    useEffect(() => {
        if (!gameState || !audioEnabled) return;
        console.log(gameState?.roundNumber);
        if (gameState.gameStarted) {
            startGameSoundRef.current
                .play()
                .catch((error) => console.error('Error playing sound:', error));
        }
    }, [gameState?.gameStarted]);

    useEffect(() => {
        if (!gameState || !audioEnabled) return;
        const prevTiles = prevTilesRef.current;
        const currentTiles = gameState.tiles;

        const areTilesEqual = JSON.stringify(prevTiles) === JSON.stringify(currentTiles);
        if (!areTilesEqual && !isBoardEmpty(currentTiles)) {
            placePieceSoundRef.current
                .play()
                .catch((error) => console.error('Error playing place piece sound:', error));
        }
        prevTilesRef.current = currentTiles;
    }, [gameState?.tiles]);
};
