import prisma from '../prisma'
import dotenv from 'dotenv'

dotenv.config()

// Base questions with full details
const baseQuestions = [
    {
        title: "Explain the difference between stack and heap memory",
        type: "technical",
        difficulty: "medium",
        role: ["Software Engineer", "Backend Developer", "Full Stack Developer"],
        subject: ["Memory Management", "Computer Science Fundamentals"],
        explanation: "Stack memory is used for static memory allocation and stores local variables, function parameters, and return addresses. Heap memory is used for dynamic memory allocation where variables are allocated and freed in any order.",
        sampleAnswer: "Stack memory is automatically managed and follows LIFO (Last In First Out) principle. It's faster but limited in size. Heap memory is manually managed, larger, but slower. Stack stores primitive types and references, while heap stores objects and arrays.",
        keyPoints: [
            "Stack is LIFO, automatic management",
            "Heap is dynamic, manual management",
            "Stack is faster but smaller",
            "Heap is slower but larger",
            "Stack overflow vs memory leaks"
        ],
        interviewerExpectations: [
            "Clear understanding of memory allocation",
            "Real-world examples",
            "Performance implications",
            "Common pitfalls"
        ],
        commonMistakes: [
            "Confusing stack with heap",
            "Not mentioning speed differences",
            "Forgetting about scope and lifetime"
        ],
        tags: ["memory", "fundamentals", "cs", "performance"],
        expectedKeywords: ["stack", "heap", "allocation", "LIFO", "dynamic", "static"],
        estimatedTime: 5
    },
    {
        title: "What is Big O notation and why is it important?",
        type: "technical",
        difficulty: "easy",
        role: ["Software Engineer", "Data Engineer", "Full Stack Developer"],
        subject: ["Algorithms", "Complexity Analysis"],
        explanation: "Big O notation describes the upper bound of time or space complexity of an algorithm in terms of input size. It helps analyze algorithm efficiency and scalability.",
        sampleAnswer: "Big O notation expresses worst-case complexity. O(1) is constant, O(n) is linear, O(n²) is quadratic, O(log n) is logarithmic. It's crucial for choosing efficient algorithms and predicting performance at scale.",
        keyPoints: [
            "Describes worst-case complexity",
            "Common complexities: O(1), O(n), O(log n), O(n²)",
            "Helps compare algorithms",
            "Critical for scalability"
        ],
        interviewerExpectations: [
            "Understanding of common complexities",
            "Ability to analyze simple algorithms",
            "Real examples"
        ],
        commonMistakes: [
            "Confusing Big O with average case",
            "Not considering space complexity",
            "Ignoring constants in analysis"
        ],
        tags: ["algorithms", "complexity", "fundamentals"],
        expectedKeywords: ["complexity", "time", "space", "efficiency", "scalability"],
        estimatedTime: 4
    },
    {
        title: "Tell me about a time you failed",
        type: "behavioral",
        difficulty: "medium",
        role: ["All Roles"],
        subject: ["Self-awareness", "Growth Mindset"],
        explanation: "This question assesses self-awareness, accountability, and ability to learn from mistakes.",
        sampleAnswer: "In my previous role, I underestimated the complexity of a feature and committed to an unrealistic deadline. The project was delayed by two weeks. I learned to break down tasks better, involve the team in estimation, and communicate risks early. Now I use story points and buffer time for unknowns.",
        keyPoints: [
            "Choose a real, significant failure",
            "Take ownership, don't blame others",
            "Focus on lessons learned",
            "Show how you've improved",
            "Use STAR method"
        ],
        interviewerExpectations: [
            "Genuine self-reflection",
            "Accountability",
            "Growth mindset",
            "Specific examples"
        ],
        commonMistakes: [
            "Choosing a trivial failure",
            "Blaming others",
            "Not showing learning",
            "Being too negative"
        ],
        tags: ["behavioral", "failure", "growth", "STAR"],
        expectedKeywords: ["learned", "improved", "mistake", "responsibility"],
        estimatedTime: 3
    },
    {
        title: "Design a URL shortener like bit.ly",
        type: "system-design",
        difficulty: "medium",
        role: ["Senior Engineer", "System Architect", "Backend Developer"],
        subject: ["System Design", "Scalability"],
        explanation: "Classic system design problem testing understanding of hashing, databases, caching, and scalability.",
        sampleAnswer: "Use base62 encoding for short URLs. Store mappings in NoSQL (Cassandra/DynamoDB) for horizontal scaling. Implement Redis cache for hot URLs. Use consistent hashing for sharding. Add rate limiting and analytics. Consider CDN for global distribution.",
        keyPoints: [
            "Hash function for URL generation",
            "Database choice (NoSQL for scale)",
            "Caching strategy",
            "Sharding and partitioning",
            "Rate limiting",
            "Analytics tracking"
        ],
        interviewerExpectations: [
            "Clarifying questions about scale",
            "Discussion of trade-offs",
            "Database schema design",
            "Handling collisions",
            "Performance optimization"
        ],
        commonMistakes: [
            "Not asking about scale",
            "Choosing SQL without justification",
            "Ignoring caching",
            "Not considering analytics"
        ],
        tags: ["system-design", "scalability", "databases", "caching"],
        expectedKeywords: ["hash", "database", "cache", "scale", "sharding"],
        estimatedTime: 45
    },
    {
        title: "Reverse a linked list",
        type: "coding",
        difficulty: "easy",
        role: ["Software Engineer", "Full Stack Developer"],
        subject: ["Data Structures", "Linked Lists"],
        explanation: "Fundamental linked list manipulation problem testing pointer manipulation skills.",
        sampleAnswer: `function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current !== null) {
    let next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  
  return prev;
}`,
        keyPoints: [
            "Use three pointers: prev, current, next",
            "Iterate through list",
            "Reverse pointers",
            "Return new head",
            "Time: O(n), Space: O(1)"
        ],
        interviewerExpectations: [
            "Clean, working code",
            "Edge case handling (null, single node)",
            "Complexity analysis",
            "Alternative approaches (recursive)"
        ],
        commonMistakes: [
            "Losing reference to next node",
            "Not handling null input",
            "Incorrect pointer updates",
            "Using extra space unnecessarily"
        ],
        tags: ["coding", "linked-list", "pointers", "iteration"],
        expectedKeywords: ["pointer", "reverse", "iterate", "null"],
        estimatedTime: 15
    }
]

