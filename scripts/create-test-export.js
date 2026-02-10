// Quick test to verify batch import functionality
const testData = {
    "notes": [
        {
            "id": "test-1",
            "timestamp": Date.now(),
            "type": "note",
            "title": "Test Note 1",
            "body": "First test note",
            "tags": ["#test"],
            "isImportant": false
        },
        {
            "id": "test-2",
            "timestamp": Date.now(),
            "type": "todo",
            "title": "Test Todo 2",
            "body": "Second test todo",
            "items": [
                { "text": "Item 1", "done": false },
                { "text": "Item 2", "done": true }
            ],
            "tags": ["#test", "#todo"],
            "isImportant": true
        },
        {
            "id": "test-3",
            "timestamp": Date.now(),
            "type": "note",
            "title": "Test Note 3",
            "body": "Third test note",
            "tags": ["#test"],
            "isImportant": false
        },
        {
            "id": "test-4",
            "timestamp": Date.now(),
            "type": "note",
            "title": "Test Note 4",
            "body": "Fourth test note",
            "tags": ["#test"],
            "isImportant": false
        },
        {
            "id": "test-5",
            "timestamp": Date.now(),
            "type": "note",
            "title": "Test Note 5",
            "body": "Fifth test note",
            "tags": ["#test"],
            "isImportant": false
        }
    ],
    "exportedAt": Date.now(),
    "version": "1.0"
};

console.log('✅ Test export data ready!');
console.log(`📊 Contains ${testData.notes.length} notes`);
console.log('\nTo test:');
console.log('1. Copy this entire test-export.json file');
console.log('2. Open your app');
console.log('3. Click "Import"');
console.log('4. Select this file');
console.log('5. All 5 notes should import!');

const fs = require('fs');
fs.writeFileSync('test-export.json', JSON.stringify(testData, null, 2));
console.log('\n✅ Created test-export.json');
