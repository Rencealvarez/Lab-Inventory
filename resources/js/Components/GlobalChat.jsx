import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

function toChatMessage(row, currentUserId, userDirectory) {
    const senderInfo = userDirectory.get(String(row?.user_id));
    const senderRole = row?.type ?? senderInfo?.role?.toLowerCase() ?? 'staff';
    const senderName = senderInfo?.displayName ?? (senderRole === 'system' ? 'System' : `User #${row?.user_id ?? ''}`);

    return {
        id: row.id,
        userId: row.user_id,
        recipientId: row.recipient_id,
        senderName,
        senderRole,
        content: row.content,
        createdAt: row.created_at,
        isMe: Number(row.user_id) === Number(currentUserId),
    };
}

function isConversationMessage(row, currentUserId, selectedUserId) {
    if (!selectedUserId) return false;

    const me = Number(currentUserId);
    const selected = Number(selectedUserId);
    const sender = Number(row?.user_id ?? row?.userId);
    const recipient = Number(row?.recipient_id ?? row?.recipientId);

    return (sender === me && recipient === selected) || (sender === selected && recipient === me);
}

function getInitials(name) {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export default function GlobalChat() {
    const { auth } = usePage().props;
    const currentUser = auth?.user;
    const currentUserId = currentUser?.id;
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatUsers, setChatUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [schemaReady, setSchemaReady] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(1);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [unreadByUser, setUnreadByUser] = useState({});
    const [conversationFilter, setConversationFilter] = useState('all');
    const messagesEndRef = useRef(null);
    const isOpenRef = useRef(false);
    const selectedUserRef = useRef('');

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        selectedUserRef.current = selectedUserId;
    }, [selectedUserId]);

    const fetchConversation = useCallback(
        async (targetSelectedUserId) => {
            if (!currentUserId || !targetSelectedUserId) {
                setMessages([]);
                return;
            }

            const participants = [Number(currentUserId), Number(targetSelectedUserId)];
            const { data, error } = await supabase
                .from('messages')
                .select('id, user_id, recipient_id, content, type, created_at')
                .in('user_id', participants)
                .in('recipient_id', participants)
                .order('created_at', { ascending: true })
                .limit(200);

            if (error) {
                if (error.message?.includes('recipient_id')) {
                    setSchemaReady(false);
                }
                return;
            }

            setSchemaReady(true);
            const filteredRows = (data ?? []).filter((row) =>
                isConversationMessage(row, currentUserId, targetSelectedUserId)
            );
            setMessages(filteredRows.map((row) => toChatMessage(row, currentUserId, userDirectoryRef.current)));
        },
        [currentUserId]
    );

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

        const loadUsers = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, username, email, role')
                .neq('id', currentUserId)
                .order('name', { ascending: true, nullsFirst: false });

            if (error || !isMounted) return;

            const mappedUsers = (data ?? []).map((user) => ({
                id: String(user.id),
                role: String(user.role ?? 'staff').toUpperCase(),
                displayName: user.name ?? user.username ?? user.email ?? `User #${user.id}`,
            }));

            setChatUsers(mappedUsers);
            setSelectedUserId((prev) => (mappedUsers.some((user) => user.id === prev) ? prev : ''));
        };

        const setOnlineCountFromPresence = () => {
            const state = chatChannel.presenceState();
            const uniqueOnlineIds = new Set();

            Object.values(state).forEach((presences) => {
                (presences ?? []).forEach((presence) => {
                    if (presence?.user_id !== undefined && presence?.user_id !== null) {
                        uniqueOnlineIds.add(String(presence.user_id));
                    }
                });
            });

            setOnlineUserIds(Array.from(uniqueOnlineIds));
            setOnlineUsers(uniqueOnlineIds.size > 0 ? uniqueOnlineIds.size : 1);
        };

        loadUsers();

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

                    if (!isConversationMessage(inserted, currentUserId, selectedUserRef.current)) {
                        const isIncomingForCurrentUser = Number(inserted.recipient_id) === Number(currentUserId);
                        if (!isOpenRef.current && isIncomingForCurrentUser && Number(inserted.user_id) !== Number(currentUserId)) {
                            const senderId = String(inserted.user_id);
                            setUnreadByUser((prev) => ({
                                ...prev,
                                [senderId]: (prev[senderId] ?? 0) + 1,
                            }));
                        }
                        return;
                    }

                    const { data: joinedRow } = await supabase
                        .from('messages')
                        .select('id, user_id, recipient_id, content, type, created_at')
                        .eq('id', inserted.id)
                        .single();

                    const nextRow = joinedRow ?? inserted;

                    setMessages((prev) => {
                        if (prev.some((item) => item.id === nextRow.id)) {
                            return prev;
                        }

                        const mappedMessage = toChatMessage(nextRow, currentUserId, userDirectoryRef.current);
                        const isIncomingForCurrentUser = Number(mappedMessage.recipientId) === Number(currentUserId);
                        if (!isOpenRef.current && isIncomingForCurrentUser && !mappedMessage.isMe) {
                            const senderId = String(mappedMessage.userId);
                            setUnreadByUser((prev) => ({
                                ...prev,
                                [senderId]: (prev[senderId] ?? 0) + 1,
                            }));
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
    }, [currentUserId, currentUser?.role]);

    useEffect(() => {
        // Clear previous thread immediately when switching recipient.
        setMessages([]);
        fetchConversation(selectedUserId);
    }, [fetchConversation, selectedUserId]);

    useEffect(() => {
        if (!isOpen || !selectedUserId) return undefined;

        const intervalId = setInterval(() => {
            fetchConversation(selectedUserId);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [fetchConversation, isOpen, selectedUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!isOpen || !selectedUserId) return;

        setUnreadByUser((prev) => {
            if (!prev[selectedUserId]) return prev;

            const next = { ...prev };
            delete next[selectedUserId];
            return next;
        });
    }, [isOpen, selectedUserId]);

    const renderedMessages = useMemo(() => {
        return messages
            .filter((msg) => isConversationMessage(msg, currentUserId, selectedUserId))
            .map((msg) => ({
                ...msg,
                roleLabel: String(msg.senderRole ?? 'staff').toUpperCase(),
                timeLabel: formatChatTime(msg.createdAt),
            }));
    }, [messages, currentUserId, selectedUserId]);

    const selectedUser = useMemo(
        () => chatUsers.find((user) => user.id === selectedUserId),
        [chatUsers, selectedUserId]
    );
    const userDirectory = useMemo(() => {
        const map = new Map();
        if (currentUserId) {
            map.set(String(currentUserId), {
                displayName: currentUser?.name ?? currentUser?.username ?? currentUser?.email ?? `User #${currentUserId}`,
                role: String(currentUser?.role ?? 'staff').toUpperCase(),
            });
        }
        chatUsers.forEach((user) => {
            map.set(String(user.id), {
                displayName: user.displayName,
                role: user.role,
            });
        });
        return map;
    }, [chatUsers, currentUser?.email, currentUser?.name, currentUser?.role, currentUser?.username, currentUserId]);
    const userDirectoryRef = useRef(userDirectory);
    useEffect(() => {
        userDirectoryRef.current = userDirectory;
    }, [userDirectory]);
    const onlineUserIdSet = useMemo(() => new Set(onlineUserIds), [onlineUserIds]);
    const unreadTotal = useMemo(
        () => Object.values(unreadByUser).reduce((sum, count) => sum + count, 0),
        [unreadByUser]
    );
    const onlineRecipientsCount = useMemo(
        () => chatUsers.filter((user) => onlineUserIdSet.has(String(user.id))).length,
        [chatUsers, onlineUserIdSet]
    );
    const sortedChatUsers = useMemo(() => {
        return [...chatUsers].sort((a, b) => {
            const unreadA = unreadByUser[a.id] ?? 0;
            const unreadB = unreadByUser[b.id] ?? 0;
            if (unreadA !== unreadB) return unreadB - unreadA;

            const onlineA = onlineUserIdSet.has(String(a.id)) ? 1 : 0;
            const onlineB = onlineUserIdSet.has(String(b.id)) ? 1 : 0;
            if (onlineA !== onlineB) return onlineB - onlineA;

            return a.displayName.localeCompare(b.displayName);
        });
    }, [chatUsers, onlineUserIdSet, unreadByUser]);
    const visibleChatUsers = useMemo(() => {
        if (conversationFilter === 'unread') {
            return sortedChatUsers.filter((user) => (unreadByUser[user.id] ?? 0) > 0);
        }

        return sortedChatUsers;
    }, [conversationFilter, sortedChatUsers, unreadByUser]);

    const onSendMessage = async () => {
        const trimmed = message.trim();
        if (!trimmed || !currentUserId || !selectedUserId || !schemaReady) return;

        const senderRole = String(currentUser?.role ?? 'staff').toLowerCase() === 'admin' ? 'admin' : 'staff';
        const { error } = await supabase.from('messages').insert({
            user_id: currentUserId,
            recipient_id: Number(selectedUserId),
            content: trimmed,
            type: senderRole,
        });

        if (!error) {
            setMessage('');
            fetchConversation(selectedUserId);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 flex h-[620px] w-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#f3f4f6] shadow-2xl transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-between border-b border-[#3f59a3]/30 bg-[#3f59a3] px-4 py-3 text-white">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                <MessageSquare className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold leading-none">Chats</h3>
                                <p className="mt-1 text-[11px] text-blue-100">{onlineRecipientsCount} online recipients</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="border-b border-gray-200 bg-white px-3 py-3">
                        <div className="mt-3 flex gap-2 text-[12px] font-semibold">
                            <button
                                type="button"
                                onClick={() => setConversationFilter('all')}
                                className={`rounded-full px-3 py-1 transition ${
                                    conversationFilter === 'all' ? 'bg-[#3f59a3] text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setConversationFilter('unread')}
                                className={`rounded-full px-3 py-1 transition ${
                                    conversationFilter === 'unread' ? 'bg-[#3f59a3] text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Unread ({unreadTotal})
                            </button>
                        </div>
                    </div>

                    {!selectedUser ? (
                        <div className="flex-1 border-b border-gray-200 bg-[#f8fafc] px-3 py-2">
                            <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">All Conversations</p>
                            <div className="mt-2 max-h-full space-y-1 overflow-y-auto pr-1">
                                {visibleChatUsers.length === 0 ? (
                                    <p className="px-2 py-2 text-[12px] text-gray-500">
                                        {conversationFilter === 'unread' ? 'No unread conversations.' : 'No users available.'}
                                    </p>
                                ) : (
                                    visibleChatUsers.map((user) => {
                                        const isOnline = onlineUserIdSet.has(String(user.id));
                                        const unread = unreadByUser[user.id] ?? 0;

                                        return (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => setSelectedUserId(user.id)}
                                                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-white"
                                            >
                                            <div className="relative h-9 w-9 shrink-0 rounded-full bg-[#3f59a3] text-center text-[11px] font-bold leading-9 text-white">
                                                    {getInitials(user.displayName)}
                                                    <span
                                                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                                                            isOnline ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[13px] font-semibold text-gray-800">{user.displayName}</p>
                                                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{user.role}</p>
                                                </div>
                                                {unread > 0 && (
                                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                                        {unread}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
                                <p className="text-[13px] font-semibold text-gray-800">{selectedUser.displayName}</p>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUserId('')}
                                    className="text-[11px] font-semibold text-[#3f59a3] hover:text-[#344d8c]"
                                >
                                    Back
                                </button>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto bg-[#f3f4f6] p-4">
                                {!schemaReady && (
                                    <div className="rounded-xl border border-red-300/40 bg-red-400/10 px-3 py-2 text-[12px] text-red-300">
                                        Add `recipient_id` to `messages` table first to enable direct chats.
                                    </div>
                                )}
                                {renderedMessages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] space-y-1 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="mb-1 flex items-center gap-2">
                                                {!msg.isMe && (
                                                    <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500">
                                                        {msg.roleLabel} - {msg.senderName}
                                                    </span>
                                                )}
                                                {msg.isMe && (
                                                    <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{msg.roleLabel}</span>
                                                )}
                                                <span className="text-[9px] text-gray-500">{msg.timeLabel}</span>
                                            </div>
                                            <div
                                                className={`rounded-2xl px-4 py-2.5 text-[13px] shadow-sm ${
                                                    msg.isMe
                                                        ? 'rounded-br-md bg-[#3f59a3] text-white'
                                                        : 'rounded-bl-md border border-gray-200 bg-white text-gray-700'
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </>
                    )}

                    <div className="border-t border-gray-200 bg-white p-3">
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
                                placeholder={selectedUser ? `Message ${selectedUser.displayName}...` : 'Pick a conversation to start...'}
                                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] text-gray-700 transition-all placeholder:text-gray-400 focus:border-[#3f59a3] focus:outline-none focus:ring-1 focus:ring-[#3f59a3]"
                                disabled={!selectedUser || !schemaReady}
                            />
                            <button
                                type="button"
                                onClick={onSendMessage}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3f59a3] text-white shadow-md transition-colors hover:bg-[#344d8c] disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={!message.trim() || !selectedUser || !schemaReady}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#3f59a3] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-[#344d8c] ${
                    isOpen ? 'rotate-90' : 'rotate-0'
                }`}
            >
                {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
                {!isOpen && unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadTotal}
                    </span>
                )}
            </button>
        </div>
    );
}
