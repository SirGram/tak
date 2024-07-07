import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { joinRoom } from '../manager/SocketManager';
import { Card } from './ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { useClientStore } from '../store/ClientStore';
import { Switch } from './ui/switch';

export default function JoinRoomCard() {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [hasJoined, setHasJoined] = useState(false);

    const navigate = useNavigate();

    const { roomId: urlRoomId } = useParams<{ roomId?: string }>();

    const { mode, setMode } = useClientStore();

    useEffect(() => {
        if (urlRoomId && !hasJoined) {
            const promptedUsername = prompt(
                'Please introduce your username to join room ' + urlRoomId
            );
            if (promptedUsername) {
                setUsername(promptedUsername);
                joinRoom(urlRoomId, promptedUsername, mode);
                setHasJoined(true);
                navigate(`/${urlRoomId}`, { replace: true });
            } else {
                alert('Username is required to join the room.');
                navigate('/', { replace: true });
            }
        }
    }, [urlRoomId, hasJoined]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username) {
            alert('Username is required');
            return;
        }
        if (roomId.length < 1 || roomId.length > 3) {
            alert('Room Number must be between 1 and 3 characters.');
            return;
        }

        joinRoom(roomId, username, mode);
        setHasJoined(true);
        navigate(`/${roomId}`, { replace: true });
    };

    return (
        <Card className="flex flex-col items-center gap-2  mt-20 p-4">
            <span className="text-base animate-pulse mb-2">Create or join a room</span>

            <form
                className="flex items-center h-fit flex-col gap-1"
                onSubmit={(e) => handleSubmit(e)}>
                <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`flex-1 ${username ? 'opacity-100 text-ring' : 'opacity-40 '}  focus-within:opacity-100 `}
                    minLength={3}
                    maxLength={10}
                />

                <Input
                    type="number"
                    placeholder="Room Number"
                    value={roomId}
                    className={`flex-1 ${roomId ? 'opacity-100 text-ring' : 'opacity-40'} focus-within:opacity-100`}
                    onChange={(e) => {
                        setRoomId(e.target.value);
                    }}
                />

                <Button
                    type="submit"
                    variant="default"
                    className="mt-2 text-xl h-full flex-1 w-full ">
                    Play
                </Button>
                <div className="flex items-center space-x-2 pt-4">
                    <label htmlFor="game-mode">Localplayer</label>
                    <Switch
                        id="game-mode"
                        checked={mode === 'multiplayer'}
                        onCheckedChange={() => setMode(mode === 'local' ? 'multiplayer' : 'local')}
                    />
                    <label htmlFor="game-mode">Multiplayer</label>
                </div>
            </form>
        </Card>
    );
}
