'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CategorySelector from '@/components/project-builder/CategorySelector'
import LanguageSelector from '@/components/project-builder/LanguageSelector'
import ProjectSelector from '@/components/project-builder/ProjectSelector'
import CurriculumGenerator from '@/components/project-builder/CurriculumGenerator'
import ProjectDashboard from '@/components/project-builder/ProjectDashboard'
import ModuleInterface from '@/components/project-builder/ModuleInterface'
import ModuleComplete from '@/components/project-builder/ModuleComplete'
import ProjectComplete from '@/components/project-builder/ProjectComplete'

// The massive V2 schema type
export type CurriculumData = {
    projectTitle: string;
    language: string;
    stack: string;
    category: string;
    difficulty: string;
    estimatedTotalHours: number;
    description: string;
    learningOutcomes: string[];
    prerequisites: string[];
    fileStructure: Array<{ path: string, description: string }>;
    modules: Array<{
        moduleNumber: number;
        title: string;
        estimatedMinutes: number;
        conceptsCovered: string[];
        objectives: string[];
        lessonContent: string;
        realWorldAnalogy: string;
        steps: Array<{ stepNumber: number, title: string, instruction: string }>;
        starterCode: Array<{ filename: string, code: string, language: string }>;
        solutionCode: Array<{ filename: string, code: string, language: string }>;
        expectedOutput: string;
        hints: string[];
        miniChallenge: { title: string, description: string, bonusCode: string } | null;
    }>;
    finalProjectCode: Array<{ filename: string, code: string, language: string }>;
    runInstructions: {
        windows: string[];
        macLinux: string[];
        vscode: { extensions: string[], steps: string[], launchConfig: string };
    };
    readmeContent: string;
}

export default function ProjectBuilderPage() {
    const [step, setStep] = useState(1)

    // User selections
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedLanguage, setSelectedLanguage] = useState<any>(null)
    const [selectedProject, setSelectedProject] = useState<string>('')

    // AI Generated Data
    const [curriculum, setCurriculum] = useState<CurriculumData | null>(null)

    // Learning Progress State
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
    const [completedModules, setCompletedModules] = useState<number[]>([])

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category)
        setStep(2)
    }

    const handleLanguageSelect = (language: any) => {
        setSelectedLanguage(language)
        setStep(3)
    }

    const handleProjectSelect = (project: string) => {
        setSelectedProject(project)
        setStep(4) // Move to AI Generation
    }

    const handleCurriculumGenerated = (data: CurriculumData) => {
        setCurriculum(data)
        setStep(5) // Move to Project Dashboard (Roadmap)
    }

    const startModule = (index: number) => {
        setCurrentModuleIndex(index)
        setStep(6) // Move to Module Interface
    }

    const handleModuleComplete = () => {
        if (!completedModules.includes(currentModuleIndex)) {
            setCompletedModules([...completedModules, currentModuleIndex])
        }
        setStep(7) // Celebration screen
    }

    const advanceToNextModuleOrFinish = () => {
        if (!curriculum) return
        if (currentModuleIndex < curriculum.modules.length - 1) {
            setCurrentModuleIndex(currentModuleIndex + 1)
            setStep(6) // Next Module
        } else {
            setStep(8) // Project Complete
        }
    }

    const restartBuilder = () => {
        setStep(1)
        setSelectedCategory('')
        setSelectedLanguage(null)
        setSelectedProject('')
        setCurriculum(null)
        setCurrentModuleIndex(0)
        setCompletedModules([])
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-6 md:p-12 font-sans relative">
            <div className="absolute top-0 right-0 p-8 w-[40rem] h-[40rem] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-8 w-[40rem] h-[40rem] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full">
                            <CategorySelector onSelect={handleCategorySelect} />
                        </motion.div>
                    )}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full">
                            <LanguageSelector category={selectedCategory} onSelect={handleLanguageSelect} onBack={() => setStep(1)} />
                        </motion.div>
                    )}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full">
                            <ProjectSelector category={selectedCategory} language={selectedLanguage} onSelect={handleProjectSelect} onBack={() => setStep(2)} />
                        </motion.div>
                    )}
                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full">
                            <CurriculumGenerator
                                category={selectedCategory}
                                language={selectedLanguage.name}
                                projectIdea={selectedProject}
                                onGenerated={handleCurriculumGenerated}
                                onBack={() => setStep(3)}
                            />
                        </motion.div>
                    )}
                    {step === 5 && curriculum && (
                        <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl">
                            <ProjectDashboard
                                curriculum={curriculum}
                                completedModules={completedModules}
                                onStartModule={startModule}
                            />
                        </motion.div>
                    )}
                    {step === 6 && curriculum && (
                        <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[100rem]">
                            <ModuleInterface
                                curriculum={curriculum}
                                currentModuleIndex={currentModuleIndex}
                                onCompleteModule={handleModuleComplete}
                                onBackToDashboard={() => setStep(5)}
                            />
                        </motion.div>
                    )}
                    {step === 7 && curriculum && (
                        <motion.div key="step7" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                            <ModuleComplete
                                module={curriculum.modules[currentModuleIndex]}
                                isLast={currentModuleIndex === curriculum.modules.length - 1}
                                onContinue={advanceToNextModuleOrFinish}
                                onBackToDashboard={() => setStep(5)}
                            />
                        </motion.div>
                    )}
                    {step === 8 && curriculum && (
                        <motion.div key="step8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                            <ProjectComplete
                                curriculum={curriculum}
                                onRestart={restartBuilder}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
