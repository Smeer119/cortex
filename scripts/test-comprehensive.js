// Comprehensive API test with multiple scenarios
async function testAPI(text, label) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`TEST: ${label}`);
    console.log(`INPUT: "${text}"`);
    console.log('='.repeat(70));

    try {
        const res = await fetch('http://localhost:3000/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await res.json();

        if (data.aiError) {
            console.log('❌ FAILED - AI Error:', data.aiError.substring(0, 100));
            return false;
        }

        console.log('✅ SUCCESS');
        console.log(`   ID: ${data.id}`);
        console.log(`   Type: ${data.type}`);
        console.log(`   Title: ${data.title}`);
        console.log(`   Summary: ${data.summary}`);
        console.log(`   Body: ${data.body}`);
        console.log(`   Items: ${JSON.stringify(data.items)}`);
        console.log(`   Tags: ${JSON.stringify(data.tags)}`);
        console.log(`   Important: ${data.isImportant}`);
        return true;

    } catch (err) {
        console.log('❌ FAILED -', err.message);
        return false;
    }
}

async function runAllTests() {
    console.log('\n🧪 TESTING SAM AI - SECOND BRAIN API\n');

    let passed = 0;
    let total = 0;

    // Test 1: Todo task
    total++;
    if (await testAPI("I need to buy milk tomorrow", "Todo: Shopping Task")) {
        passed++;
    }

    // Test 2: Note
    total++;
    if (await testAPI("Just learned that JavaScript is single-threaded. Save to notes.", "Note: Technical Learning")) {
        passed++;
    }

    // Test 3: Another todo
    total++;
    if (await testAPI("Remind me to call the dentist next week", "Todo: Reminder")) {
        passed++;
    }

    // Test 4: General thought
    total++;
    if (await testAPI("The sunset today was absolutely beautiful with orange and purple hues", "Note: Observation")) {
        passed++;
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`RESULTS: ${passed}/${total} tests passed`);
    console.log('='.repeat(70));

    if (passed === total) {
        console.log('🎉 ALL TESTS PASSED! Sam AI is working perfectly!\n');
    } else {
        console.log(`⚠️  ${total - passed} test(s) failed\n`);
    }
}

runAllTests();
