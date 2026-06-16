"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

export default function NewRoomPage() {
    const router = useRouter()

    useEffect(() => {
        const roomId = uuidv4()
        router.push(`/dashboard/collaboration/${roomId}`)
    }, [router])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 dark:text-zinc-400">Creating your secure room...</p>
            </div>
        </div>
    )
}
