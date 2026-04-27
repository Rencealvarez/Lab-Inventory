import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageSquare, X, Send } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function formatChatTime(isoValue) {
    if (!isoValue) return '';
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function toChatMessage(row, currentUserId) {
    const senderRole = row?.type ?? row?.users?.role ?? 'staff';
    const senderName = row?.users?.name ?? (senderRole === 'system' ? 'System' : 'Unknown User');

    return {
        id: row.id,
        userId: row.user_id,
        senderName,
        senderRole,
        content: row.content,
        createdAt: row.created_at,
        isMe: Number(row.user_id) === Number(currentUserId),
    };
}

export default function GlobalChat() {
    const { auth } = usePage().props;
    const currentUser = auth?.user;
    const currentUserId = currentUser?.id;
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const isOpenRef = useRef(false);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        let isMounted = true;
        const channelName = 'global-lab-chat';
        const chatChannel = supabase.channel(channelName, {
            config: {
                presence: {
                    key: `user-${currentUserId ?? crypto.randomUUID()}`,
                },
            },
        });

        const setOnlineCountFromPresence = () => {
            const state = chatChannel.presenceState();
            const count = Object.keys(state).length;
            setOnlineUsers(count > 0 ? count : 1);
        };

        const loadMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('id, user_id, content, type, created_at, users(name, role)')
                .order('created_at', { ascending: true })
                .limit(200);

            if (error || !isMounted) return;

            setMessages((data ?? []).map((row) => toChatMessage(row, currentUserId)));
        };

        loadMessages();

        chatChannel
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    const inserted = payload.new;

                    if (!inserted?.id) return;

                    const { data: joinedRow } = await supabase
                        .from('messages')
                        .select('id, user_id, content, type, created_at, users(name, role)')
                        .eq('id', inserted.id)
                        .single();

                    const nextRow = joinedRow ?? inserted;

                    setMessages((prev) => {
                        if (prev.some((item) => item.id === nextRow.id)) {
                            return prev;
                        }

                        const mappedMessage = toChatMessage(nextRow, currentUserId);
                        if (!isOpenRef.current && !mappedMessage.isMe) {
                            setUnreadCount((count) => count + 1);
                        }

                        return [...prev, mappedMessage];
                    });
                }
            )
            .on('presence', { event: 'sync' }, setOnlineCountFromPresence)
            .subscribe(async (status) => {
                if (status !== 'SUBSCRIBED') return;

                await chatChannel.track({
                    user_id: currentUserId,
                    role: currentUser?.role ?? 'staff',
                    online_at: new Date().toISOString(),
                });
            });

        return () => {
            isMounted = false;
            supabase.removeChannel(chatChannel);
        };
    }, [currentUser?.role, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    const renderedMessages = useMemo(() => {
        return messages.map((msg) => ({
            ...msg,
            roleLabel: String(msg.senderRole ?? 'staff').toUpperCase(),
            timeLabel: formatChatTime(msg.createdAt),
        }));
    }, [messages]);

    const onSendMessage = async () => {
        const trimmed = message.trim();
        if (!trimmed || !currentUserId) return;

        const senderRole = String(currentUser?.role ?? 'staff').toLowerCase() === 'admin' ? 'admin' : 'staff';

        const { error } = await supabase.from('messages').insert({
            user_id: currentUserId,
            content: trimmed,
            type: senderRole,
        });

        if (!error) {
            setMessage('');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 flex h-[450px] w-[350px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 transition-all duration-300 ease-in-out transform origin-bottom-right scale-100 animate-in fade-in zoom-in">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-[#3f59a3] px-5 py-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                <MessageSquare className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Global Lab Chat</h3>
                                <p className="text-[11px] text-blue-100 opacity-80">Online: {onlineUsers} users</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-4">
                        {renderedMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] space-y-1 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        {!msg.isMe && (
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                {msg.roleLabel} - {msg.senderName}
                                            </span>
                                        )}
                                        {msg.isMe && (
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                {msg.roleLabel}
                                            </span>
                                        )}
                                        <span className="text-[9px] text-gray-400">{msg.timeLabel}</span>
                                    </div>
                                    <div className={`rounded-2xl px-4 py-2.5 text-[13px] shadow-sm ${
                                        msg.isMe 
                                            ? 'bg-[#3f59a3] text-white rounded-tr-none' 
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-100 bg-white p-4">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        onSendMessage();
                                    }
                                }}
                                placeholder="Type your message..."
                                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-[13px] focus:border-[#3f59a3] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3f59a3] transition-all"
                            />
                            <button
                                type="button"
                                onClick={onSendMessage}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3f59a3] text-white hover:bg-[#344d8c] transition-colors shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={!message.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#3f59a3] text-white shadow-xl hover:bg-[#344d8c] hover:scale-110 transition-all duration-300 ${
                    isOpen ? 'rotate-90' : 'rotate-0'
                }`}
            >
                {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
}
