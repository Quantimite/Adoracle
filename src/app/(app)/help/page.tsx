// src/app/(app)/help/page.tsx
'use client';

import React, { useState } from 'react';
import {
    Search,
    BookOpen,
    Sparkles,
    ShieldCheck,
    CreditCard,
    ChevronDown,
    MessageSquare,
    CheckCircle2,
    PlayCircle,
    ExternalLink,
    LifeBuoy,
    Zap,
    Send,
    FileText,
    X,
} from 'lucide-react';

interface GuideArticle {
    id: string;
    title: string;
    category: 'Getting Started' | 'AI Intelligence' | 'SEO & Safety' | 'Billing & Accounts';
    readTime: string;
    summary: string;
    steps: string[];
}

interface FaqItem {
    question: string;
    answer: string;
    category: string;
}

const guideArticles: GuideArticle[] = [
    {
        id: 'g1',
        title: 'Connecting Meta, Google & TikTok Ad Accounts in 3 Minutes',
        category: 'Getting Started',
        readTime: '3 min read',
        summary: 'Link your ad managers via read/write OAuth to enable unified ROAS tracking and automated spend guardrails.',
        steps: [
            'Navigate to Settings → Ad Platforms & Pixels in the left sidebar.',
            'Click "Connect Account" next to Meta Ads Manager, Google Ads, or TikTok Business.',
            'Select the ad accounts and Conversions API (CAPI) pixels you want Adoracle to monitor.',
            'Verify that the green status dot appears under Last Sync.',
        ],
    },
    {
        id: 'g2',
        title: 'Using the AI Strategy Co-Pilot & Autonomous Guard Agents',
        category: 'AI Intelligence',
        readTime: '4 min read',
        summary: 'Learn how Bid Sentinel, Fatigue Guard, and Budget Scaler protect your daily ad spend 24/7.',
        steps: [
            'Open AI Intelligence from the main menu to view live cross-channel attribution.',
            'Toggle on Bid Sentinel to automatically cap CPC spikes > 25% above your 7-day rolling average.',
            'Use the Strategy Co-Pilot prompt bar to ask natural-language questions like "Rebalance $1,000 for maximum ROAS."',
            'Click the green Execute button on any AI recommendation to push changes live.',
        ],
    },
    {
        id: 'g3',
        title: 'Pre-Launch 404 & Redirect Loop Protection',
        category: 'SEO & Safety',
        readTime: '2 min read',
        summary: 'Stop paying for ad clicks that land on broken checkout pages or slow mobile URLs.',
        steps: [
            'Open SEO & Safety before launching any new paid campaign.',
            'Inspect the top alert banner for any 404 errors or 301 redirect loops on destination URLs.',
            'Click "Auto-Fix Now" to apply safe 301 fallback redirects or pause affected ad sets automatically.',
            'Use the URL Audit bar at the top right to verify SSL, mobile LCP speed, and pixel firing on any page.',
        ],
    },
    {
        id: 'g4',
        title: 'Managing Payment Cards, Tax IDs & Auto-Recharge Wallets',
        category: 'Billing & Accounts',
        readTime: '2 min read',
        summary: 'Configure default billing cards, download monthly VAT invoices, and prevent ad wallet interruptions.',
        steps: [
            'Go to Settings → Payment Methods & Billing.',
            'Click "Add Payment Method" to store a Visa, Mastercard, or Amex card.',
            'Set your primary corporate card as Default and enter your VAT/TIN number under Billing Contact.',
            'Enable Auto-Recharge Ad Spend Guard Wallet so active campaigns never pause unexpectedly.',
        ],
    },
];

