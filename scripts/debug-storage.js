// Debug script to check localStorage
console.log('📊 Checking localStorage data...\n');

const STORAGE_KEY = 'sam-ai-notes';

// Simulate reading from localStorage (you'll need to check in browser)
console.log(`Key to check in browser console:`);
console.log(`localStorage.getItem('${STORAGE_KEY}')`);
console.log('\nOr run this in browser DevTools:');
console.log(`JSON.parse(localStorage.getItem('${STORAGE_KEY}')).forEach((note, i) => {`);
console.log(`  console.log(\`\${i + 1}. \${note.title} (ID: \${note.id})\`);`);
console.log(`});`);

console.log('\n\n🔍 DEBUGGING CHECKLIST:\n');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Paste the code above');
console.log('4. Check if notes have UNIQUE IDs');
console.log('5. Check if all notes are different');
console.log('\nIf all notes show same title → Import created duplicates');
console.log('If notes have same ID → Key collision issue');
