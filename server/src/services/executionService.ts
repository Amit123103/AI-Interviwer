import vm from 'vm';
import { executeCode as pistonExecute, PistonResult, isLanguageSupported, ErrorType } from './execution';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExecutionResult {
    passed: boolean;
    results: {
        passed: boolean;
        input: string;
        expected: string;
        actual: string;
        error?: string;
    }[];
    stats: {
        runtime: number; // ms
        memory: number;  // KB
    };
    error?: string;
    errorType?: ErrorType;
}

export interface ScriptResult {
    stdout: string;
    stderr: string;
    output: string;
    error?: string;
    errorType?: ErrorType;
    exitCode: number;
}

export interface MinimalProblem {
    id?: string;
    _id?: any;
    examples: any[];
    testCases: any[];
}

// ─── Execution Service ────────────────────────────────────────────────────────

export class ExecutionService {
    private logBuffer: string[] = [];

    // ─── Execute with Test Cases (for Coding Challenges) ──────────────────────
    async execute(code: string, language: string, problem: MinimalProblem): Promise<ExecutionResult> {
        try {
            if (language === 'javascript') {
                return await this.executeJavaScriptVM(code, problem);
            }

            // All other languages: use Piston API
            return await this.executePiston(code, language, problem);
        } catch (error: any) {
            return {
                passed: false,
                results: [],
                stats: { runtime: 0, memory: 0 },
                error: error.message,
                errorType: 'execution_error',
            };
        }
    }

    // ─── Run Script (Playground — no test cases, just output) ─────────────────
    async runScript(code: string, language: string, stdin: string = ''): Promise<ScriptResult> {
        try {
            if (language === 'javascript' && !stdin) {
                return this.runJavaScriptVM(code);
            }

            if (!isLanguageSupported(language)) {
                return {
                    stdout: '',
                    stderr: `Language "${language}" is not supported. Use: python, javascript, java, cpp, typescript, go, rust, csharp, etc.`,
                    output: '',
                    error: `Unsupported language: ${language}`,
                    errorType: 'execution_error',
                    exitCode: 1,
                };
            }

            const timeout = language === 'java' ? 15000 : 10000;
            const result = await pistonExecute(language, code, stdin, timeout);

            return {
                stdout: result.stdout,
                stderr: result.stderr,
                output: result.output,
                error: result.errorType ? (result.stderr || result.output || 'Execution failed') : undefined,
                errorType: result.errorType,
                exitCode: result.exitCode,
            };
        } catch (e: any) {
            return {
                stdout: '',
                stderr: e.message,
                output: '',
                error: e.message,
                errorType: 'execution_error',
                exitCode: 1,
            };
        }
    }

    // ─── Piston-based Test Case Execution ─────────────────────────────────────
    private async executePiston(code: string, language: string, problem: MinimalProblem): Promise<ExecutionResult> {
        const startTime = Date.now();
        const allTestCases = [...(problem.examples || []), ...(problem.testCases || [])];

        if (allTestCases.length === 0) {
            const result = await pistonExecute(language, code, '', 10000);
            return {
                passed: result.exitCode === 0 && !result.errorType,
                results: [],
                stats: { runtime: Date.now() - startTime, memory: 0 },
                error: result.errorType ? (result.stderr || 'Execution failed') : undefined,
                errorType: result.errorType,
            };
        }

        const firstResult = await pistonExecute(language, code, allTestCases[0].input, 10000);

        if (firstResult.errorType === 'compilation_error') {
            return {
                passed: false,
                results: allTestCases.map(tc => ({
                    passed: false,
                    input: tc.input,
                    expected: tc.output,
                    actual: 'Compilation Error',
                    error: firstResult.stderr,
                })),
                stats: { runtime: Date.now() - startTime, memory: 0 },
                error: firstResult.stderr || 'Compilation failed',
                errorType: 'compilation_error',
            };
        }

        const results: any[] = [];
        let allPassed = true;

        for (let i = 0; i < allTestCases.length; i++) {
            const tc = allTestCases[i];
            const pistonResult: PistonResult = i === 0
                ? firstResult
                : await pistonExecute(language, code, tc.input, 10000);

            const actual = pistonResult.stdout.trim();
            const expected = tc.output.trim();

            let passed = false;
            if (actual === expected) {
                passed = true;
            } else {
                try {
                    if (JSON.stringify(JSON.parse(actual)) === JSON.stringify(JSON.parse(expected))) {
                        passed = true;
                    }
                } catch { /* not JSON */ }
            }

            if (!passed) allPassed = false;

            let errorMsg: string | undefined;
            if (pistonResult.errorType === 'time_limit_exceeded') {
                errorMsg = 'Time Limit Exceeded';
            } else if (pistonResult.errorType === 'runtime_error') {
                errorMsg = pistonResult.stderr || 'Runtime Error';
            } else if (pistonResult.stderr && pistonResult.exitCode !== 0) {
                errorMsg = pistonResult.stderr;
            }

            results.push({
                passed,
                input: tc.input,
                expected: tc.output,
                actual: pistonResult.errorType ? (errorMsg || 'Error') : actual,
                error: errorMsg,
            });
        }

        return {
            passed: allPassed,
            results,
            stats: {
                runtime: Date.now() - startTime,
                memory: 0,
            },
            errorType: allPassed ? undefined : ((results.find((r: any) => r.error)?.error?.includes('Time Limit') ? 'time_limit_exceeded' : undefined) as ErrorType | undefined),
        };
    }

