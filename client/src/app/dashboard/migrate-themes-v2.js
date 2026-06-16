const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/amita/Downloads/Interveiw/Interveiw/client/src/app/dashboard';

function findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findFiles(filePath, fileList);
        } else if (filePath.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const pageFiles = findFiles(baseDir);
console.log(`Deep auditing ${pageFiles.length} files for hardcoded hex backgrounds...`);

// Definitive mapping for hardcoded dark elements to dynamic theme pairs
const mappings = [
    // Backgrounds (Dark Hex -> Light/Dark pair)
    { from: /bg-\[#06060e\]/g, to: 'bg-white dark:bg-[#06060e]' },
    { from: /bg-\[#0f0e1a\]/g, to: 'bg-white dark:bg-[#0f0e1a]' },
    { from: /bg-\[#050505\]/g, to: 'bg-slate-50 dark:bg-[#050505]' },
    { from: /bg-\[#0c0a09\]/g, to: 'bg-white dark:bg-[#0c0a09]' },
    { from: /bg-\[#08080f\]/g, to: 'bg-white dark:bg-[#08080f]' },
    { from: /bg-\[#111118\]/g, to: 'bg-white dark:bg-[#111118]' },
    { from: /bg-\[#04060e\]/g, to: 'bg-white dark:bg-[#04060e]' },
    { from: /bg-\[#0a0a0a\]/g, to: 'bg-slate-50 dark:bg-[#0a0a0a]' },
    { from: /bg-\[#1e1e1e\]/g, to: 'bg-white dark:bg-[#1e1e1e]' },
    { from: /bg-\[#151421\]/g, to: 'bg-white dark:bg-[#151421]' },
    
    // Borders
    { from: /border-\[#1a1830\]/g, to: 'border-slate-200 dark:border-[#1a1830]' },
    { from: /border-\[#050505\]/g, to: 'border-slate-300 dark:border-[#050505]' },
    { from: /border-\[#06b6d4\]\/30/g, to: 'border-cyan-200 dark:border-[#06b6d4]/30' },
    
    // Ensure no double-replacement occurred from previous script
    // If a line has "bg-white dark:bg-white dark:bg-[#06060e]", we should fix it.
    // This script won't do that if we use specific matches.
];

let totalModified = 0;

pageFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let orig = content;
    
    mappings.forEach(m => {
        // Prevent double tagging if script is run twice
        const alreadyReplaced = new RegExp(`dark:${m.from.source}`, 'g');
        if (!alreadyReplaced.test(content)) {
            content = content.replace(m.from, m.to);
        }
    });

    if (orig !== content) {
        fs.writeFileSync(file, content, 'utf8');
        totalModified++;
    }
});

console.log(`Deep Migration Complete. Updated ${totalModified} files.`);
