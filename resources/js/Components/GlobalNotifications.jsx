import React, { useState } from 'react';
import { Bell, ShoppingCart, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';

export default function GlobalNotifications() {
    const [unreadCount, setUnreadCount] = useState(3);

    const mockNotifications = [
        {
            id: 1,
            title: 'New Transaction',
            message: 'John Doe borrowed Microscope (SKU-001)',
            time: '2 mins ago',
            type: 'transaction',
            icon: <ShoppingCart className="h-4 w-4 text-blue-500" />,
            bgColor: 'bg-blue-50',
            isRead: false
        },
        {
            id: 2,
            title: 'Critical Incident',
            message: 'Centrifuge (SKU-010) reported with High Severity',
            time: '15 mins ago',
            type: 'incident',
            icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
            bgColor: 'bg-red-50',
            isRead: false
        },
        {
            id: 3,
            title: 'Maintenance Update',
            message: 'Beaker 500ml repair cost updated to $15.00',
            time: '1 hour ago',
            type: 'maintenance',
            icon: <Clock className="h-4 w-4 text-orange-500" />,
            bgColor: 'bg-orange-50',
            isRead: false
        },
        {
            id: 4,
            title: 'System Alert',
            message: 'Inventory report for March is now available',
            time: '3 hours ago',
            type: 'system',
            icon: <Info className="h-4 w-4 text-gray-500" />,
            bgColor: 'bg-gray-50',
            isRead: true
        }
    ];

    return (
        <div className="relative ms-3">
            <Dropdown>
                <Dropdown.Trigger>
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#3f59a3] transition-all duration-200 focus:outline-none ring-1 ring-gray-200">
                        <Bell className="h-[20px] w-[20px]" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </Dropdown.Trigger>

                <Dropdown.Content align="right" width="80" className="overflow-hidden p-0 rounded-xl shadow-2xl border border-gray-100">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 bg-white/50 backdrop-blur-sm">
                        <h3 className="text-[15px] font-bold text-gray-800">Notifications</h3>
                        <button 
                            onClick={() => setUnreadCount(0)}
                            className="text-[12px] font-semibold text-[#3f59a3] hover:text-[#344d8c] hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto bg-white divide-y divide-gray-50">
                        {mockNotifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`flex gap-4 px-5 py-4 transition-colors hover:bg-gray-50/80 cursor-pointer ${!notif.isRead ? 'bg-[#f4f7fb]/60' : ''}`}
                            >
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transform hover:scale-110 transition-transform ${notif.bgColor}`}>
                                    {notif.icon}
                                </div>
                                <div className="flex-1 space-y-1 overflow-hidden">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-[13px] leading-none ${!notif.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                            {notif.title}
                                        </p>
                                        <span className="flex-shrink-0 text-[10px] font-medium text-gray-400">
                                            {notif.time}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-gray-500 leading-relaxed truncate">
                                        {notif.message}
                                    </p>
                                </div>
                                {!notif.isRead && (
                                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-center">
                        <button className="text-[13px] font-bold text-gray-500 hover:text-gray-800 transition-colors">
                            View All Notifications
                        </button>
                    </div>
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
}
