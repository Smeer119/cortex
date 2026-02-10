"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Sparkles, Bell } from "lucide-react";
import { useNotes } from "@/lib/store";
import { NoteCard } from "@/components/NoteCard";
import { SearchBar } from "@/components/SearchBar";
import { RecorderOverlay } from "@/components/RecorderOverlay";
import { NoteDetailModal } from "@/components/NoteDetailModal";
import { NotificationContainer } from "@/components/InAppNotification";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useNotifications, useInAppNotifications } from "@/lib/useNotifications";
import { cn } from "@/lib/utils";
import { Note } from "@/lib/types";

type FilterType = 'all' | 'important' | 'todo';

// Helper function to format date
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) return "Today";
  if (dateOnly.getTime() === yesterdayOnly.getTime()) return "Yesterday";

  // Format as "Feb 10, 2026"
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

// Helper to group notes by date
function groupNotesByDate(notes: Note[]): Record<string, Note[]> {
  const grouped: Record<string, Note[]> = {};
  
  notes.forEach(note => {
    const dateKey = formatDate(note.timestamp);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(note);
  });

  return grouped;
}

export default function Home() {
  const { notes, addNote, updateNote, deleteNote, toggleTodo, isLoaded } = useNotes();
  const { 
    permission, 
    requestPermission, 
    scheduleNotification, 
    playNotificationSound,
    history,
    unreadCount,
    addToHistory,
    markAsRead,
    markAllAsRead,
    clearHistory
  } = useNotifications();
  const { notifications, addNotification, dismissNotification } = useInAppNotifications();
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Monitor notes for upcoming reminders
  useEffect(() => {
    if (!isLoaded) return;

    const checkReminders = () => {
      const now = Date.now();
      notes.forEach(note => {
        if (note.reminder?.enabled && !note.reminder.notified) {
          const timeUntilReminder = note.reminder.time - now;
          
          // Show notification if within 1 minute or past due
          if (timeUntilReminder <= 60000 && timeUntilReminder > -60000) {
            playNotificationSound(); // Play sound
            addNotification(note);
            addToHistory(note); // Add to history
            scheduleNotification(note);
            
            // Mark as notified
            updateNote(note.id, {
              reminder: {
                ...note.reminder,
                notified: true
              }
            });
          }
        }
      });
    };

    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000);
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [notes, isLoaded, addNotification, scheduleNotification, playNotificationSound, addToHistory, updateNote]);

  // Filter logic
  const visibleNotes = notes.filter(note => {
    // 1. Check Search
    if (searchQuery && searchResults) {
      if (!searchResults.includes(note.id)) return false;
    }
    // 2. Check Filter
    if (filter === 'important') return note.isImportant;
    if (filter === 'todo') return note.type === 'todo';
    return true;
  });

  // Group notes by date
  const groupedNotes = groupNotesByDate(visibleNotes);
  const dateKeys = Object.keys(groupedNotes).sort((a, b) => {
    // Sort by most recent first
    const dateA = groupedNotes[a][0].timestamp;
    const dateB = groupedNotes[b][0].timestamp;
    return dateB - dateA;
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, notes })
      });
      const data = await res.json();
      setSearchResults(data.matches || []);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTranscriptionComplete = async (text: string) => {
    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await res.json();
      if (data.id) {
        addNote(data);
      }
    } catch (e) {
      console.error("Processing failed", e);
      addNote({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: 'note',
        title: 'Draft Note',
        body: text,
        tags: ['#draft'],
        isImportant: false
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading Sam...</div></div>;

  return (
    <main className="min-h-screen pb-24 px-4 pt-12 md:pt-16 max-w-5xl mx-auto relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">my notes</h1>
          <p className="text-secondary text-sm md:text-base mt-1">
             {notes.length} thoughts captured
          </p>
        </div>
        
        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationCenterOpen(true)}
          className="relative p-3 rounded-full hover:bg-gray-100 transition-colors group"
        >
          <Bell className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>
      </header>

      {/* Search */}
      <SearchBar onSearch={handleSearch} isSearching={isSearching} />

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {(['all', 'important', 'todo'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              if (f === 'all' && searchQuery) {
                 setSearchQuery('');
                 setSearchResults(null);
              }
            }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize whitespace-nowrap",
              filter === f 
                ? "bg-primary text-white shadow-md" 
                : "bg-white text-secondary hover:bg-muted border border-transparent"
            )}
          >
            {f} {f !== 'all' && <span className="ml-1 opacity-70 text-xs">({notes.filter(n => f === 'important' ? n.isImportant : n.type === f).length})</span>}
          </button>
        ))}
      </div>

      {/* Date Grouped Notes */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {dateKeys.map(dateKey => (
            <motion.div 
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  {dateKey}
                </h2>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">
                  {groupedNotes[dateKey].length} {groupedNotes[dateKey].length === 1 ? 'note' : 'notes'}
                </span>
              </div>

              {/* Notes Grid for this date */}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {groupedNotes[dateKey].map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onToggleTodo={toggleTodo} 
                    onClick={() => setSelectedNote(note)}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {visibleNotes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="col-span-full py-20 text-center text-muted-foreground break-inside-avoid"
          >
            <p className="mb-2">No minds found.</p>
            <p className="text-sm">Tap the mic to start thinking.</p>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsRecording(true)}
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-16 h-16 rounded-full bg-primary text-white shadow-xl flex items-center justify-center z-40 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-accent/20 group-hover:bg-accent/30 transition-colors" />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Mic className="w-7 h-7 relative z-10" />
      </motion.button>

      {/* Processing State Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center max-w-xs w-full text-center">
              <div className="w-16 h-16 mb-6 relative">
                 <div className="absolute inset-0 bg-accent/30 rounded-full animate-ping" />
                 <Sparkles className="w-16 h-16 text-accent animate-pulse relative z-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Structuring thought...</h3>
              <p className="text-sm text-secondary">Organizing your mind into actionable intelligence.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recorder Overlay */}
      <AnimatePresence>
        {isRecording && (
          <RecorderOverlay 
            onGenericClose={() => setIsRecording(false)} 
            onTranscriptionComplete={handleTranscriptionComplete} 
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <NoteDetailModal 
        note={selectedNote} 
        onClose={() => setSelectedNote(null)}
        onUpdate={(id, updates) => {
           updateNote(id, updates);
           // Keep selected note in sync
           setSelectedNote(prev => prev ? { ...prev, ...updates } : null);
        }}
        onDelete={(id) => {
            deleteNote(id);
            setSelectedNote(null);
        }}
      />

      {/* In-App Notifications */}
      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
        onClickNote={(note) => setSelectedNote(note)}
      />

      {/* Notification Center Panel */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        history={history}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClearHistory={clearHistory}
        onClickNote={(note, itemId) => {
          setSelectedNote(note);
          markAsRead(itemId);
          setIsNotificationCenterOpen(false);
        }}
      />

    </main>
  );
}