const faqList: FaqItem[] = [
    {
        question: 'What does Plain Language Mode (Simple View) do?',
        answer:
            'Plain Language Mode translates technical ad metrics like CPA, ROAS, CTR, and CAPI deduplication into clear, everyday business summaries so founders and stakeholders can understand campaign performance at a glance.',
        category: 'Workspace',
    },
    {
        question: 'How does Automated Link & Pixel Guard prevent wasted ad spend?',
        answer:
            'Adoracle pings your active ad destination URLs every 5 minutes. If a landing page or checkout route returns a 404/500 error or your tracking pixel stops firing, Adoracle immediately alerts you and pauses the affected ad set until resolved.',
        category: 'SEO & Safety',
    },
    {
        question: 'Can I undo an optimization executed by the AI Co-Pilot?',
        answer:
            'Yes. Every budget shift, bid cap, or creative rotation triggered through the AI Strategy Co-Pilot is logged with a one-click rollback option inside your Campaign Audit History for 30 days.',
        category: 'AI Intelligence',
    },
    {
        question: 'How is Adoracle’s multi-touch ROAS calculated?',
        answer:
            'Adoracle combines server-side Conversions API (CAPI) events with modeled 7-day click and 1-day view attribution windows across Meta, Google, TikTok, and LinkedIn to eliminate duplicate conversion counting.',
        category: 'Analytics',
    },
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const [activeGuide, setActiveGuide] = useState<GuideArticle | null>(null);

    // Support Ticket Form State
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketTopic, setTicketTopic] = useState('Campaign & Pixel Guard');
    const [ticketMessage, setTicketMessage] = useState('');
    const [ticketSubmitted, setTicketSubmitted] = useState(false);

    const categories = ['All', 'Getting Started', 'AI Intelligence', 'SEO & Safety', 'Billing & Accounts'];

    const filteredGuides = guideArticles.filter((guide) => {
        const matchesCat = selectedCategory === 'All' || guide.category === selectedCategory;
        const matchesSearch =
            guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.summary.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const filteredFaqs = faqList.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketSubject.trim() || !ticketMessage.trim()) return;
        setTicketSubmitted(true);
        setTicketSubject('');
        setTicketMessage('');
        setTimeout(() => setTicketSubmitted(false), 4500);
    };

    return (
        <div className="w-full space-y-6 text-slate-900 dark:text-slate-100 relative">
            {/* Guide Reader Modal */}
            {activeGuide && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#169C69] text-[10px] font-extrabold uppercase">
                                    {activeGuide.category} • {activeGuide.readTime}
                                </span>
                                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                                    {activeGuide.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveGuide(null)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {activeGuide.summary}
                        </p>

                        <div className="space-y-2.5 pt-2">
                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                Step-by-Step Instructions
                            </p>
                            {activeGuide.steps.map((step, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3 text-xs"
                                >
                                    <span className="w-5 h-5 rounded-full bg-[#169C69] text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    <span className="text-slate-800 dark:text-slate-200 leading-relaxed">{step}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setActiveGuide(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Search Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="max-w-2xl space-y-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#169C69]">
                        <LifeBuoy className="w-4 h-4" /> Adoracle Help & Documentation Center
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        How can we help you scale today?
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Search setup guides, AI Co-Pilot playbooks, pixel troubleshooting, or reach our growth engineering team.
                    </p>
                </div>

                {/* Search Input */}
                <div className="relative max-w-xl">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search guides, FAQs, 404 Pixel Guard, ROAS attribution..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#169C69]"
                    />
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${selectedCategory === cat
                                    ? 'bg-[#169C69] text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interactive Documentation Guides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredGuides.map((guide) => (
                    <div
                        key={guide.id}
                        onClick={() => setActiveGuide(guide)}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#169C69]/50 rounded-2xl p-5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#169C69] text-[10px] font-extrabold uppercase">
                                    {guide.category}
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">{guide.readTime}</span>
                            </div>
                            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#169C69] transition-colors">
                                {guide.title}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {guide.summary}
                            </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#169C69]">
                            <span className="inline-flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" /> Read Step-by-Step Guide
                            </span>
                            <span>→</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Split: FAQ Accordion (7 Cols) + System Status & Support Ticket (5 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* FAQ Accordion */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Quick answers about Adoracle automation, privacy, and campaign safety
                        </p>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredFaqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div key={index} className="py-3.5">
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
                                    >
                                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#169C69]' : ''
                                                }`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5 pr-4">
                                            {faq.answer}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Live System Status + Direct Support Ticket */}
                <div className="lg:col-span-5 space-y-5">
                    {/* Live Telemetry Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                                Live Platform Telemetry
                            </h3>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#169C69]">
                                <span className="w-2 h-2 rounded-full bg-[#169C69] animate-ping" /> 99.98% Uptime
                            </span>
                        </div>

                        <div className="space-y-2 text-xs">
                            {[
                                { service: 'Meta & Google Ads Sync Engine', status: 'Operational' },
                                { service: 'AI Strategy Co-Pilot (Neural RAG)', status: 'Operational' },
                                { service: '404 Link & CAPI Pixel Guard', status: 'Operational' },
                            ].map((item) => (
                                <div
                                    key={item.service}
                                    className="flex items-center justify-between py-1.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                                >
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.service}</span>
                                    <span className="font-bold text-[#169C69]">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Priority Support Form */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#169C69]" /> Message Priority Support
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Average response time under 15 minutes for Growth Pro workspaces.
                            </p>
                        </div>

                        {ticketSubmitted ? (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#169C69] shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-extrabold">Support Ticket #ADO-4918 Created</p>
                                    <p className="mt-0.5">
                                        Our growth engineering team has received your request and will reply to{' '}
                                        <strong>demo@adoracle.ai</strong> shortly.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleTicketSubmit} className="space-y-3">
                                <select
                                    value={ticketTopic}
                                    onChange={(e) => setTicketTopic(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                >
                                    <option>Campaign & Pixel Guard</option>
                                    <option>AI Co-Pilot & Attribution</option>
                                    <option>Ad Account Connection (Meta / Google / TikTok)</option>
                                    <option>Billing & Invoices</option>
                                </select>

                                <input
                                    type="text"
                                    value={ticketSubject}
                                    onChange={(e) => setTicketSubject(e.target.value)}
                                    placeholder="Subject (e.g., Help verifying Meta CAPI deduplication)"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs"
                                />

                                <textarea
                                    rows={3}
                                    value={ticketMessage}
                                    onChange={(e) => setTicketMessage(e.target.value)}
                                    placeholder="Describe your question or paste a campaign ID..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs resize-none"
                                />

                                <button
                                    type="submit"
                                    className="w-full py-2.5 rounded-xl bg-[#169C69] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Send className="w-3.5 h-3.5" /> Send Support Request
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}