// Test AI with reminder extraction
async function testReminderExtraction() {
    console.log('\n🧪 TESTING REMINDER EXTRACTION\n');

    const testCases = [
        {
            label: "Tomorrow reminder",
            text: "Remind me to buy milk tomorrow"
        },
        {
            label: "Specific time",
            text: "Call the dentist tomorrow at 3pm"
        },
        {
            label: "Next week",
            text: "I need to submit the report next week"
        },
        {
            label: "No reminder",
            text: "Just a random thought about JavaScript"
        }
    ];

    for (const test of testCases) {
        console.log(`\n--- ${test.label} ---`);
        console.log(`Input: "${test.text}"`);

        try {
            const res = await fetch('http://localhost:3000/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: test.text })
            });

            const data = await res.json();

            if (data.aiError) {
                console.log('❌ Error:', data.aiError.substring(0, 100));
                continue;
            }

            console.log('✅ Type:', data.type);
            console.log('📝 Title:', data.title);
            console.log('🔔 Reminder:', data.reminder ?
                `${data.reminder.enabled ? 'Enabled' : 'Disabled'} - ${new Date(data.reminder.time).toLocaleString()}` :
                'None'
            );

        } catch (err) {
            console.log('❌ Failed:', err.message);
        }
    }
}

testReminderExtraction();
