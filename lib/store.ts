"use client";

import { useState, useEffect } from 'react';
import { Note } from './types';

const STORAGE_KEY = 'sam-ai-notes';

export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setNotes(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse notes", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const saveNotes = (newNotes: Note[]) => {
        setNotes(newNotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    };

    const addNote = (note: Note) => {
        const updated = [note, ...notes];
        saveNotes(updated);
    };

    const updateNote = (id: string, updates: Partial<Note>) => {
        const updated = notes.map(n => n.id === id ? { ...n, ...updates } : n);
        saveNotes(updated);
    };

    const deleteNote = (id: string) => {
        const updated = notes.filter(n => n.id !== id);
        saveNotes(updated);
    };

    const toggleTodo = (noteId: string, itemIndex: number) => {
        const note = notes.find(n => n.id === noteId);
        if (note && note.items) {
            const newItems = [...note.items];
            newItems[itemIndex].done = !newItems[itemIndex].done;
            updateNote(noteId, { items: newItems });
        }
    };

    const batchAddNotes = (newNotes: Note[]) => {
        console.log('📥 Batch adding notes:', newNotes.length);
        console.log('📋 Current notes:', notes.length);
        const updated = [...newNotes, ...notes];
        console.log('✅ Total after import:', updated.length);
        console.log('🔍 Note titles:', updated.map(n => n.title));
        saveNotes(updated);
    };

    const toggleImportant = (noteId: string) => {
        const updated = notes.map(n =>
            n.id === noteId ? { ...n, isImportant: !n.isImportant } : n
        );
        saveNotes(updated);
    };

    return {
        notes,
        isLoaded,
        addNote,
        batchAddNotes,
        updateNote,
        deleteNote,
        toggleTodo,
        toggleImportant
    };
}
