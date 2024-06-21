import { useSettingsStore } from '../store/SettingsStore';
import { Button } from '../../@/components/ui/button';

import { Sun, Moon } from 'lucide-react';
import { useEffect } from 'react';

export default function ThemeButton() {
    const { lightTheme, updateTheme } = useSettingsStore();

    
    useEffect(() => {
        if (lightTheme) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, [lightTheme]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => {
                updateTheme(!lightTheme);
            }}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    );
}
