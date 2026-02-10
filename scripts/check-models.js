const fs = require('fs');
const path = require('path');

try {
    const envPath = path.join(__dirname, '../.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("No .env.local found");
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);

    if (!match) {
        console.error("No GEMINI_API_KEY found in .env.local");
        process.exit(1);
    }
    const apiKey = match[1].trim();

    console.log("Checking available models...");
    fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                console.error("API Error:", data.error.message);
                fs.writeFileSync('models.txt', "Error: " + data.error.message);
            } else if (data.models) {
                const names = data.models.map(m => m.name).join('\n');
                console.log(names);
                fs.writeFileSync('models.txt', names);
            } else {
                console.log("No models found or unexpected response:", data);
                fs.writeFileSync('models.txt', "No models found: " + JSON.stringify(data));
            }
        })
        .catch(e => {
            console.error("Fetch failed:", e);
            fs.writeFileSync('models.txt', "Fetch failed: " + e.message);
        });

} catch (e) {
    console.error("Script error:", e);
}
