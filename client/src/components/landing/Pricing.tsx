"use client"

import React from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const TIERS = [
    {
        name: "Basic",
        price: "Free",
        desc: "Perfect for getting started with AI interview prep.",
        features: [
            "1 AI Interview per month",
            "Basic Resume Analysis",
            "Standard Question Bank",
            "Text-only feedback",
        ],
        notIncluded: [
            "Video & Body Language Analysis",
            "Custom Interview Scenarios",
            "Detailed Performance Analytics",
            "Priority Support"
        ],
        buttonText: "Start Free",
        popular: false
    },
    {
        name: "Pro",
        price: "$29",
        period: "/mo",
        desc: "Everything you need to land your dream job.",
        features: [
            "Unlimited AI Interviews",
            "Advanced Resume Parsing",
            "FAANG Question Bank",
            "Real-time Voice & Video Analysis",
            "Detailed STAR Method Reports",
            "Custom Interview Scenarios"
        ],
        notIncluded: [
            "Priority Support"
        ],
        buttonText: "Get Pro",
        popular: true
    },
    {
        name: "Coaching",
        price: "$99",
        period: "/mo",
        desc: "Personalized guidance and priority support.",
        features: [
            "Everything in Pro",
            "Monthly 1-on-1 Strategy Call",
            "Priority Support (24/7)",
            "Mock Interviews with Senior Engineers",
            "Salary Negotiation Coaching"
        ],
        notIncluded: [],
        buttonText: "Contact Us",
        popular: false
    }
]

export default function Pricing() {
    return (
        <section id="pricing" className="w-full py-24 sm:py-32 relative px-4 sm:px-6 bg-zinc-50">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

            <div className="container mx-auto">
                 <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <p className="text-sm font-medium text-indigo-600">Pricing</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                        Simple, transparent{" "}
                        <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">pricing</span>
                    </h2>
                    <p className="text-zinc-500 max-w-2xl text-lg">
                        Choose the plan that best fits your interview preparation needs. No hidden fees.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {TIERS.map((tier, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative flex flex-col p-8 bg-white border rounded-2xl ${tier.popular ? 'border-indigo-500 shadow-xl shadow-indigo-100' : 'border-zinc-200 shadow-sm'}`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-full shadow-md">
                                    Most Popular
                                </div>
                            )}

                            <div className="space-y-4 mb-8">
                                <h3 className="text-xl font-bold text-zinc-900">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-zinc-900">{tier.price}</span>
                                    {tier.period && <span className="text-zinc-500 font-medium">{tier.period}</span>}
                                </div>
                                <p className="text-sm text-zinc-500 h-10">{tier.desc}</p>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                <ul className="space-y-3">
                                    {tier.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-3">
                                            <div className="mt-0.5 rounded-full bg-emerald-50 p-0.5 flex-shrink-0">
                                                <Check className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <span className="text-sm text-zinc-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                {tier.notIncluded.length > 0 && (
                                    <ul className="space-y-3 pt-4 border-t border-zinc-100">
                                        {tier.notIncluded.map((feature, j) => (
                                            <li key={j} className="flex items-start gap-3 opacity-50">
                                                <div className="mt-0.5 flex-shrink-0">
                                                    <X className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <span className="text-sm text-zinc-500">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <Link href="/auth/signup" className="mt-auto">
                                <Button 
                                    className={`w-full h-12 rounded-xl font-semibold transition-all ${
                                        tier.popular 
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20' 
                                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-0'
                                    }`}
                                >
                                    {tier.buttonText}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
