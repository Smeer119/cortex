"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Hash, Star } from "lucide-react";
import { Note } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onToggleTodo?: (id: string, index: number) => void;
  onToggleImportant?: (id: string) => void;
  onClick?: () => void;
}

export function NoteCard({ note, onToggleTodo, onToggleImportant, onClick }: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="bg-surface rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-border cursor-pointer transition-all hover:shadow-lg mb-4 break-inside-avoid relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-primary leading-tight line-clamp-2 flex-1 pr-2">{note.title}</h3>
        
        {/* Star Icon - Toggle Important */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleImportant?.(note.id);
          }}
          className="shrink-0 p-1 hover:scale-110 transition-transform"
          title={note.isImportant ? "Remove from important" : "Mark as important"}
        >
          <Star 
            className={cn(
              "w-5 h-5 transition-colors",
              note.isImportant 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300 hover:text-yellow-400"
            )} 
          />
        </button>
      </div>

      <div className="max-h-[200px] overflow-hidden relative">
          <p className="text-secondary text-sm mb-4 leading-relaxed">
            {note.summary ? (
               <span className="font-medium text-primary/80">{note.summary}</span>
            ) : (
               <span className="line-clamp-4">{note.body}</span>
            )}
          </p>

          {note.type === 'todo' && note.items && (
            <div className="space-y-2 mb-4">
              {note.items.slice(0, 3).map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2 text-sm text-primary"
                  onClick={(e) => {
                     e.stopPropagation();
                     onToggleTodo?.(note.id, idx);
                  }}
                >
                  <button className="mt-0.5 text-muted-foreground hover:text-accent transition-colors shrink-0">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                  </button>
                  <span className={cn("flex-1 truncate", item.done && "line-through text-gray-300")}>
                    {item.text}
                  </span>
                </div>
              ))}
              {note.items.length > 3 && (
                <p className="text-xs text-gray-400 pl-6 font-medium">+ {note.items.length - 3} more items</p>
              )}
            </div>
          )}
          
          {/* Fade mask for overflow content */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t border-border/40">
        {note.tags && note.tags.length > 0 ? (
          note.tags.map(tag => (
            <span key={tag} className="inline-flex items-center text-[10px] font-medium text-gray-400 bg-muted/30 px-2 py-1 rounded-full">
              <Hash className="w-2.5 h-2.5 mr-0.5 opacity-50" />
              {tag.replace('#', '')}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-gray-300 italic">No tags</span>
        )}
      </div>
    </motion.div>
  );
}
