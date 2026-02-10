export type NoteType = 'note' | 'todo';

export interface NoteItem {
    text: string;
    done: boolean;
}

export interface Reminder {
    enabled: boolean;
    time: number; // Unix timestamp
    notified?: boolean; // Track if notification was sent
}

export interface Note {
    id: string;
    timestamp: number;
    type: NoteType;
    title: string;
    summary?: string; // Short TL;DR
    body: string;
    items?: NoteItem[];
    tags: string[];
    isImportant: boolean;
    reminder?: Reminder; // Optional reminder
    images?: string[]; // Base64 encoded images or URLs
}

export interface SearchResult {
    note: Note;
    score?: number;
}
