import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    let text = "";
    try {
        const body = await req.json();
        text = body.text || "";
    } catch (e) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Helper to generate mock response for local fallback
    const getMockResponse = (inputText: string, isFallback = false) => {
        const isTodo = /buy|call|todo|remind|need to/i.test(inputText);
        return {
            id: uuidv4(),
            timestamp: Date.now(),
            type: isTodo ? 'todo' : 'note',
            title: isTodo ? "New Task" : "Quick Note",
            summary: inputText.slice(0, 50) + "...",
            body: inputText,
            items: isTodo ? [{ text: inputText, done: false }] : [],
            tags: isFallback ? ["#offline"] : ["#demo"],
            isImportant: false
        };
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("GEMINI_API_KEY not found, using mock response");
        return NextResponse.json(getMockResponse(text));
    }

    // Define the "System Persona" with Strict JSON Schema
    const systemInstruction = `
    Your name is Sam, the user's "Second Brain". Turn chaotic spoken thoughts into structured intelligence.

    STRICT JSON SCHEMA:
    {
      "type": "note" | "todo",
      "title": string,
      "summary": string,
      "body": string,
      "items": [{"text": string, "done": boolean}],
      "tags": string[],
      "isImportant": boolean,
      "reminder": {
        "enabled": boolean,
        "time": number (Unix timestamp in milliseconds),
        "description": string (human-readable like "tomorrow at 3pm")
      } | null
    }

    RULES:
    - If user says "Save to notes", type is ALWAYS "note".
    - "TODO" is only for actionable tasks ("I need to...", "Remind me").
    - Keep titles under 6 words.
    
    REMINDER EXTRACTION:
    - Look for time indicators: "tomorrow", "next week", "in 2 hours", "at 3pm", "on Monday"
    - Calculate Unix timestamp based on current time: ${Date.now()}
    - If time mentioned, set reminder.enabled = true
    - Examples:
      * "tomorrow" → +24 hours
      * "next week" → +7 days
      * "in 2 hours" → +2 hours
      * "at 3pm tomorrow" → tomorrow at 15:00
    - If no time mentioned, set reminder to null
    `;

    // Retry Logic Helper
    const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 1000) => {
        let lastError = null;
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(url, options);
                if (res.ok) return res;

                const errorBody = await res.text();
                lastError = new Error(`Gemini API Error: ${res.status} ${res.statusText} - ${errorBody}`);

                if (res.status === 429 || res.status >= 500) {
                    const waitTime = backoff * Math.pow(2, i);
                    console.warn(`Gemini API ${res.status}. Retrying in ${waitTime}ms...`);
                    await new Promise(r => setTimeout(r, waitTime));
                    continue;
                }
                throw lastError;
            } catch (err) {
                lastError = err;
                if (i === retries - 1) throw err;
                await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)));
            }
        }
        throw lastError || new Error("Max retries exceeded");
    };

    try {
        // Using v1beta because system_instruction and response_mime_type are NOT yet in v1 stable
        // Once v1 supports these features, we can migrate
        const apiVersion = "v1beta";
        const modelName = "gemini-2.5-flash";

        const response = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    contents: [{
                        parts: [{ text: `Raw Transcript: "${text}"` }]
                    }],
                    generationConfig: {
                        response_mime_type: "application/json"
                    }
                }),
            }
        );

        const result = await response.json();
        const jsonStr = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonStr) throw new Error("No text returned from Gemini");

        // With response_mime_type: "application/json", the output is guaranteed to be valid JSON
        const data = JSON.parse(jsonStr);

        return NextResponse.json({
            id: uuidv4(),
            timestamp: Date.now(),
            ...data
        });

    } catch (error) {
        console.error("AI Error (Falling back to local):", error);
        return NextResponse.json({
            ...getMockResponse(text, true),
            aiError: error instanceof Error ? error.message : String(error)
        });
    }
}