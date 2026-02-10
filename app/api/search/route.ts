import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { query, notes } = await req.json();

        // Limit context and text length to avoid overflow
        const notesContext = notes.slice(0, 50).map((n: any) => `ID: ${n.id} | Title: ${n.title} | Body: ${n.body.substring(0, 200)}`).join("\n");

        if (!process.env.GEMINI_API_KEY) {
            // Mock search logic
            const lowerQuery = query.toLowerCase();
            const matches = notes.filter((n: any) =>
                n.title.toLowerCase().includes(lowerQuery) ||
                n.body.toLowerCase().includes(lowerQuery) ||
                (n.tags && n.tags.some((t: string) => t.toLowerCase().includes(lowerQuery)))
            );
            return NextResponse.json({ matches: matches.map((n: any) => n.id) });
        }

        const prompt = `
        You are an intelligent search assistant. Match the user query to the provided notes based on meaning and intent.
        User Query: "${query}"
        
        Notes:
        ${notesContext}
        
        Return JSON with "matches": array of note IDs.
        {
          "matches": ["id1", "id2"]
        }
        `;

        // Retry Logic Helper
        const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 1000) => {
            for (let i = 0; i < retries; i++) {
                try {
                    const res = await fetch(url, options);

                    if (res.ok) return res;

                    if (res.status === 429 || res.status >= 500) {
                        const retryAfter = res.headers.get("Retry-After");
                        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : backoff * Math.pow(2, i);

                        console.warn(`Search API ${res.status}. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }

                    const errorBody = await res.text();
                    throw new Error(`Gemini API Error: ${res.status} ${res.statusText} - ${errorBody}`);
                } catch (err) {
                    if (i === retries - 1) throw err;
                    await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
                }
            }
            throw new Error("Max retries exceeded");
        };

        const response = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        response_mime_type: "application/json"
                    }
                }),
            }
        );

        const result = await response.json();
        const jsonStr = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonStr) {
            return NextResponse.json({ matches: [] });
        }

        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Search Error:", error);
        return NextResponse.json({ matches: [] }); // Safe fallback
    }
}
