const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    [/text-slate-900 dark:text-white neural:text-emerald-50/g, 'text-zinc-900'],
    [/bg-slate-50\/95 dark:bg-zinc-950\/95 neural:bg-emerald-950\/95/g, 'bg-white'],
    [/bg-white\/80 dark:bg-zinc-950\/80 neural:bg-emerald-950\/80/g, 'bg-white'],
    [/border-black\/5 dark:border-white\/5 neural:border-emerald-500\/20/g, 'border-zinc-200'],
    [/border-black\/5 dark:border-white\/\[0\.06\] neural:border-emerald-500\/20/g, 'border-zinc-200'],
    [/text-slate-500 dark:text-zinc-400 neural:text-emerald-400\/80/g, 'text-zinc-500'],
    [/text-slate-500 dark:text-zinc-500 neural:text-emerald-400\/80/g, 'text-zinc-500'],
    [/hover:text-slate-900 dark:hover:text-white neural:hover:text-emerald-50/g, 'hover:text-zinc-900'],
    [/bg-slate-100\/50 dark:bg-zinc-900\/30 neural:bg-emerald-900\/20 backdrop-blur-xl/g, 'bg-white shadow-sm border border-zinc-200'],
    [/hover:bg-slate-200\/50 dark:hover:bg-white\/\[0\.04\] neural:hover:bg-emerald-500\/10/g, 'hover:bg-zinc-50 hover:shadow-md'],
    [/bg-white\/90 dark:bg-zinc-950\/90 neural:bg-emerald-950\/90/g, 'bg-white shadow-sm'],
    [/text-slate-800 dark:text-white neural:text-emerald-50/g, 'text-zinc-900'],
    [/text-slate-700 dark:hover:text-zinc-300 neural:hover:text-emerald-300/g, 'hover:text-zinc-700'],
    [/dark:group-hover:text-zinc-300 neural:group-hover:text-emerald-300/g, 'group-hover:text-zinc-700'],
    [/bg-slate-100\/50 dark:bg-white\/\[0\.03\] neural:bg-emerald-500\/5/g, 'bg-zinc-50'],
    [/border-black\/10 dark:border-white\/10 neural:border-emerald-500\/20/g, 'border-zinc-200'],
    [/hover:bg-white\/5 hover:text-white/g, 'hover:bg-zinc-100 hover:text-zinc-900'],
    [/text-zinc-400/g, 'text-zinc-500'],
    [/text-zinc-300/g, 'text-zinc-600'],
    [/text-white/g, 'text-zinc-900'],
    [/bg-slate-200 dark:bg-zinc-500 neural:bg-emerald-500/g, 'bg-zinc-100'],
    [/flex min-h-screen text-slate-900 dark:text-white neural:text-emerald-50 relative font-sans selection:bg-indigo-500\/30/g, 'flex min-h-screen text-zinc-900 bg-zinc-50 relative font-sans'],
    [/from-indigo-500\/15 to-teal-500\/10 border border-indigo-500\/20 text-white font-semibold shadow-lg/g, 'bg-indigo-50 text-indigo-700 font-semibold border-none'],
    [/bg-zinc-950\/50 border border-white\/5 rounded-3xl p-8 md:p-12 shadow-2xl/g, 'bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 shadow-sm'],
    [/bg-zinc-900\/30 backdrop-blur-xl border border-white\/\[0\.06\] p-6 space-y-6 rounded-2xl/g, 'bg-white border border-zinc-200 p-6 space-y-6 rounded-2xl shadow-sm'],
    [/bg-zinc-950\/30 backdrop-blur-3xl border border-white\/\[0\.06\] p-10 rounded-2xl/g, 'bg-white border border-zinc-200 p-10 rounded-2xl shadow-sm'],
    [/bg-white\/\[0\.02\] border border-white\/5 rounded-3xl p-8 md:p-12 shadow-2xl/g, 'bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 shadow-sm'],
    [/bg-zinc-900\/30 backdrop-blur-xl border border-white\/\[0\.06\] p-6 flex flex-col rounded-2xl/g, 'bg-white border border-zinc-200 p-6 flex flex-col rounded-2xl shadow-sm'],
    [/bg-white\/\[0\.03\] border border-white\/\[0\.06\] space-y-2 shadow-inner/g, 'bg-zinc-50 border border-zinc-100 space-y-2'],
    [/bg-[#06060e]|bg-[#0f0e1a]|bg-[#060610]/g, 'bg-white'],
    [/border-[#8b5cf6]\/30|border-[#7c3aed]\/30/g, 'border-zinc-200'],
    [/text-[#06b6d4]|text-[#f59e0b]|text-[#7c3aed]/g, 'text-zinc-800'],
    [/bg-transparent/g, 'bg-zinc-50'], // for main bg
    [/bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-zinc-900/g, 'text-zinc-900'],
    [/bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-zinc-900/g, 'text-zinc-900'],
    [/bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-zinc-900/g, 'text-zinc-900'],
    [/bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-zinc-900/g, 'text-zinc-900'],
    [/bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-zinc-900/g, 'text-zinc-900']
];

let newContent = content;
replacements.forEach(([pattern, replacement]) => {
    newContent = newContent.replace(pattern, replacement);
});

// Extra fix to ensure main tag background is purely clear if not caught
newContent = newContent.replace(/<main className="flex-1 min-w-0 transition-all duration-500 bg-zinc-50 relative">/, '<main className="flex-1 min-w-0 transition-all duration-500 bg-zinc-50 relative">');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Dashboard base styling replaced successfully.');
