import 'dotenv/config'
import prisma from '../prisma'
import { v4 as uuidv4 } from 'uuid'

const problems = [
    {
        slug: "two-sum",
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy",
        category: "Arrays",
        tags: ["Array", "Hash Table"],
        companies: ["Google", "Amazon", "Apple", "Meta", "Microsoft"],
        starterCode: {
            javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
            python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        "
        },
        testCases: [
            { input: { nums: [2, 7, 11, 15], target: 9 }, output: [0, 1] },
            { input: { nums: [3, 2, 4], target: 6 }, output: [1, 2] },
            { input: { nums: [3, 3], target: 6 }, output: [0, 1] }
        ],
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            }
        ],
        stats: { accepted: 12500, submissions: 25000, acceptanceRate: 50 },
        isGenerated: false
    },
    {
        slug: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string `s`, find the length of the longest substring without repeating characters.",
        difficulty: "Medium",
        category: "Sliding Window",
        tags: ["String", "Sliding Window", "Hash Table"],
        companies: ["Amazon", "Google", "Microsoft", "Meta"],
        starterCode: {
            javascript: "/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};",
            python: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        "
        },
        testCases: [
            { input: "abcabcbb", output: 3 },
            { input: "bbbbb", output: 1 },
            { input: "pwwkew", output: 3 }
        ],
        constraints: [
            "0 <= s.length <= 5 * 10^4",
            "s consists of English letters, digits, symbols and spaces."
        ],
        examples: [
            {
                input: "s = 'abcabcbb'",
                output: "3",
                explanation: "The answer is 'abc', with the length of 3."
            }
        ],
        stats: { accepted: 8500, submissions: 17000, acceptanceRate: 50 },
        isGenerated: false
    },
    {
        slug: "merge-k-sorted-lists",
        title: "Merge k Sorted Lists",
        description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
        difficulty: "Hard",
        category: "Linked Lists",
        tags: ["Linked List", "Divide and Conquer", "Heap (Priority Queue)", "Merge Sort"],
        companies: ["Amazon", "Bloomberg", "Meta", "Google"],
        starterCode: {
            javascript: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode[]} lists\n * @return {ListNode}\n */\nvar mergeKLists = function(lists) {\n    \n};",
            python: "class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        "
        },
        testCases: [
            { input: [[1, 4, 5], [1, 3, 4], [2, 6]], output: [1, 1, 2, 3, 4, 4, 5, 6] },
            { input: [], output: [] },
            { input: [[]], output: [] }
        ],
        constraints: [
            "k == lists.length",
            "0 <= k <= 10^4",
            "0 <= lists[i].length <= 500",
            "-10^4 <= lists[i][j] <= 10^4",
            "lists[i] is sorted in ascending order.",
            "The sum of lists[i].length will not exceed 10^4."
        ],
        examples: [
            { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }
        ],
        stats: { accepted: 4200, submissions: 10000, acceptanceRate: 42 },
        isGenerated: false
    }
]

async function seedProblems() {
    try {
        console.log('🗑️  Clearing existing problems...')
        await prisma.problem.deleteMany({})
        console.log('✅ Cleared existing problems')

        console.log('📝 Inserting coding problems...')
        for (const problem of problems) {
            await prisma.problem.create({
                data: problem as any
            })
            console.log(`✅ Inserted: ${problem.title}`)
        }

        const total = await prisma.problem.count()
        console.log(`\n🎉 SUCCESS! Total problems in database: ${total}`)
        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding problems:', error)
        process.exit(1)
    }
}

seedProblems()
