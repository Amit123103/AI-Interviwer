"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Users, ArrowRight } from "lucide-react"

export default function JoinRoomPage() {
    const router = useRouter()
    const [roomId, setRoomId] = useState("")

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault()
        if (roomId.trim()) {
            router.push(`/dashboard/collaboration/${roomId}`)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-zinc-800 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">Join a Session</h1>
                    <p className="text-slate-500 dark:text-zinc-400 text-center mt-2">
                        Enter the Room ID shared by your peer to join the collaborative workspace.
                    </p>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Room ID
                        </label>
                        <Input
                            placeholder="e.g. 550e8400-e29b..."
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="bg-slate-50 dark:bg-black border-zinc-700 focus:border-indigo-500 h-12"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={!roomId.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white font-bold h-12"
                    >
                        Join Room
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Button
                        variant="link"
                        className="text-zinc-500 hover:text-slate-900 dark:text-white"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    )
}
