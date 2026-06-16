import { Code2, Database, Globe, Layers, Server, Terminal, Smartphone } from 'lucide-react'
import React from 'react'

export const CATEGORIES = [
    {
        id: 'frontend',
        title: 'Frontend',
        description: 'Browser & UI logic',
        icon: <Globe className="w-8 h-8 text-blue-400" />,
        color: 'blue',
        popularTags: ['React', 'Vue', 'HTML/CSS']
    },
    {
        id: 'backend',
        title: 'Backend',
        description: 'Servers & APIs',
        icon: <Server className="w-8 h-8 text-emerald-400" />,
        color: 'emerald',
        popularTags: ['Python', 'Node.js', 'Go']
    },
    {
        id: 'fullstack',
        title: 'Full-Stack',
        description: 'End-to-end applications',
        icon: <Layers className="w-8 h-8 text-purple-400" />,
        color: 'purple',
        popularTags: ['MERN', 'Next.js', 'Django']
    },
    {
        id: 'core',
        title: 'Core Programming',
        description: 'General purpose languages',
        icon: <Terminal className="w-8 h-8 text-amber-400" />,
        color: 'amber',
        popularTags: ['Java', 'C++', 'Rust']
    },
    {
        id: 'specialized',
        title: 'Specialized',
        description: 'Data, Web3, DevOps',
        icon: <Database className="w-8 h-8 text-rose-400" />,
        color: 'rose',
        popularTags: ['SQL', 'Solidity', 'Docker']
    }
]

