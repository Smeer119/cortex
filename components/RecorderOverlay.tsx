"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, StopCircle, X } from 'lucide-react';

interface RecorderOverlayProps {
  onGenericClose: () => void;
  onTranscriptionComplete: (text: string) => void;
}

export function RecorderOverlay({ onGenericClose, onTranscriptionComplete }: RecorderOverlayProps) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(true);
  const recognitionRef = useRef<any>(null);
  const hasSubmittedRef = useRef(false);
  const lastProcessedIndexRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          // Only process new results from the last processed index onward
          for (let i = lastProcessedIndexRef.current; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              fullTranscript += event.results[i][0].transcript + ' ';
              lastProcessedIndexRef.current = i + 1;
            } else {
              // Include interim results for real-time display
              fullTranscript += event.results[i][0].transcript;
            }
          }
          
          // Accumulate with previous transcript
          setTranscript(prev => {
            // If we have new final results, append them
            if (fullTranscript.trim()) {
              return (prev + ' ' + fullTranscript).trim();
            }
            return prev;
          });
        };

        recognition.onend = () => {
          // If stopped properly by user, isListening will be false
          // If network error or silence timeout, it might stop while we still want to listen
          // But we don't auto-submit here. We wait for user action.
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); 

  const handleStop = () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    // Small delay to allow final transcript to settle
    setTimeout(() => {
        if (transcript.trim().length > 0) {
            onTranscriptionComplete(transcript);
        } else {
            onGenericClose();
        }
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
    >
        <button 
            onClick={onGenericClose} 
            className="absolute top-6 right-6 p-2 rounded-full bg-muted/50 text-secondary hover:bg-muted transition-colors"
        >
            <X className="w-6 h-6" />
        </button>

        <div className="flex-1 w-full max-w-md flex flex-col justify-center items-center text-center space-y-8">
             <div className="relative">
                 <div className="w-24 h-24 rounded-full bg-accent/20 animate-pulse absolute inset-0 blur-xl" />
                 <div className="w-24 h-24 rounded-full bg-accent/10 absolute inset-0 animate-ping" />
                 <Mic className="w-24 h-24 text-accent relative z-10 p-6" />
             </div>
             
             <div className="space-y-4 w-full">
                 <p className="text-secondary text-lg font-medium">Listening...</p>
                 <div className="min-h-[120px] max-h-[40vh] overflow-y-auto">
                    <p className="text-3xl md:text-4xl font-semibold text-primary leading-tight">
                        {transcript || "Say something..."}
                    </p>
                 </div>
             </div>
        </div>

        <div className="pb-10">
            <button 
                onClick={handleStop}
                className="group relative flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-red-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-300" />
                <StopCircle className="w-20 h-20 text-red-500 relative z-10 drop-shadow-sm transition-transform group-hover:scale-105" />
            </button>
            <p className="text-center text-xs text-muted-foreground mt-4 font-medium tracking-wide uppercase">Tap to process</p>
        </div>
    </motion.div>
  );
}