// Generate additional questions programmatically
function generateQuestions() {
    const topics = {
        technical: [
            "Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming",
            "Recursion", "Sorting", "Searching", "Hash Tables", "Heaps",
            "Stacks", "Queues", "Bit Manipulation", "Math", "Greedy",
            "Backtracking", "Divide and Conquer", "Two Pointers", "Sliding Window"
        ],
        behavioral: [
            "Leadership", "Conflict Resolution", "Teamwork", "Communication",
            "Time Management", "Problem Solving", "Adaptability", "Initiative"
        ],
        systemDesign: [
            "Social Networks", "Messaging Systems", "E-commerce", "Streaming",
            "Search Engines", "Recommendation Systems", "Payment Systems"
        ]
    }

    const generatedQuestions: any[] = []

    // Generate 200 technical questions
    for (let i = 0; i < 200; i++) {
        const topic = topics.technical[i % topics.technical.length]
        const difficultyIndex = i % 3
        const difficulty = ["Easy", "Medium", "Hard"][difficultyIndex] // Prisma schema uses capitalized enums/strings for some fields

        generatedQuestions.push({
            title: `${topic}: Question ${i + 1}`,
            type: "technical",
            difficulty,
            role: ["Software Engineer", "Full Stack Developer"],
            subject: [topic, "Computer Science"],
            explanation: `This question tests your understanding of ${topic}. Focus on demonstrating clear knowledge of fundamental concepts and their practical applications.`,
            sampleAnswer: `A comprehensive answer would cover the key aspects of ${topic}, including definitions, use cases, and trade-offs.`,
            keyPoints: [
                `Understanding ${topic} fundamentals`,
                "Practical applications",
                "Performance considerations",
                "Common patterns"
            ],
            interviewerExpectations: [
                "Clear explanation",
                "Real-world examples",
                "Understanding of trade-offs"
            ],
            commonMistakes: [
                "Vague explanations",
                "Missing edge cases",
                "Not considering complexity"
            ],
            tags: [topic.toLowerCase().replace(/\s+/g, '-'), "technical"],
            expectedKeywords: [topic.toLowerCase()],
            estimatedTime: 5
        })
    }

    // Generate 100 behavioral questions
    for (let i = 0; i < 100; i++) {
        const topic = topics.behavioral[i % topics.behavioral.length]

        generatedQuestions.push({
            title: `Describe a time when you demonstrated ${topic}`,
            type: "behavioral",
            difficulty: "Medium",
            role: ["All Roles"],
            subject: [topic, "Soft Skills"],
            explanation: `This behavioral question assesses your ${topic} skills through past experiences.`,
            sampleAnswer: `Use the STAR method: Situation, Task, Action, Result. Describe a specific instance where you demonstrated ${topic}.`,
            keyPoints: [
                "Use STAR method",
                "Be specific and concrete",
                "Show impact and results",
                "Demonstrate learning"
            ],
            interviewerExpectations: [
                "Specific examples",
                "Clear structure",
                "Measurable outcomes",
                "Self-awareness"
            ],
            commonMistakes: [
                "Being too vague",
                "Not using STAR method",
                "Blaming others",
                "No measurable results"
            ],
            tags: ["behavioral", topic.toLowerCase().replace(/\s+/g, '-'), "STAR"],
            expectedKeywords: [topic.toLowerCase()],
            estimatedTime: 3
        })
    }

    // Generate 50 system design questions
    for (let i = 0; i < 50; i++) {
        const topic = topics.systemDesign[i % topics.systemDesign.length]

        generatedQuestions.push({
            title: `Design a ${topic} system`,
            type: "system-design",
            difficulty: ["Medium", "Hard"][i % 2],
            role: ["Senior Engineer", "System Architect", "Backend Developer"],
            subject: ["System Design", "Scalability", topic],
            explanation: `Design a scalable ${topic} system. Consider requirements, constraints, and trade-offs.`,
            sampleAnswer: `Start with requirements gathering, then design components: database, caching, load balancing, API design. Discuss scalability and trade-offs.`,
            keyPoints: [
                "Requirements clarification",
                "High-level architecture",
                "Database design",
                "Scalability considerations",
                "Trade-off discussions"
            ],
            interviewerExpectations: [
                "Asking clarifying questions",
                "Systematic approach",
                "Understanding of distributed systems",
                "Discussion of trade-offs"
            ],
            commonMistakes: [
                "Jumping to solution",
                "Not asking about scale",
                "Ignoring edge cases",
                "Over-engineering"
            ],
            tags: ["system-design", topic.toLowerCase().replace(/\s+/g, '-'), "scalability"],
            expectedKeywords: ["scale", "database", "cache", "distributed"],
            estimatedTime: 45
        })
    }

    // Generate 150 coding questions
    for (let i = 0; i < 150; i++) {
        const topic = topics.technical[i % topics.technical.length]
        const difficultyIndex = i % 3
        const difficulty = ["Easy", "Medium", "Hard"][difficultyIndex]

        generatedQuestions.push({
            title: `Coding Problem: ${topic} - Problem ${i + 1}`,
            type: "coding",
            difficulty,
            role: ["Software Engineer", "Full Stack Developer"],
            subject: [topic, "Algorithms"],
            explanation: `Solve this ${topic} problem efficiently. Consider time and space complexity.`,
            sampleAnswer: `// Approach: [describe approach]\nfunction solve(input) {\n  // Implementation\n  return result;\n}`,
            keyPoints: [
                "Understand the problem",
                "Consider edge cases",
                "Optimize for time/space",
                "Test thoroughly"
            ],
            interviewerExpectations: [
                "Working code",
                "Complexity analysis",
                "Edge case handling",
                "Clean code"
            ],
            commonMistakes: [
                "Not testing code",
                "Missing edge cases",
                "Poor variable names",
                "Not discussing complexity"
            ],
            tags: ["coding", topic.toLowerCase().replace(/\s+/g, '-'), "algorithms"],
            expectedKeywords: [topic.toLowerCase(), "algorithm", "complexity"],
            estimatedTime: 30
        })
    }

    return generatedQuestions
}

