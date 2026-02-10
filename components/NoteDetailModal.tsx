"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Circle, Trash2, Calendar, Plus, Edit2, Image as ImageIcon, Save, Bell, BellOff } from "lucide-react";
import { Note, NoteItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

interface NoteDetailModalProps {
  note: Note | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

export function NoteDetailModal({ note, onClose, onUpdate, onDelete }: NoteDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note?.title || "");
  const [editedBody, setEditedBody] = useState(note?.body || "");
  const [editedItems, setEditedItems] = useState<NoteItem[]>(note?.items || []);
  const [newItemText, setNewItemText] = useState("");
  const [reminderTime, setReminderTime] = useState(
    note?.reminder?.time ? new Date(note.reminder.time).toISOString().slice(0, 16) : ""
  );
  const [reminderEnabled, setReminderEnabled] = useState(note?.reminder?.enabled || false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!note) return null;

  const handleSave = () => {
    const updates: Partial<Note> = {
      title: editedTitle,
      body: editedBody,
      items: note.type === 'todo' ? editedItems : undefined,
    };

    if (reminderEnabled && reminderTime) {
      updates.reminder = {
        enabled: true,
        time: new Date(reminderTime).getTime(),
      };
    } else {
      updates.reminder = undefined;
    }

    onUpdate(note.id, updates);
    setIsEditing(false);
  };

  const toggleItem = (index: number) => {
    if (!note.items) return;
    const newItems = [...note.items];
    newItems[index].done = !newItems[index].done;
    onUpdate(note.id, { items: newItems });
  };

  const addNewItem = () => {
    if (!newItemText.trim()) return;
    const newItems = [...editedItems, { text: newItemText, done: false }];
    setEditedItems(newItems);
    setNewItemText("");
  };

  const deleteItem = (index: number) => {
    const newItems = editedItems.filter((_, i) => i !== index);
    setEditedItems(newItems);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        newImages.push(base64);
        if (newImages.length === files.length) {
          onUpdate(note.id, { 
            images: [...(note.images || []), ...newImages] 
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteImage = (index: number) => {
    const newImages = (note.images || []).filter((_, i) => i !== index);
    onUpdate(note.id, { images: newImages });
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#F6F7F4] w-full max-w-3xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative"
        >
            {/* Header / Actions */}
            <div className="flex justify-between items-center p-6 border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2 text-xs font-medium text-secondary uppercase tracking-wider">
                    {new Date(note.timestamp).toLocaleDateString()} • {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <button 
                            onClick={handleSave}
                            className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    ) : (
                        <button 
                            onClick={() => {
                                setIsEditing(true);
                                setEditedTitle(note.title);
                                setEditedBody(note.body);
                                setEditedItems(note.items || []);
                            }}
                            className="p-2 rounded-full hover:bg-black/5 text-primary transition-colors"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            if(confirm("Delete this note?")) {
                                onDelete(note.id);
                                onClose();
                            }
                        }}
                        className="p-2 rounded-full hover:bg-red-50 text-secondary hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 text-primary transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* Title */}
                {isEditing ? (
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full text-3xl md:text-4xl font-bold text-primary leading-tight tracking-tight bg-white/50 rounded-2xl p-4 border-2 border-primary/20 focus:border-primary outline-none"
                        placeholder="Note title..."
                    />
                ) : (
                    <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight tracking-tight">
                        {note.title}
                    </h2>
                )}

                {/* Body */}
                {isEditing ? (
                    <textarea
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        rows={6}
                        className="w-full text-lg text-secondary leading-relaxed bg-white/50 rounded-2xl p-4 border-2 border-primary/20 focus:border-primary outline-none resize-none"
                        placeholder="What's on your mind..."
                    />
                ) : (
                    <div className="prose prose-lg text-secondary leading-relaxed">
                        <p>{note.body}</p>
                    </div>
                )}

                {/* Reminder Section */}
                <div className="bg-white/50 rounded-2xl p-5 border border-black/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                            {reminderEnabled || note.reminder?.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4 text-gray-400" />}
                            Reminder
                        </h3>
                        {isEditing && (
                            <button
                                onClick={() => setReminderEnabled(!reminderEnabled)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                    reminderEnabled 
                                        ? "bg-primary text-white" 
                                        : "bg-gray-200 text-gray-600"
                                )}
                            >
                                {reminderEnabled ? 'Enabled' : 'Disabled'}
                            </button>
                        )}
                    </div>

                    {(isEditing && reminderEnabled) ? (
                        <input
                            type="datetime-local"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-white border border-black/10 focus:border-primary outline-none text-primary"
                        />
                    ) : note.reminder?.enabled ? (
                        <p className="text-secondary">
                            {new Date(note.reminder.time).toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    ) : (
                        <p className="text-gray-400 text-sm">No reminder set</p>
                    )}
                </div>

                {/* Checklist (if todo) */}
                {note.type === 'todo' && (
                   <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Checklist</h3>
                      {(isEditing ? editedItems : note.items || []).map((item, idx) => (
                        <div 
                           key={idx} 
                           className="flex items-start gap-4 p-3 rounded-xl bg-white/50 hover:bg-white transition-colors group"
                        >
                           {!isEditing && (
                                <button 
                                    onClick={() => toggleItem(idx)}
                                    className="mt-1 text-muted-foreground group-hover:text-accent transition-colors"
                                >
                                  {item.done ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                  ) : (
                                    <Circle className="w-6 h-6 text-gray-300" />
                                  )}
                                </button>
                           )}
                           <span className={cn(
                               "text-lg flex-1 transition-all", 
                               item.done ? "line-through text-gray-400" : "text-primary"
                            )}>
                              {item.text}
                           </span>
                           {isEditing && (
                               <button
                                   onClick={() => deleteItem(idx)}
                                   className="text-red-400 hover:text-red-600 transition-colors"
                               >
                                   <Trash2 className="w-4 h-4" />
                               </button>
                           )}
                        </div>
                      ))}

                      {isEditing && (
                          <div className="flex gap-2">
                              <input
                                  type="text"
                                  value={newItemText}
                                  onChange={(e) => setNewItemText(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
                                  placeholder="Add new item..."
                                  className="flex-1 px-4 py-2 rounded-xl bg-white border border-black/10 focus:border-primary outline-none"
                              />
                              <button
                                  onClick={addNewItem}
                                  className="p-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                              >
                                  <Plus className="w-5 h-5" />
                              </button>
                          </div>
                      )}
                   </div>
                )}

                {/* Images */}
                {note.images && note.images.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Images</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {note.images.map((img, idx) => (
                                <div key={idx} className="relative group">
                                    <img 
                                        src={img} 
                                        alt={`Attachment ${idx + 1}`}
                                        className="w-full h-48 object-cover rounded-2xl"
                                    />
                                    {isEditing && (
                                        <button
                                            onClick={() => deleteImage(idx)}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Images Button */}
                {isEditing && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <ImageIcon className="w-5 h-5" />
                        Add Images
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                />

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-6 border-t border-black/5">
                        {note.tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 rounded-full bg-white border border-black/5 text-sm font-medium text-secondary">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