export const LANGUAGES_BY_CATEGORY: Record<string, any[]> = {
    'frontend': [
        { id: 'html_css', name: 'HTML/CSS', difficulty: 'Beginner', useCases: 'Static sites, portfolios', icon: <Globe className="w-6 h-6 text-orange-400" /> },
        { id: 'javascript', name: 'JavaScript', difficulty: 'Beginner', useCases: 'DOM, interactivity', icon: <Terminal className="w-6 h-6 text-yellow-400" /> },
        { id: 'typescript', name: 'TypeScript', difficulty: 'Intermediate', useCases: 'Scalable frontend', icon: <Code2 className="w-6 h-6 text-blue-500" /> },
        { id: 'react', name: 'React.js', difficulty: 'Intermediate', useCases: 'Component UIs, SPAs', icon: <Globe className="w-6 h-6 text-cyan-400" /> },
        { id: 'vue', name: 'Vue.js', difficulty: 'Intermediate', useCases: 'Reactive apps', icon: <Globe className="w-6 h-6 text-emerald-500" /> },
        { id: 'angular', name: 'Angular', difficulty: 'Advanced', useCases: 'Enterprise SPAs', icon: <Globe className="w-6 h-6 text-red-500" /> },
        { id: 'nextjs', name: 'Next.js', difficulty: 'Advanced', useCases: 'SSR, full-stack React', icon: <Code2 className="w-6 h-6 text-white" /> },
        { id: 'svelte', name: 'Svelte', difficulty: 'Intermediate', useCases: 'Lightweight UIs', icon: <Globe className="w-6 h-6 text-orange-600" /> },
        { id: 'tailwind', name: 'Tailwind CSS', difficulty: 'Beginner', useCases: 'Styling, Design', icon: <Globe className="w-6 h-6 text-cyan-300" /> }
    ],
    'backend': [
        { id: 'python_flask', name: 'Python + Flask', difficulty: 'Beginner', useCases: 'REST APIs, microservices', icon: <Terminal className="w-6 h-6 text-blue-400" /> },
        { id: 'python_django', name: 'Python + Django', difficulty: 'Intermediate', useCases: 'Full web apps', icon: <Terminal className="w-6 h-6 text-emerald-600" /> },
        { id: 'node_express', name: 'Node.js + Express', difficulty: 'Intermediate', useCases: 'Real-time servers', icon: <Server className="w-6 h-6 text-emerald-400" /> },
        { id: 'java_spring', name: 'Java + Spring Boot', difficulty: 'Advanced', useCases: 'Enterprise APIs', icon: <Server className="w-6 h-6 text-red-400" /> },
        { id: 'csharp_asp', name: 'C# + ASP.NET', difficulty: 'Advanced', useCases: 'Enterprise web apps', icon: <Server className="w-6 h-6 text-purple-500" /> },
        { id: 'php_laravel', name: 'PHP + Laravel', difficulty: 'Intermediate', useCases: 'CMS, e-commerce', icon: <Globe className="w-6 h-6 text-indigo-400" /> },
        { id: 'go', name: 'Go (Golang)', difficulty: 'Advanced', useCases: 'High-perf APIs', icon: <Globe className="w-6 h-6 text-cyan-400" /> },
        { id: 'rust_actix', name: 'Rust + Actix', difficulty: 'Advanced', useCases: 'Ultra-fast servers', icon: <Terminal className="w-6 h-6 text-orange-600" /> }
    ],
    'fullstack': [
        { id: 'mern', name: 'MERN Stack', difficulty: 'Intermediate', useCases: 'JS everywhere', icon: <Layers className="w-6 h-6 text-blue-400" /> },
        { id: 'mean', name: 'MEAN Stack', difficulty: 'Advanced', useCases: 'Enterprise JS', icon: <Layers className="w-6 h-6 text-red-500" /> },
        { id: 't3', name: 'T3 Stack', difficulty: 'Advanced', useCases: 'Type-safe Next.js', icon: <Layers className="w-6 h-6 text-white" /> },
        { id: 'django_react', name: 'Django + React', difficulty: 'Advanced', useCases: 'Heavy backend + UI', icon: <Layers className="w-6 h-6 text-emerald-400" /> },
        { id: 'laravel_vue', name: 'Laravel + Vue', difficulty: 'Intermediate', useCases: 'Rapid development', icon: <Layers className="w-6 h-6 text-red-400" /> }
    ],
    'core': [
        { id: 'python', name: 'Python', difficulty: 'Beginner', useCases: 'Scripting, AI', icon: <Terminal className="w-6 h-6 text-blue-400" /> },
        { id: 'java', name: 'Java', difficulty: 'Intermediate', useCases: 'OOP, Android', icon: <Code2 className="w-6 h-6 text-orange-500" /> },
        { id: 'cpp', name: 'C++', difficulty: 'Advanced', useCases: 'Games, Systems', icon: <Terminal className="w-6 h-6 text-blue-600" /> },
        { id: 'c', name: 'C', difficulty: 'Intermediate', useCases: 'Embedded', icon: <Terminal className="w-6 h-6 text-blue-400" /> },
        { id: 'csharp', name: 'C#', difficulty: 'Intermediate', useCases: 'Unity, Apps', icon: <Code2 className="w-6 h-6 text-purple-500" /> },
        { id: 'swift', name: 'Swift', difficulty: 'Intermediate', useCases: 'iOS/macOS', icon: <Smartphone className="w-6 h-6 text-orange-400" /> },
        { id: 'ruby', name: 'Ruby', difficulty: 'Beginner', useCases: 'Scripting', icon: <Terminal className="w-6 h-6 text-red-500" /> },
        { id: 'rust', name: 'Rust', difficulty: 'Advanced', useCases: 'Memory-safe systems', icon: <Code2 className="w-6 h-6 text-orange-600" /> }
    ],
    'specialized': [
        { id: 'sql', name: 'SQL + PostgreSQL', difficulty: 'Beginner', useCases: 'Databases', icon: <Database className="w-6 h-6 text-blue-400" /> },
        { id: 'docker', name: 'Docker + DevOps', difficulty: 'Intermediate', useCases: 'Containers', icon: <Server className="w-6 h-6 text-blue-500" /> },
        { id: 'python_ml', name: 'Python for AI/ML', difficulty: 'Advanced', useCases: 'PyTorch, TF', icon: <Code2 className="w-6 h-6 text-emerald-400" /> },
        { id: 'solidity', name: 'Solidity', difficulty: 'Advanced', useCases: 'Smart contracts', icon: <Code2 className="w-6 h-6 text-gray-400" /> },
        { id: 'bash', name: 'Bash Scripting', difficulty: 'Intermediate', useCases: 'Linux Automation', icon: <Terminal className="w-6 h-6 text-white" /> }
    ]
}

