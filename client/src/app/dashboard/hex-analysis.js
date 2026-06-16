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
const hexes = new Set();
const borders = new Set();
const texts = new Set();

pageFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find bg-[#something]
    let m = content.match(/bg-\[#[0-9a-fA-F]{6}\]/g);
    if (m) m.forEach(x => hexes.add(x));
    
    m = content.match(/border-\[#[0-9a-fA-F]{6}\]/g);
    if (m) m.forEach(x => borders.add(x));

    m = content.match(/text-\[#[0-9a-fA-F]{6}\]/g);
    if (m) m.forEach(x => texts.add(x));
});

console.log('Backgrounds: ', Array.from(hexes));
console.log('Borders: ', Array.from(borders));
console.log('Texts: ', Array.from(texts));