async function seedQuestions() {
    try {
        console.log('🗑️  Clearing existing questions...')
        await prisma.question.deleteMany({})
        console.log('✅ Cleared existing questions')

        // Insert base questions
        console.log('📝 Inserting base questions...')
        await prisma.question.createMany({
            data: baseQuestions as any
        })
        console.log(`✅ Inserted ${baseQuestions.length} base questions`)

        // Generate and insert additional questions
        console.log('🔄 Generating additional questions...')
        const generatedQuestions = generateQuestions()
        console.log(`📝 Inserting ${generatedQuestions.length} generated questions...`)
        await prisma.question.createMany({
            data: generatedQuestions as any
        })
        console.log(`✅ Inserted ${generatedQuestions.length} generated questions`)

        // Verify total count
        const total = await prisma.question.count()
        console.log(`\n🎉 SUCCESS! Total questions in database: ${total}`)
        console.log(`\n📊 Breakdown:`)
        console.log(`   - Technical: ${await prisma.question.count({ where: { type: 'technical' } })}`)
        console.log(`   - Behavioral: ${await prisma.question.count({ where: { type: 'behavioral' } })}`)
        console.log(`   - System Design: ${await prisma.question.count({ where: { type: 'system-design' } })}`)
        console.log(`   - Coding: ${await prisma.question.count({ where: { type: 'coding' } })}`)

        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding questions:', error)
        process.exit(1)
    }
}

// Run the seeder
seedQuestions()
