"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import axios from "axios"
import { Lock, Download, Trash2, Loader2, AlertTriangle, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrivacyPanel({ user }: { user: any }) {
    const router = useRouter()
    const [downloading, setDownloading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deletePassword, setDeletePassword] = useState("")

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/download`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    responseType: 'blob'
                }
            )

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `my_data.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 100);

            toast.success("Data downloaded")
        } catch (err) {
            console.error("Error downloading data:", err)
            toast.error("Failed to download data")
        } finally {
            setDownloading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!deletePassword) return
        setDeleting(true)
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/account`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    data: { password: deletePassword }
                }
            )
            toast.success("Account deleted")
            localStorage.clear()
            router.push("/")
        } catch (err: any) {
            console.error("Error deleting account:", err)
            toast.error(err.response?.data?.message || "Failed to delete account")
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-12 max-w-3xl">
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Download your data</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Get a copy of your personal information, interview history, and performance metrics.</p>
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Personal data archive</p>
                            <p className="text-xs text-slate-500 mt-1">Includes profile info and all interview logs.</p>
                        </div>
                    </div>
                    <Button onClick={handleDownload} disabled={downloading} variant="outline" className="h-10 rounded-lg font-medium text-xs">
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                        Download archive
                    </Button>
                </div>
            </section>

            <section className="pt-12 border-t border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Delete account</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Permanently delete your account and all associated data. This action is irreversible.</p>
                
                <div className="p-6 rounded-2xl border border-rose-100 dark:border-rose-500/20 bg-rose-50/30 dark:bg-rose-500/5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-rose-900 dark:text-rose-100">Delete my account</p>
                        <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">All data will be permanently removed from our servers.</p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="h-10 px-6 rounded-lg font-medium text-xs">
                                Delete account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md rounded-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account and remove all data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4 space-y-2">
                                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Confirm with password</label>
                                <Input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="h-11 rounded-lg"
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg h-11">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    disabled={!deletePassword || deleting}
                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-11"
                                >
                                    {deleting ? "Deleting..." : "Delete account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </section>
        </div>
    )
}
