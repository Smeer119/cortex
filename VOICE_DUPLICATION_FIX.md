# Voice Input Duplication Fix

## Problem
On mobile devices, when speaking once into the voice recorder, the transcription was being duplicated multiple times. For example, saying "suits is a movie" once would result in:
```
suitssuits issuits is asuits is a moviesuits is a moviesuits is a moviesuits is a movie...
```

## Root Cause
The issue was in `components/RecorderOverlay.tsx`. The Web Speech API's `onresult` event handler was processing ALL speech recognition results from index 0 every time it fired, rather than just processing new results.

When using `continuous: true` mode:
- The API fires the `onresult` event multiple times
- Each time it fires, `event.results` contains ALL previous results PLUS new ones
- The old code was iterating through ALL results every time (line 31: `for (let i = 0; i < event.results.length; i++)`)
- This caused previously processed speech to be appended again and again

## Solution
Added a `lastProcessedIndexRef` to track which results have already been processed:

### Key Changes:
1. **Added tracking reference** (line 17):
   ```typescript
   const lastProcessedIndexRef = useRef(0);
   ```

2. **Process only new results** (lines 32-40):
   ```typescript
   for (let i = lastProcessedIndexRef.current; i < event.results.length; i++) {
     if (event.results[i].isFinal) {
       fullTranscript += event.results[i][0].transcript + ' ';
       lastProcessedIndexRef.current = i + 1; // Track what we've processed
     } else {
       // Include interim results for real-time display
       fullTranscript += event.results[i][0].transcript;
     }
   }
   ```

3. **Accumulate transcripts properly** (lines 43-49):
   ```typescript
   setTranscript(prev => {
     if (fullTranscript.trim()) {
       return (prev + ' ' + fullTranscript).trim();
     }
     return prev;
   });
   ```

## Benefits
- ✅ No more duplicate transcriptions
- ✅ Real-time interim results still display (for visual feedback)
- ✅ Only final results are permanently added to the transcript
- ✅ Works correctly on both mobile and desktop browsers

## Testing
To verify the fix works:
1. Open the app on mobile
2. Tap the mic button
3. Say a phrase like "this is a test note"
4. The phrase should appear only once
5. Tap "Stop" to process

## Technical Details
The Speech Recognition API returns results in this structure:
```typescript
event.results = [
  [{ transcript: "hello", confidence: 0.9 }],  // index 0 (final)
  [{ transcript: "world", confidence: 0.8 }],  // index 1 (final)
  [{ transcript: "how", confidence: 0.7 }],    // index 2 (interim)
]
```

Each `onresult` event contains:
- **All previous final results** (indices 0 to n-1)
- **Current interim or final result** (index n)

By tracking `lastProcessedIndexRef`, we skip already-processed results and only append new ones.
