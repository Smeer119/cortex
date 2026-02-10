"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Check, Trash2, Calendar } from "lucide-react";
import { Note } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NotificationHistoryItem {
    id: string;
    note: Note;
    timestamp: number;
    read: boolean;
}

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    history: NotificationHistoryItem[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClearHistory: () => void;
    onClickNote: (note: Note, itemId: string) => void;
}

export function NotificationCenter({
    isOpen,
    onClose,
    history,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearHistory,
    onClickNote
}: NotificationCenterProps) {
    if (!isOpen) return null;

    const hasUnread = history.some(item => !item.read);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            >
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-primary text-white p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Notifications</h2>
                                <p className="text-white/70 text-sm">
                                    {history.length} {history.length === 1 ? 'notification' : 'notifications'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Actions */}
                    {history.length > 0 && (
                        <div className="p-4 border-b border-gray-200 flex gap-2">
                            {hasUnread && (
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (confirm('Clear all notification history?')) {
                                        onClearHistory();
                                    }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <Bell className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No notifications yet
                                </h3>
                                <p className="text-sm text-gray-500">
                                    You'll see reminders and updates here
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {history.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            "p-4 hover:bg-gray-50 transition-colors cursor-pointer relative",
                                            !item.read && "bg-primary/5"
                                        )}
                                        onClick={() => {
                                            onClickNote(item.note, item.id);
                                            onMarkAsRead(item.id);
                                        }}
                                    >
                                        {!item.read && (
                                            <div className="absolute top-4 left-2 w-2 h-2 rounded-full bg-primary" />
                                        )}
                                        
                                        <div className="flex items-start gap-3 ml-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                                item.note.type === 'todo' ? "bg-blue-100" : "bg-purple-100"
                                            )}>
                                                {item.note.type === 'todo' ? (
                                                    <Check className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Bell className="w-5 h-5 text-purple-600" />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 mb-1 truncate">
                                                    {item.note.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                    {item.note.summary || item.note.body}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(item.timestamp).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    {item.note.reminder?.time && (
                                                        <span>
                                                            Reminder: {new Date(item.note.reminder.time).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
