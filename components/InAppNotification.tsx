"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Note } from "@/lib/types";

interface InAppNotificationProps {
    note: Note;
    onDismiss: () => void;
    onClick: () => void;
}

export function InAppNotification({ note, onDismiss, onClick }: InAppNotificationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: '100%' }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed top-4 right-4 z-[60] w-full max-w-sm"
        >
            <div 
                onClick={onClick}
                className="bg-white rounded-2xl shadow-2xl border border-primary/10 p-4 cursor-pointer hover:shadow-xl transition-shadow"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-primary text-sm mb-1 truncate">
                            {note.title}
                        </h4>
                        <p className="text-secondary text-xs line-clamp-2">
                            {note.summary || note.body}
                        </p>
                        {note.reminder?.time && (
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(note.reminder.time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

interface NotificationContainerProps {
    notifications: Array<{
        id: string;
        note: Note;
        timestamp: number;
    }>;
    onDismiss: (id: string) => void;
    onClickNote: (note: Note) => void;
}

export function NotificationContainer({ notifications, onDismiss, onClickNote }: NotificationContainerProps) {
    return (
        <div className="fixed top-0 right-0 w-full max-w-sm p-4 pointer-events-none z-[60]">
            <div className="space-y-3 pointer-events-auto">
                <AnimatePresence>
                    {notifications.map((notif) => (
                        <InAppNotification
                            key={notif.id}
                            note={notif.note}
                            onDismiss={() => onDismiss(notif.id)}
                            onClick={() => onClickNote(notif.note)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
