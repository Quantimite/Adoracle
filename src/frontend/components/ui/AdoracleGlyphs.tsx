'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function ConversionPulseGlyph({ className = 'w-6 h-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 28 28" fill="none" className={className}>
            <circle cx="14" cy="14" r="11" stroke="#38BDF8" strokeOpacity="0.2" strokeWidth="1.5" />
            <motion.circle
                cx="14"
                cy="14"
                r="7"
                stroke="#0284C7"
                strokeWidth="1.75"
                strokeDasharray="4 3"
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            />
            <circle cx="14" cy="14" r="3" fill="#38BDF8" />
        </svg>
    );
}

export function CpaTargetGlyph({ className = 'w-6 h-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 28 28" fill="none" className={className}>
            <path
                d="M5 19L10.5 13.5L14.5 17.5L23 9"
                stroke="#36BAFC"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M17.5 9H23V14.5"
                stroke="#36BAFC"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="10.5" cy="13.5" r="2" fill="#0F172A" stroke="#36BAFC" strokeWidth="1.5" />
            <circle cx="14.5" cy="17.5" r="2" fill="#0F172A" stroke="#36BAFC" strokeWidth="1.5" />
        </svg>
    );
}

export function VelocitySpendGlyph({ className = 'w-6 h-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 28 28" fill="none" className={className}>
            <rect x="5" y="15" width="3.5" height="8" rx="1.75" fill="#94A3B8" fillOpacity="0.45" />
            <rect x="10.5" y="11" width="3.5" height="12" rx="1.75" fill="#38BDF8" />
            <rect x="16" y="7" width="3.5" height="16" rx="1.75" fill="#0284C7" />
            <motion.rect
                x="21.5"
                y="4"
                width="3.5"
                height="19"
                rx="1.75"
                fill="#38BDF8"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
        </svg>
    );
}

export function RoasMultiplierGlyph({ className = 'w-6 h-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 28 28" fill="none" className={className}>
            <path
                d="M14 4L16.4 11.6L24 14L16.4 16.4L14 24L11.6 16.4L4 14L11.6 11.6L14 4Z"
                fill="url(#roasGrad)"
            />
            <defs>
                <linearGradient id="roasGrad" x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" />
                    <stop offset="1" stopColor="#0284C7" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export function PlatformMark({ platform }: { platform: 'META' | 'TIKTOK' | 'GOOGLE' | 'YOUTUBE' | 'LINKEDIN' }) {
    switch (platform) {
        case 'META':
            return (
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-black text-xs">
                    ∞
                </div>
            );
        case 'TIKTOK':
            return (
                <div className="w-7 h-7 rounded-lg bg-obsidianBlack text-pureWhite flex items-center justify-center font-black text-xs shadow-sm">
                    ♪
                </div>
            );
        case 'GOOGLE':
            return (
                <div className="w-7 h-7 rounded-lg bg-emeraldGreen/10 border border-emeraldGreen/20 flex items-center justify-center text-emeraldGreen font-black text-xs">
                    G
                </div>
            );
        case 'YOUTUBE':
            return (
                <div className="w-7 h-7 rounded-lg bg-crimsonRed/10 border border-crimsonRed/20 flex items-center justify-center text-crimsonRed font-black text-[10px]">
                    ▶
                </div>
            );
        case 'LINKEDIN':
            return (
                <div className="w-7 h-7 rounded-lg bg-skyPulse/15 border border-skyPulse/30 flex items-center justify-center text-deepSky font-black text-xs">
                    in
                </div>
            );
    }
}