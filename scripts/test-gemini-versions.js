// Test different Gemini API versions and configurations
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match[1].trim();

const testText = "I need to buy milk tomorrow";

async function testConfig(name, url, body) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`URL: ${url}`);
    console.log(`Body:`, JSON.stringify(body, null, 2));

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const result = await res.json();

        if (!res.ok) {
            console.log(`❌ FAILED (${res.status})`);
            console.log('Error:', JSON.stringify(result, null, 2));
            return false;
        }

        console.log(`✅ SUCCESS`);
        console.log('Response:', JSON.stringify(result, null, 2));
        return true;
    } catch (err) {
        console.log(`❌ ERROR:`, err.message);
        return false;
    }
}

async function runTests() {
    console.log(`\n🧪 TESTING GEMINI API CONFIGURATIONS\n`);
    console.log(`Input text: "${testText}"\n`);

    // Test 1: v1 with system_instruction and response_mime_type
    await testConfig(
        'v1 + gemini-2.5-flash + system_instruction + response_mime_type',
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            system_instruction: {
                parts: [{ text: "You are a helpful assistant. Return JSON." }]
            },
            contents: [{ parts: [{ text: testText }] }],
            generationConfig: { response_mime_type: "application/json" }
        }
    );

    // Test 2: v1beta with system_instruction and response_mime_type
    await testConfig(
        'v1beta + gemini-2.5-flash + system_instruction + response_mime_type',
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            system_instruction: {
                parts: [{ text: "You are a helpful assistant. Return JSON." }]
            },
            contents: [{ parts: [{ text: testText }] }],
            generationConfig: { response_mime_type: "application/json" }
        }
    );

    // Test 3: v1 without system_instruction or response_mime_type
    await testConfig(
        'v1 + gemini-2.5-flash (basic)',
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            contents: [{ parts: [{ text: testText }] }]
        }
    );

    // Test 4: v1beta with gemini-2.0-flash
    await testConfig(
        'v1beta + gemini-2.0-flash + system_instruction + response_mime_type',
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            system_instruction: {
                parts: [{ text: "You are a helpful assistant. Return JSON." }]
            },
            contents: [{ parts: [{ text: testText }] }],
            generationConfig: { response_mime_type: "application/json" }
        }
    );

    console.log(`\n${'='.repeat(60)}`);
    console.log('TESTS COMPLETED');
    console.log(`${'='.repeat(60)}\n`);
}

runTests();
