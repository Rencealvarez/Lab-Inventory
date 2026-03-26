import React, { useState } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';

export default function GlobalChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    const mockMessages = [
        { id: 1, user: 'Admin', text: 'Welcome to the Lab System Chat!', time: '10:00 AM', isMe: false },
        { id: 2, user: 'System', text: 'New incident reported in Bio Lab.', time: '10:05 AM', isMe: false },
        { id: 3, user: 'Me', text: 'I will check it out.', time: '10:06 AM', isMe: true },
    ];

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
                                <p className="text-[11px] text-blue-100 opacity-80">Online: 4 users</p>
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
                        {mockMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] space-y-1 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        {!msg.isMe && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{msg.user}</span>}
                                        <span className="text-[9px] text-gray-400">{msg.time}</span>
                                    </div>
                                    <div className={`rounded-2xl px-4 py-2.5 text-[13px] shadow-sm ${
                                        msg.isMe 
                                            ? 'bg-[#3f59a3] text-white rounded-tr-none' 
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-100 bg-white p-4">
                        <div className="relative flex items-center gap-2">
                            <input 
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-[13px] focus:border-[#3f59a3] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3f59a3] transition-all"
                            />
                            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3f59a3] text-white hover:bg-[#344d8c] transition-colors shadow-md">
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
                        2
                    </span>
                )}
            </button>
        </div>
    );
}