    // ─── JavaScript VM Execution (Local, Fast) ────────────────────────────────
    private runJavaScriptVM(code: string): ScriptResult {
        this.logBuffer = [];
        const sandbox = {
            console: {
                log: (...args: any[]) => {
                    this.logBuffer.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                },
                error: (...args: any[]) => {
                    this.logBuffer.push('[Error] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                },
                warn: (...args: any[]) => {
                    this.logBuffer.push('[Warn] ' + args.map(a => String(a)).join(' '));
                },
            },
            setTimeout: () => { },
            setInterval: () => { },
            Math, Date, JSON,
            Array, Object, String, Number, Boolean, Map, Set,
            parseInt, parseFloat, isNaN, isFinite,
        };

        const context = vm.createContext(sandbox);

        try {
            const result = vm.runInContext(code, context, { timeout: 5000 });
            let output = this.logBuffer.join('\n');
            if (result !== undefined && this.logBuffer.length === 0) {
                output = typeof result === 'object' ? JSON.stringify(result) : String(result);
            } else if (result !== undefined) {
                output += '\n' + (typeof result === 'object' ? JSON.stringify(result) : String(result));
            }

            return {
                stdout: output,
                stderr: '',
                output,
                exitCode: 0,
            };
        } catch (e: any) {
            const output = this.logBuffer.join('\n');
            return {
                stdout: output,
                stderr: e.message,
                output: output + (output ? '\n' : '') + e.message,
                error: e.message,
                errorType: e.message.includes('Script execution timed out') ? 'time_limit_exceeded' : 'runtime_error',
                exitCode: 1,
            };
        }
    }

    // ─── JavaScript VM Test Case Judging ──────────────────────────────────────
    private async executeJavaScriptVM(code: string, problem: MinimalProblem): Promise<ExecutionResult> {
        const startTime = process.hrtime();
        const results: any[] = [];
        let allPassed = true;

        const allTestCases = [...(problem.examples || []), ...(problem.testCases || [])];

        for (const testCase of allTestCases) {
            this.logBuffer = [];
            const sandbox = {
                input: testCase.input,
                result: undefined as any,
                console: {
                    log: (...args: any[]) => {
                        this.logBuffer.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                    },
                    error: () => { },
                },
                Math, JSON, Array, Object, String, Number, Boolean, Map, Set,
                parseInt, parseFloat, isNaN, isFinite,
            };

            const context = vm.createContext(sandbox);

            try {
                try { vm.runInContext(testCase.input, context, { timeout: 1000 }); } catch { /* input may not be executable JS */ }
                const output = vm.runInContext(code, context, { timeout: 5000 });

                let actual = 'undefined';
                if (this.logBuffer.length > 0) {
                    actual = this.logBuffer[this.logBuffer.length - 1];
                } else if (output !== undefined) {
                    actual = typeof output === 'object' ? JSON.stringify(output) : String(output);
                } else if (context.result !== undefined) {
                    actual = typeof context.result === 'object' ? JSON.stringify(context.result) : String(context.result);
                }

                const expected = (testCase.output || '').trim();
                let passed = false;

                if (actual.trim() === expected) {
                    passed = true;
                } else {
                    try {
                        if (JSON.stringify(JSON.parse(actual)) === JSON.stringify(JSON.parse(expected))) {
                            passed = true;
                        }
                    } catch { /* not JSON */ }
                }

                if (!passed) allPassed = false;

                results.push({
                    passed,
                    input: testCase.input,
                    expected: testCase.output,
                    actual: actual.trim(),
                    error: undefined,
                });
            } catch (e: any) {
                allPassed = false;
                const errorType = e.message.includes('Script execution timed out') ? 'Time Limit Exceeded' : e.message;
                results.push({
                    passed: false,
                    input: testCase.input,
                    expected: testCase.output,
                    actual: 'Error',
                    error: errorType,
                });
            }
        }

        const endTime = process.hrtime(startTime);
        const runtime = (endTime[0] * 1000) + (endTime[1] / 1000000);

        return {
            passed: allPassed,
            results,
            stats: {
                runtime: Math.round(runtime),
                memory: Math.round(process.memoryUsage().heapUsed / 1024),
            },
        };
    }
}

export const executionService = new ExecutionService();
export { executeCode as pistonExecute } from './execution';
