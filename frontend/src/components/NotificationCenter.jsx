import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, Activity, Check, X } from 'lucide-react';
import api from '../utils/api';
import './NotificationCenter.css';

const normalizeList = (value) => (Array.isArray(value) ? value : []);

const parseDateValue = (value) => {
    if (!value) return null;
    if (Array.isArray(value)) {
        const [y, m, d, h = 0, min = 0, s = 0] = value;
        return new Date(y, m - 1, d, h, min, s);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatNotificationDate = (value) => {
    const parsed = parseDateValue(value);
    return parsed
        ? parsed.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Schedule unavailable';
};

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            // Fetch both in parallel, handle errors individually
            const [aptRes, reminderRes] = await Promise.allSettled([
                api.get('/appointments/upcoming'),
                api.get('/reminders/my-reminders')
            ]);

            const appointments = aptRes.status === 'fulfilled'
                ? normalizeList(aptRes.value.data).map(apt => ({
                    id: `apt-${apt.id}`,
                    type: 'appointment',
                    title: 'Upcoming Appointment',
                    description: `With Dr. ${apt.doctorName} for ${apt.petName}`,
                    date: apt.dateTime,
                    originalId: apt.id
                }))
                : [];

            const reminders = reminderRes.status === 'fulfilled'
                ? normalizeList(reminderRes.value.data).map(rem => ({
                    id: `rem-${rem.id}`,
                    type: 'reminder',
                    title: rem.title,
                    description: rem.description,
                    date: rem.reminderDate,
                    originalId: rem.id
                }))
                : [];

            const combined = [...appointments, ...reminders].sort((a, b) =>
                (parseDateValue(a.date)?.getTime() || 0) - (parseDateValue(b.date)?.getTime() || 0)
            );

            setNotifications(combined);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every 1 min
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsCompleted = async (id, type) => {
        if (type === 'reminder') {
            try {
                await api.put(`/reminders/${id}/complete`);
                setNotifications(notifications.filter(n => n.id !== `rem-${id}`));
            } catch (err) {
                console.error("Error completing reminder:", err);
            }
        }
    };

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button
                className={`notification-trigger ${notifications.length > 0 ? 'has-notifications' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span className="notification-badge">{notifications.length}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {notifications.length > 0 && (
                            <span className="count">{notifications.length} pending</span>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading && notifications.length === 0 ? (
                            <div className="notification-empty">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">No new notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`notification-item ${n.type}`}>
                                    <div className="notification-icon">
                                        {n.type === 'appointment' ? <Calendar size={16} /> : <Activity size={16} />}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{n.title}</div>
                                        <div className="notification-desc">{n.description}</div>
                                        <div className="notification-date">
                                            {formatNotificationDate(n.date)}
                                        </div>
                                    </div>
                                    {n.type === 'reminder' && (
                                        <button
                                            className="notification-action"
                                            onClick={() => markAsCompleted(n.originalId, n.type)}
                                            title="Mark as done"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
