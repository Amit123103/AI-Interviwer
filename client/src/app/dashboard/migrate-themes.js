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
console.log(`Auditing ${pageFiles.length} page.tsx files...`);

const replacements = [
    { regex: /(?<=["'\s])bg-black(?=["'\s])/g, replacement: 'bg-slate-50 dark:bg-black' },
    { regex: /(?<=["'\s])bg-zinc-900(?=["'\s])/g, replacement: 'bg-white dark:bg-zinc-900' },
    { regex: /(?<=["'\s])bg-\[#050505\](?=["'\s])/g, replacement: 'bg-slate-50 dark:bg-[#050505]' },
    { regex: /(?<=["'\s])text-white(?=["'\s])/g, replacement: 'text-slate-900 dark:text-white' },
    { regex: /(?<=["'\s])border-white\/10(?=["'\s])/g, replacement: 'border-slate-200 dark:border-white/10' },
    { regex: /(?<=["'\s])border-white\/5(?=["'\s])/g, replacement: 'border-slate-100 dark:border-white/5' },
    { regex: /(?<=["'\s])text-zinc-400(?=["'\s])/g, replacement: 'text-slate-500 dark:text-zinc-400' },
    { regex: /(?<=["'\s])text-zinc-300(?=["'\s])/g, replacement: 'text-slate-600 dark:text-zinc-300' },
    { regex: /(?<=["'\s])bg-zinc-950\/60(?=["'\s])/g, replacement: 'bg-white/80 dark:bg-zinc-950/60' },
    { regex: /(?<=["'\s])bg-zinc-900\/50(?=["'\s])/g, replacement: 'bg-white/60 dark:bg-zinc-900/50' },
    { regex: /(?<=["'\s])border-white\/20(?=["'\s])/g, replacement: 'border-slate-300 dark:border-white/20' }
];

let totalModified = 0;

pageFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let orig = content;
    
    replacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
    });

    if (orig !== content) {
        fs.writeFileSync(file, content, 'utf8');
        totalModified++;
    }
});

console.log(`Migration Complete. Successfully modified ${totalModified} files to support light mode bridging.`);
