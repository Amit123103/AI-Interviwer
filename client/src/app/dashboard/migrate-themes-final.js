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
console.log(`Final comprehensive audit of ${pageFiles.length} files...`);

const darkHexes = [
    '050505', '020617', '0c0a09', '08080f', '111118', '04060e', 
    '1a1835', '0a0a0a', '1e1e1e', '151421', '022c22', '0f0e1a', 
    '06060e', '08080f', '0c0a09', '1a1830', '1a1b26', '16161e'
];

let totalModified = 0;

pageFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let orig = content;
    
    // 1. Handle all discovered dark hex backgrounds
    darkHexes.forEach(hex => {
        const bgRegex = new RegExp(`(?<!dark:)bg-\\[#${hex}\\]`, 'gi');
        content = content.replace(bgRegex, `bg-white dark:bg-[#${hex}]`);
        
        const borderRegex = new RegExp(`(?<!dark:)border-\\[#${hex}\\]`, 'gi');
        content = content.replace(borderRegex, `border-slate-200 dark:border-[#${hex}]`);
    });

    // 2. Catch any remaining "bg-black" or "bg-zinc-950" that might have been missed or added
    // and ensure they have the white counterpart
    const standardDarkBgs = ['black', 'zinc-950', 'slate-950', 'neutral-950', 'zinc-900', 'slate-900'];
    standardDarkBgs.forEach(color => {
         const regex = new RegExp(`(?<!dark:)bg-${color}(?![\\w\\-])`, 'g');
         content = content.replace(regex, `bg-white dark:bg-${color}`);
    });

    // 3. Text colors: ensure text-white and light zinc/slate texts have dark: variants
    const lightTexts = ['white', 'zinc-100', 'slate-100', 'zinc-200', 'slate-200', 'zinc-300', 'slate-300', 'zinc-400', 'slate-400'];
    lightTexts.forEach(color => {
        const regex = new RegExp(`(?<!dark:)text-${color}(?![\\w\\-])`, 'g');
        content = content.replace(regex, `text-slate-900 dark:text-${color}`);
    });

    if (orig !== content) {
        fs.writeFileSync(file, content, 'utf8');
        totalModified++;
    }
});

console.log(`Final migration complete. Updated ${totalModified} files to support light mode by default.`);
