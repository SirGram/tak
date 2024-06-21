import { useState, useEffect } from 'react';
import { Button } from '../../@/components/ui/button';
import { useSocketStore } from '../store/SocketStore';
import { Input } from '../../@/components/ui/input';
import { sendMessage } from '../socket/SocketManager';

export default function Messages() {
    const { messages, room, username } = useSocketStore();


    const [newMessage, setNewMessage] = useState('');
    const [lastMessageOpacity, setLastMessageOpacity] = useState(1);

    const numberOfMessages = 8

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!room || !username || !newMessage) return;
        sendMessage(room, username, newMessage);
        setNewMessage('');
    }

    useEffect(() => {
        if (messages.length > 0) {
            setLastMessageOpacity(1);
            const timer = setTimeout(() => {
                setLastMessageOpacity(0.2);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [messages]);

    const filteredMessages = messages.slice(-numberOfMessages);

    return (
        <section className="fixed bottom-0 left-0 z-20 w-[19rem] text-left p-3">
            <ul className="flex flex-col items-center gap-2 p-2 text-sm ">
                {filteredMessages.map((message, index) => (
                    <li
                        key={index}
                        className={`w-full text-left transition-opacity duration-1000 ${index === messages.length - 1 ? `opacity-${lastMessageOpacity * 100}` : 'opacity-20'}`}>
                        <b>{message.username ? `${message.username}: ` : ''}</b>
                        {message.content}
                    </li>
                ))}
            </ul>
            <form className="w-full h-10 flex gap-1" onSubmit={handleSubmit}>
                <Input
                    type="text"
                    className="h-full opacity-50 focus-within:opacity-100 rounded-r-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="GG"
                    maxLength={100}
                />
                <Button type="submit" variant={'ghost'} className="h-full rounded-l-none bg-card">
                    Send
                </Button>
            </form>
        </section>
    );
}
