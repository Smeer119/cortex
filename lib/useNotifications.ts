"use client";

import { useEffect, useState, useCallback } from "react";
import { Note } from "./types";

interface NotificationHistoryItem {
    id: string;
    note: Note;
    timestamp: number;
    read: boolean;
}

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [history, setHistory] = useState<NotificationHistoryItem[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);

            // Load notification history from localStorage
            const savedHistory = localStorage.getItem('notification-history');
            if (savedHistory) {
                try {
                    setHistory(JSON.parse(savedHistory));
                } catch (e) {
                    console.error('Failed to load notification history', e);
                }
            }
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem('notification-history', JSON.stringify(history));
        }
    }, [history]);

    const requestPermission = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        }
        return false;
    };

    const playNotificationSound = () => {
        try {
            // Create a simple notification sound using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.error('Failed to play sound', e);
        }
    };

    const addToHistory = useCallback((note: Note) => {
        const historyItem: NotificationHistoryItem = {
            id: crypto.randomUUID(),
            note,
            timestamp: Date.now(),
            read: false
        };

        setHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50
    }, []);

    const markAsRead = useCallback((id: string) => {
        setHistory(prev => prev.map(item =>
            item.id === id ? { ...item, read: true } : item
        ));
    }, []);

    const markAllAsRead = useCallback(() => {
        setHistory(prev => prev.map(item => ({ ...item, read: true })));
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem('notification-history');
    }, []);

    const scheduleNotification = (note: Note) => {
        if (!note.reminder?.enabled || permission !== 'granted') return;

        const now = Date.now();
        const delay = note.reminder.time - now;

        if (delay <= 0) {
            showNotification(note);
            return;
        }

        setTimeout(() => {
            showNotification(note);
        }, delay);
    };

    const showNotification = (note: Note) => {
        if (permission !== 'granted') return;

        playNotificationSound();
        addToHistory(note);

        const notification = new Notification(note.title, {
            body: note.summary || note.body.substring(0, 100),
            icon: '/icon.png',
            badge: '/badge.png',
            tag: note.id,
            requireInteraction: true,
            data: { noteId: note.id }
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    };

    const unreadCount = history.filter(item => !item.read).length;

    return {
        permission,
        requestPermission,
        scheduleNotification,
        showNotification,
        playNotificationSound,
        history,
        unreadCount,
        addToHistory,
        markAsRead,
        markAllAsRead,
        clearHistory
    };
}

// In-app notification component state
export function useInAppNotifications() {
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        note: Note;
        timestamp: number;
    }>>([]);

    const addNotification = (note: Note) => {
        setNotifications(prev => [...prev, {
            id: crypto.randomUUID(),
            note,
            timestamp: Date.now()
        }]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.note.id !== note.id));
        }, 5000);
    };

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return {
        notifications,
        addNotification,
        dismissNotification
    };
}
