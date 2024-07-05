import { useSettingsStore } from '../store/SettingsStore';
import { Button } from './ui/button';

import { VolumeX, Volume2 } from 'lucide-react';
import { useEffect } from 'react';

export default function AudioButton() {
    const { audioEnabled, toggleAudio } = useSettingsStore();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => {
                toggleAudio();
            }}>
            {audioEnabled ? (
                <Volume2 className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            ) : (
                <VolumeX className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            )}{' '}
        </Button>
    );
}
