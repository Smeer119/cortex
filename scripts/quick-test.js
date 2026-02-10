// Simplified test to check which config works
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY=(.*)/)[1].trim();

async function test(name, url, body) {
    console.log(`\n--- ${name} ---`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) {
            console.log('FAILED:', data.error?.message || JSON.stringify(data));
            return false;
        }
        console.log('SUCCESS');
        return true;
    } catch (e) {
        console.log('ERROR:', e.message);
        return false;
    }
}

(async () => {
    const text = "Buy milk tomorrow";

    // Test v1beta
    const v1betaWorked = await test(
        'v1beta + gemini-2.5-flash + system_instruction + response_mime_type',
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            system_instruction: { parts: [{ text: "Return JSON" }] },
            contents: [{ parts: [{ text }] }],
            generationConfig: { response_mime_type: "application/json" }
        }
    );

    // Test v1 WITH new features
    const v1WithFeaturesWorked = await test(
        'v1 + gemini-2.5-flash + system_instruction + response_mime_type',
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            system_instruction: { parts: [{ text: "Return JSON" }] },
            contents: [{ parts: [{ text }] }],
            generationConfig: { response_mime_type: "application/json" }
        }
    );

    // Test v1 WITHOUT new features
    const v1BasicWorked = await test(
        'v1 + gemini-2.5-flash (basic, no system_instruction)',
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            contents: [{ parts: [{ text: `You are Sam. Return JSON: {"type":"todo","title":"Task","body":"${text}"}` }] }]
        }
    );

    console.log('\n=== SUMMARY ===');
    console.log('v1beta with features:', v1betaWorked ? '✅' : '❌');
    console.log('v1 with features:', v1WithFeaturesWorked ? '✅' : '❌');
    console.log('v1 basic:', v1BasicWorked ? '✅' : '❌');

    console.log('\n=== RECOMMENDATION ===');
    if (v1betaWorked) {
        console.log('Use v1beta with system_instruction and response_mime_type');
    } else if (v1BasicWorked) {
        console.log('Use v1 basic (put instructions in user message)');
    }
})();
