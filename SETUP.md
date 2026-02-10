# Sam - Voice AI Note Taker

Sam is a local-first, ambient voice note-taking application powered by Gemini.

## Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your Google Gemini API Key:
    ```bash
    GEMINI_API_KEY=your_api_key_here
    ```
    > If you don't provide a key, Sam will work in **Demo Mode** with mock responses.

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

4.  **Open**:
    Navigate to `http://localhost:3000` on your browser (or mobile device on the same network).

## Features

*   **Voice Capture**: Tap the mic to record thoughts.
*   **AI Processing**: Automatically categorizes as Note or Todo via Gemini.
*   **Semantic Search**: Ask questions "Ask Sam..." to find notes by intent.
*   **Local-First**: All data is stored in your browser (LocalStorage).
*   **PWA**: Installable on mobile devices (Add to Home Screen).

## Tech Stack

*   Next.js 16
*   Tailwind CSS v4 (Custom Design System)
*   Shadcn/UI Vibe (Custom Components)
*   Google Generative AI SDK
*   Framer Motion
