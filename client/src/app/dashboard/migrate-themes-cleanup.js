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

// These are confirmed dark backgrounds that need to become white by default
const targets = [
    '#050505', '#020617', '#0c0a09', '#08080f', '#111118', '#04060e',
    '#1a1835', '#0a0a0a', '#1e1e1e', '#252526', '#151421', '#022c22',
    '#0f0e1a', '#06060e', '#1a1830', '#1a1b26', '#16161e', '#000000'
];

let totalModified = 0;

pageFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let orig = content;

    targets.forEach(hex => {
        // Match bg-[hex] but NOT dark:bg-[hex]
        const bgRegex = new RegExp(`(?<!dark:)bg-\\[${hex}\\]`, 'gi');
        content = content.replace(bgRegex, `bg-white dark:bg-[${hex}]`);
        
        const borderRegex = new RegExp(`(?<!dark:)border-\\[${hex}\\]`, 'gi');
        content = content.replace(borderRegex, `border-slate-200 dark:border-[${hex}]`);
    });

    if (orig !== content) {
        fs.writeFileSync(file, content, 'utf8');
        totalModified++;
    }
});

console.log(`Cleanup Migration Complete. Updated ${totalModified} files.`);
