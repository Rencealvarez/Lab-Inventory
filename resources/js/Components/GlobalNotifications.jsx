import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, ShoppingCart, AlertTriangle, Info, Clock } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';

export default function GlobalNotifications() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const isFetchingRef = useRef(false);

    const iconMap = useMemo(
        () => ({
            transaction: {
                icon: <ShoppingCart className="h-4 w-4 text-blue-500" />,
                bgColor: 'bg-blue-50',
            },
            incident: {
                icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
                bgColor: 'bg-red-50',
            },
            maintenance: {
                icon: <Clock className="h-4 w-4 text-orange-500" />,
                bgColor: 'bg-orange-50',
            },
            system: {
                icon: <Info className="h-4 w-4 text-gray-500" />,
                bgColor: 'bg-gray-50',
            },
        }),
        [],
    );

    const fetchNotifications = async () => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;

        try {
            const { data } = await window.axios.get(route('notifications.index'));
            setNotifications(data.notifications ?? []);
            setUnreadCount(data.unreadCount ?? 0);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        fetchNotifications();

        const intervalId = window.setInterval(() => {
            if (!document.hidden) {
                fetchNotifications();
            }
        }, 10000);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchNotifications();
            }
        };

        const handleWindowFocus = () => {
            fetchNotifications();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, []);

    const handleMarkAsRead = async (notificationId, isRead) => {
        if (isRead) return;

        try {
            const { data } = await window.axios.patch(
                route('notifications.markAsRead', notificationId),
            );

            setNotifications((previous) =>
                previous.map((notif) =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif,
                ),
            );
            setUnreadCount(data.unreadCount ?? 0);
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await window.axios.post(route('notifications.markAllAsRead'));
            setNotifications((previous) => previous.map((notif) => ({ ...notif, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
        }
    };

    const handleOpenNotification = (notification) => {
        setSelectedNotification(notification);
        handleMarkAsRead(notification.id, notification.isRead);
    };

    const detailStyle = selectedNotification
        ? iconMap[selectedNotification.type] ?? iconMap.system
        : iconMap.system;

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

                <Dropdown.Content
                    align="right"
                    width="80"
                    contentClasses="overflow-hidden p-0 rounded-xl shadow-2xl border border-gray-100 bg-white"
                >
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 bg-white/50 backdrop-blur-sm">
                        <h3 className="text-[15px] font-bold text-gray-800">Notifications</h3>
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-[12px] font-semibold text-[#3f59a3] hover:text-[#344d8c] hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto bg-white divide-y divide-gray-50">
                        {notifications.map((notif) => {
                            const style = iconMap[notif.type] ?? iconMap.system;

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => handleOpenNotification(notif)}
                                    className={`flex gap-4 px-5 py-4 transition-colors hover:bg-gray-50/80 cursor-pointer ${!notif.isRead ? 'bg-[#f4f7fb]/60' : ''}`}
                                >
                                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transform hover:scale-110 transition-transform ${style.bgColor}`}>
                                        {style.icon}
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
                            );
                        })}

                        {notifications.length === 0 && (
                            <div className="px-5 py-10 text-center">
                                <p className="text-[13px] font-semibold text-gray-600">No notifications yet</p>
                                <p className="mt-1 text-[12px] text-gray-400">You will see updates here in real time.</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-center">
                        <button className="text-[13px] font-bold text-gray-500 hover:text-gray-800 transition-colors">
                            View All Notifications
                        </button>
                    </div>
                </Dropdown.Content>
            </Dropdown>

            {selectedNotification && createPortal(
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4"
                    onClick={() => setSelectedNotification(null)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-[16px] font-bold text-gray-900">Notification Details</h4>
                            <button
                                type="button"
                                className="rounded-md px-2 py-1 text-[12px] font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                onClick={() => setSelectedNotification(null)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="mb-4 flex items-start gap-3">
                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${detailStyle.bgColor}`}>
                                {detailStyle.icon}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[15px] font-bold text-gray-900">{selectedNotification.title}</h4>
                                <p className="mt-1 text-[11px] font-medium text-gray-400">{selectedNotification.time}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Message</p>
                            <p className="mt-2 text-[13px] leading-relaxed text-gray-700">
                                {selectedNotification.message}
                            </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                            <div className="rounded-lg border border-gray-100 bg-white p-3">
                                <p className="font-semibold text-gray-400">Type</p>
                                <p className="mt-1 capitalize text-gray-700">{selectedNotification.type}</p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-white p-3">
                                <p className="font-semibold text-gray-400">Status</p>
                                <p className="mt-1 text-gray-700">
                                    {selectedNotification.isRead ? 'Read' : 'Unread'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    );
}
