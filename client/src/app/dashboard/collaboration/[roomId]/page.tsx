"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import io, { Socket } from 'socket.io-client'
// import SimplePeer from 'simple-peer' // Import dynamically to avoid SSR issues
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import VideoGrid from '@/components/collaboration/VideoGrid'
import ChatPanel from '@/components/collaboration/ChatPanel'
import CollaborativeEditor from '@/components/collaboration/CollaborativeEditor'
import Whiteboard from '@/components/collaboration/Whiteboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PhoneOff, Mic, MicOff, Video, VideoOff, Copy, Share2 } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner is installed

// Dynamic import for SimplePeer
// const SimplePeer = dynamic(() => import('simple-peer'), { ssr: false })

export default function RoomPage() {
    const { roomId } = useParams()
    const router = useRouter()
    const [socket, setSocket] = useState<Socket | null>(null)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [peers, setPeers] = useState<{ userId: string, stream: MediaStream }[]>([])
    const [messages, setMessages] = useState<{ sender: string, text: string, timestamp: number, isSelf: boolean }[]>([])
    const [code, setCode] = useState("// Start coding here...")
    const [language, setLanguage] = useState("javascript")
    const [output, setOutput] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("code")

    const userVideoRef = useRef<HTMLVideoElement>(null)
    const peersRef = useRef<{ peerID: string, peer: any }[]>([])
    const socketRef = useRef<Socket | null>(null)

    // Helper to get SimplePeer
    const getSimplePeer = async () => {
        const SimplePeer = (await import('simple-peer')).default
        return SimplePeer
    }

    useEffect(() => {
        const init = async () => {
            const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
            socketRef.current = socketInstance
            setSocket(socketInstance)

            // Get User Media
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                setLocalStream(stream)
                if (userVideoRef.current) {
                    userVideoRef.current.srcObject = stream
                }

                const SimplePeer = await getSimplePeer()

                socketInstance.emit('join-room', roomId, socketInstance.id)

                socketInstance.on('user-connected', (userId) => {
                    console.log("User connected:", userId)
                    // Initiator
                    const peer = new SimplePeer({
                        initiator: true,
                        trickle: false,
                        stream: stream // Send local stream
                    })

                    peer.on('signal', (signal: any) => {
                        socketInstance.emit('offer', { target: userId, caller: socketInstance.id, sdp: signal })
                    })

                    peer.on('stream', (remoteStream: MediaStream) => {
                        setPeers(prev => [...prev, { userId, stream: remoteStream }])
                    })

                    peersRef.current.push({ peerID: userId, peer })
                })

                socketInstance.on('offer', (payload) => {
                    console.log("Received Offer from:", payload.caller)
                    const peer = new SimplePeer({
                        initiator: false,
                        trickle: false,
                        stream: stream
                    })

                    peer.on('signal', (signal: any) => {
                        socketInstance.emit('answer', { target: payload.caller, caller: socketInstance.id, sdp: signal })
                    })

                    peer.on('stream', (remoteStream: MediaStream) => {
                        setPeers(prev => [...prev, { userId: payload.caller, stream: remoteStream }])
                    })

                    peer.signal(payload.sdp)
                    peersRef.current.push({ peerID: payload.caller, peer })
                })

                socketInstance.on('answer', (payload) => {
                    console.log("Received Answer from:", payload.caller)
                    const item = peersRef.current.find(p => p.peerID === payload.caller)
                    if (item) {
                        item.peer.signal(payload.sdp)
                    }
                })

                socketInstance.on('ice-candidate', (payload) => {
                    // Handle ICE candidates if trickle is true (disabled for simplicity)
                })

                socketInstance.on('user-disconnected', (userId) => {
                    console.log("User disconnected:", userId)
                    const peerObj = peersRef.current.find(p => p.peerID === userId)
                    if (peerObj) {
                        peerObj.peer.destroy()
                    }
                    peersRef.current = peersRef.current.filter(p => p.peerID !== userId)
                    setPeers(prev => prev.filter(p => p.userId !== userId))
                })

                // Chat Logic
                socketInstance.on('chat-message', (message) => {
                    setMessages(prev => [...prev, { ...message, isSelf: false }])
                })

                // Code Logic
                socketInstance.on('code-update', (newCode) => {
                    setCode(newCode)
                })

            } catch (err) {
                console.error("Failed to access media devices:", err)
                toast.error("Failed to access camera/microphone")
            }
        }

        init()

        return () => {
            // Cleanup
            if (socketRef.current) socketRef.current.disconnect()
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop())
            }
        }
    }, [roomId])

    const handleSendMessage = (text: string) => {
        if (!socket) return
        const msg = { sender: 'Me', text, timestamp: Date.now() }
        setMessages(prev => [...prev, { ...msg, isSelf: true }])
        socket.emit('chat-message', roomId, msg)
    }

    const handleCodeChange = (newCode: string) => {
        setCode(newCode)
        if (socket) {
            socket.emit('code-change', roomId, newCode)
        }
    }

    const copyInviteLink = () => {
        navigator.clipboard.writeText(roomId as string)
        toast.success("Room ID copied to clipboard!")
    }

    const leaveRoom = () => {
        router.push('/dashboard')
    }

    return (
        <div className="h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col">
            {/* Header */}
            <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg">Collaboration Room</h1>
                    <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-slate-500 dark:text-zinc-400 font-mono">
                        {roomId}
                    </span>
                    <Button variant="ghost" size="icon" onClick={copyInviteLink} title="Copy ID">
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={leaveRoom}>
                        <PhoneOff className="w-4 h-4 mr-2" />
                        Leave
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Main Workspace */}
                <div className="flex-1 flex flex-col min-w-0 p-4 gap-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <TabsList className="bg-white dark:bg-zinc-900">
                                <TabsTrigger value="code">Code Editor</TabsTrigger>
                                <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="code" className="flex-1 mt-0 h-full">
                            <CollaborativeEditor
                                code={code}
                                language={language}
                                onChange={handleCodeChange}
                                onLanguageChange={setLanguage}
                                onRunCode={() => {
                                    // Local run simulation (server-side exec not hooked up for this MVP)
                                    setOutput("Running code...\n(Execution Server integration pending)")
                                }}
                                output={output}
                            />
                        </TabsContent>

                        <TabsContent value="whiteboard" className="flex-1 mt-0 h-full border border-zinc-800 rounded-xl overflow-hidden bg-white">
                            <Whiteboard roomId={roomId as string} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right: Sidebar (Video + Chat) */}
                <div className="w-80 border-l border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
                    {/* Video Grid Section */}
                    <div className="h-1/3 border-b border-zinc-800 p-2 overflow-y-auto">
                        <VideoGrid
                            localStream={localStream}
                            peers={peers}
                            isMuted={false}
                            isVideoOff={false}
                            onToggleMute={() => { }}
                            onToggleVideo={() => { }}
                        />
                    </div>

                    {/* Chat Section */}
                    <div className="flex-1 overflow-hidden">
                        <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
                    </div>
                </div>
            </div>
        </div>
    )
}
