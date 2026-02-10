// Simple API test
async function testAPI() {
    const testInput = "I need to buy milk tomorrow";

    console.log('\n🧪 Testing /api/process endpoint');
    console.log(`📝 Input: "${testInput}"\n`);

    try {
        const res = await fetch('http://localhost:3000/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: testInput })
        });

        const data = await res.json();

        console.log('📊 Response Status:', res.status);
        console.log('📦 Response Body:');
        console.log(JSON.stringify(data, null, 2));

        if (data.aiError) {
            console.log('\n❌ AI Error detected:', data.aiError);
        } else if (data.type) {
            console.log('\n✅ SUCCESS! AI processed the request');
            console.log(`   Type: ${data.type}`);
            console.log(`   Title: ${data.title}`);
            console.log(`   Summary: ${data.summary}`);
        }

    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
}

testAPI();
