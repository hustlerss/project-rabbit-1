const fs = require('fs');
const path = 'views/user/index.ejs';
let content = fs.readFileSync(path, 'utf8');

// Find the end of the good categories section
const goodEnd = content.indexOf('</section>\n\n<!-- ═══════════ HOW IT WORKS ═══════════ -->');
if (goodEnd === -1) {
    console.error('Could not find the end of the good categories section');
    process.exit(1);
}

// Find the start of the real How It Works section
// We search for the LAST occurrence of the section tag
const lastHowIdx = content.lastIndexOf('<section class="how-section">');
if (lastHowIdx === -1) {
    console.error('Could not find the real How It Works section');
    process.exit(1);
}

// We want to keep everything before goodEnd + the length of the section closer
// And everything from lastHowIdx onwards
const cleanContent = content.substring(0, goodEnd + 10) + '\n\n' + content.substring(lastHowIdx);

fs.writeFileSync(path, cleanContent);
console.log('Cleanup successful');
