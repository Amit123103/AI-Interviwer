const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/amita/Downloads/Interveiw/Interveiw/client/src/app/dashboard';

function findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findFiles(filePath, fileList);
        } else if (file === 'page.tsx') {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const pageFiles = findFiles(baseDir);
console.log(`Found ${pageFiles.length} page.tsx files.`);

const replacements = [
    { regex: /(?<=["'\s])bg-black(?=["'\s])/g, replacement: 'bg-white dark:bg-black', name: 'bg-black' },
    { regex: /(?<=["'\s])bg-zinc-900(?=["'\s])/g, replacement: 'bg-slate-50 dark:bg-zinc-900', name: 'bg-zinc-900' },
    { regex: /(?<=["'\s])bg-\[#050505\](?=["'\s])/g, replacement: 'bg-white dark:bg-[#050505]', name: 'bg-[#050505]' },
    { regex: /(?<=["'\s])text-white(?=["'\s])/g, replacement: 'text-slate-900 dark:text-white', name: 'text-white' },
    { regex: /(?<=["'\s])border-white\/10(?=["'\s])/g, replacement: 'border-slate-200 dark:border-white/10', name: 'border-white/10' },
    { regex: /(?<=["'\s])text-zinc-400(?=["'\s])/g, replacement: 'text-slate-500 dark:text-zinc-400', name: 'text-zinc-400' }
];

let totalChanges = 0;
let filesToChange = 0;

pageFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let orig = content;
    
    replacements.forEach(r => {
        content = content.replace(r.regex, function(match) {
            // Ensure we don't accidentally replace if it already has dark:
            // This is handled by the regex lookbehind mostly, but let's be safe.
            return r.replacement;
        });
    });

    if (orig !== content) {
        filesToChange++;
        totalChanges += (orig.length - content.length); // Just a loose metric
    }
});

console.log(`Files needing update: ${filesToChange}`);
