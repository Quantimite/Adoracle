'use client';

import React from 'react';
import { Sun, Moon, Sparkles, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';
import { useMode } from '@/components/shared/ModeContext';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const modeContext = useMode() as any;
    const isExpertMode = Boolean(
        modeContext?.isExpert ?? modeContext?.expertMode ?? modeContext?.mode === 'expert'
    );
    const handleToggleMode =
        modeContext?.toggleMode ?? (() => modeContext?.setExpertMode?.(!isExpertMode));

    return (
        <div className="max-w-3xl space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Workspace Preferences
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Customize your visual comfort and how Adoracle presents campaign insights.
                </p>
            </div>

            {/* Appearance Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Interface Theme
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Choose between soft warm daylight or comfortable low-glare dark mode.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 ${theme === 'light'
                                ? 'border-deepSky bg-skyPulse/10 ring-2 ring-skyPulse/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Sun size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Daylight Mode
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Soft alabaster canvas for daytime clarity
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 ${theme === 'dark'
                                ? 'border-skyPulse bg-skyPulse/10 ring-2 ring-skyPulse/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-700'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-skyPulse flex items-center justify-center">
                            <Moon size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Slate Dark Mode
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Low-glare nocturnal palette for night work
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Language Complexity Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-skyPulse/15 text-deepSky dark:text-skyPulse flex items-center justify-center shrink-0">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Plain Language Mode
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Translates technical ad jargon (CPA, ROAS, CAPI) into clear business terms.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleToggleMode}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-skyPulse hover:text-slate-950 transition-all shrink-0"
                >
                    {isExpertMode ? 'Switch to Simple View' : 'Simple View Active ✓'}
                </button>
            </div>

            {/* Safety Guard Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Automated Link &amp; Pixel Guard
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Automatically pauses ad sets if a landing page returns a 404 or tracking drops.
                    </p>
                </div>
            </div>
        </div>
    );
}