export const PROJECT_IDEAS: Record<string, any[]> = {
    'frontend': [
        { id: 'f1', title: 'Personal Portfolio Website', desc: 'HTML, CSS, responsiveness', difficulty: 'Beginner', estimated: '~2 hours', tags: ['HTML', 'CSS'] },
        { id: 'f2', title: 'Interactive Quiz App', desc: 'State, conditionals, scoring', difficulty: 'Intermediate', estimated: '~3 hours', tags: ['Events', 'DOM'] },
        { id: 'f3', title: 'Movie Search App', desc: 'REST API, async/await, UI rendering', difficulty: 'Intermediate', estimated: '~4 hours', tags: ['API', 'Fetch'] },
        { id: 'f4', title: 'Real-time Chat UI', desc: 'Mock WebSockets, live updates', difficulty: 'Intermediate', estimated: '~3 hours', tags: ['UI', 'State'] },
        { id: 'f5', title: '3D Portfolio (Three.js)', desc: '3D scene, models, animations', difficulty: 'Advanced', estimated: '~8 hours', tags: ['Three.js', 'Canvas'] },
        { id: 'f6', title: 'Kanban Board Clone', desc: 'Drag & drop, complex state management', difficulty: 'Advanced', estimated: '~6 hours', tags: ['DND', 'LocalStorage'] }
    ],
    'backend': [
        { id: 'b1', title: 'REST API for Todo App', desc: 'CRUD endpoints, JSON responses', difficulty: 'Beginner', estimated: '~2 hours', tags: ['Express', 'Routing'] },
        { id: 'b2', title: 'User Authentication API', desc: 'JWT, bcrypt, sessions', difficulty: 'Intermediate', estimated: '~4 hours', tags: ['Security', 'JWT'] },
        { id: 'b3', title: 'URL Shortener Service', desc: 'Hashing, redirects, analytics tracking', difficulty: 'Intermediate', estimated: '~5 hours', tags: ['Hashing', 'DB'] },
        { id: 'b4', title: 'Real-time Chat Server', desc: 'WebSockets, broadcast rooms', difficulty: 'Intermediate', estimated: '~4 hours', tags: ['Sockets'] },
        { id: 'b5', title: 'Payment Integration API', desc: 'Stripe webhooks, mock transactions', difficulty: 'Advanced', estimated: '~6 hours', tags: ['Stripe', 'Webhooks'] },
        { id: 'b6', title: 'Job Queue System', desc: 'Workers, Redis simulation, task scheduling', difficulty: 'Advanced', estimated: '~8 hours', tags: ['Queues', 'Workers'] }
    ],
    'fullstack': [
        { id: 'fs1', title: 'Full-Stack Blog Platform', desc: 'Auth + posts + comments', difficulty: 'Intermediate', estimated: '~8 hours', tags: ['CRUD', 'Auth'] },
        { id: 'fs2', title: 'E-commerce Store', desc: 'Products + cart + checkout', difficulty: 'Advanced', estimated: '~12 hours', tags: ['Cart', 'Payments'] },
        { id: 'fs3', title: 'Video Streaming Platform', desc: 'Upload + transcode mock + playlists', difficulty: 'Advanced', estimated: '~15 hours', tags: ['Video', 'S3'] },
        { id: 'fs4', title: 'Learning Management System', desc: 'Courses + quizzes + progress', difficulty: 'Advanced', estimated: '~14 hours', tags: ['LMS', 'Roles'] }
    ],
    'core': [
        { id: 'c1', title: 'CLI Todo Manager', desc: 'File I/O, parsing, CLI arguments', difficulty: 'Beginner', estimated: '~2 hours', tags: ['CLI', 'Files'] },
        { id: 'c2', title: 'Bank Simulator', desc: 'OOP, classes, methods, transactions', difficulty: 'Intermediate', estimated: '~3 hours', tags: ['OOP'] },
        { id: 'c3', title: 'Web Scraper', desc: 'HTTP requests, DOM parsing, JSON export', difficulty: 'Intermediate', estimated: '~4 hours', tags: ['HTTP', 'Regex'] },
        { id: 'c4', title: 'Password Generator', desc: 'Strings, randomness, custom rules', difficulty: 'Intermediate', estimated: '~2 hours', tags: ['Logic'] },
        { id: 'c5', title: 'Mini Compiler/Parser', desc: 'Lexer, syntax tree, evaluator', difficulty: 'Advanced', estimated: '~10 hours', tags: ['AST', 'Parsing'] }
    ],
    'specialized': [
        { id: 's1', title: 'Database Schema Designer', desc: 'Design normalized SQL schemas and scripts', difficulty: 'Beginner', estimated: '~3 hours', tags: ['SQL', 'Design'] },
        { id: 's2', title: 'Basic Blockchain Ledger', desc: 'Crypto hashing, proof of work mock', difficulty: 'Advanced', estimated: '~6 hours', tags: ['Crypto', 'Structs'] },
        { id: 's3', title: 'Data Analysis Pipeline', desc: 'Pandas, CSV parsing, Matplotlib charts', difficulty: 'Intermediate', estimated: '~5 hours', tags: ['Data', 'Plotting'] },
        { id: 's4', title: 'Dockerized Microservices', desc: 'Write Dockerfiles and compose YAML', difficulty: 'Advanced', estimated: '~6 hours', tags: ['Docker', 'YAML'] }
    ]
}
