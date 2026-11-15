// src/app/(app)/settings/page.tsx
'use client';

import React, { useState } from 'react';
import {
    Sun,
    Moon,
    Sparkles,
    ShieldCheck,
    User,
    Lock,
    Sliders,
    Link2,
    Users,
    CreditCard,
    Bell,
    Search,
    Copy,
    RefreshCw,
    Key,
    Smartphone,
    Download,
    Trash2,
    Plus,
    CheckCircle2,
    Eye,
    EyeOff,
    Building2,
    FileText,
} from 'lucide-react';

type SettingsSection =
    | 'workspace'
    | 'profile'
    | 'account'
    | 'integrations'
    | 'payments'
    | 'notifications'
    | 'team';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Owner' | 'Media Buyer' | 'Analyst';
    status: 'Active' | 'Pending';
}

interface PaymentCard {
    id: string;
    brand: 'Visa' | 'Mastercard' | 'Amex';
    last4: string;
    expiry: string;
    holderName: string;
    isDefault: boolean;
}

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<SettingsSection>('payments');
    const [settingsSearch, setSettingsSearch] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    const notify = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    // 1. Workspace Preferences State
    const [themeMode, setThemeMode] = useState<'daylight' | 'dark'>('daylight');
    const [plainLanguageMode, setPlainLanguageMode] = useState(true);
    const [linkPixelGuard, setLinkPixelGuard] = useState(true);
    const [currency, setCurrency] = useState('USD ($)');
    const [attributionModel, setAttributionModel] = useState('Data-Driven Neural (7d Click / 1d View)');

    // 2. Profile Settings State
    const [fullName, setFullName] = useState('Dinuja Ransara');
    const [email, setEmail] = useState('demo@adoracle.ai');
    const [jobTitle, setJobTitle] = useState('Head of Growth & Performance');
    const [companyName, setCompanyName] = useState('Adoracle Labs');
    const [timezone, setTimezone] = useState('(GMT+05:30) Sri Jayawardenepura / Colombo');

    // 3. Account & Security State
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKey, setApiKey] = useState('ado_live_98f7a62c41e90b3d7721x9');

    // 4. Connected Ad Platforms State
    const [platforms, setPlatforms] = useState([
        { id: 'meta', name: 'Meta Ads Manager', accountId: 'act_492018492', connected: true, lastSync: '2 mins ago' },
        { id: 'google', name: 'Google Ads & GA4', accountId: '882-194-0021', connected: true, lastSync: '5 mins ago' },
        { id: 'tiktok', name: 'TikTok Business Center', accountId: 'tt_72910482', connected: true, lastSync: '11 mins ago' },
        { id: 'linkedin', name: 'LinkedIn Campaign Manager', accountId: 'li_5092817', connected: false, lastSync: 'Not linked' },
    ]);

    // 5. Payment Methods & Billing State
    const [cards, setCards] = useState<PaymentCard[]>([
        {
            id: 'card-1',
            brand: 'Visa',
            last4: '4242',
            expiry: '09/28',
            holderName: 'Dinuja Ransara',
            isDefault: true,
        },
        {
            id: 'card-2',
            brand: 'Mastercard',
            last4: '8819',
            expiry: '12/27',
            holderName: 'Adoracle Labs Corporate',
            isDefault: false,
        },
    ]);
    const [showAddCardForm, setShowAddCardForm] = useState(false);
    const [newCardBrand, setNewCardBrand] = useState<'Visa' | 'Mastercard' | 'Amex'>('Visa');
    const [newCardNumber, setNewCardNumber] = useState('');
    const [newCardExpiry, setNewCardExpiry] = useState('');
    const [newCardHolder, setNewCardHolder] = useState('Dinuja Ransara');
    const [billingEmail, setBillingEmail] = useState('billing@adoracle.ai');
    const [taxId, setTaxId] = useState('VAT-904821-LK');
    const [autoRechargeAdWallet, setAutoRechargeAdWallet] = useState(true);

    const invoices = [
        { id: 'INV-2026-11', date: 'Nov 01, 2026', plan: 'Adoracle Growth Pro', amount: '$149.00', status: 'Paid' },
        { id: 'INV-2026-10', date: 'Oct 01, 2026', plan: 'Adoracle Growth Pro', amount: '$149.00', status: 'Paid' },
        { id: 'INV-2026-09', date: 'Sep 01, 2026', plan: 'Adoracle Growth Pro', amount: '$149.00', status: 'Paid' },
    ];

    // 6. Notification Alerts State
    const [alerts, setAlerts] = useState({
        brokenLink404: true,
        roasDropAlert: true,
        dailyMorningBrief: true,
        budgetCapReached: true,
    });

    // 7. Team Members State
    const [inviteEmail, setInviteEmail] = useState('');
    const [team, setTeam] = useState<TeamMember[]>([
        { id: 't1', name: 'Dinuja Ransara', email: 'demo@adoracle.ai', role: 'Owner', status: 'Active' },
        { id: 't2', name: 'Sarah Jenkins', email: 'sarah@adoracle.ai', role: 'Media Buyer', status: 'Active' },
        { id: 't3', name: 'Alex Rivera', email: 'alex@adoracle.ai', role: 'Analyst', status: 'Pending' },
    ]);

    const handleThemeSwitch = (mode: 'daylight' | 'dark') => {
        setThemeMode(mode);
        if (typeof document !== 'undefined') {
            if (mode === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        notify(`Switched to ${mode === 'daylight' ? 'Daylight Mode' : 'Slate Dark Mode'}`);
    };

    const togglePlatform = (id: string) => {
        setPlatforms((prev) =>
            prev.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        connected: !p.connected,
                        lastSync: !p.connected ? 'Just now' : 'Disconnected',
                    }
                    : p
            )
        );
        notify('Ad platform connection updated');
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        const digitsOnly = newCardNumber.replace(/\D/g, '');
        if (digitsOnly.length < 4 || !newCardExpiry.trim()) {
            notify('Enter valid card digits and expiry (MM/YY)');
            return;
        }
        const last4 = digitsOnly.slice(-4);
        const created: PaymentCard = {
            id: `card-${Date.now()}`,
            brand: newCardBrand,
            last4,
            expiry: newCardExpiry,
            holderName: newCardHolder || fullName,
            isDefault: cards.length === 0,
        };
        setCards((prev) => [...prev, created]);
        setNewCardNumber('');
        setNewCardExpiry('');
        setShowAddCardForm(false);
        notify(`${newCardBrand} ending in ${last4} added`);
    };

    const setDefaultCard = (id: string) => {
        setCards((prev) =>
            prev.map((c) => ({ ...c, isDefault: c.id === id }))
        );
        notify('Default payment method updated');
    };

    const removeCard = (id: string) => {
        setCards((prev) => prev.filter((c) => c.id !== id));
        notify('Payment method removed');
    };

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setTeam((prev) => [
            ...prev,
            {
                id: `t-${Date.now()}`,
                name: inviteEmail.split('@')[0],
                email: inviteEmail,
                role: 'Media Buyer',
                status: 'Pending',
            },
        ]);
        setInviteEmail('');
        notify(`Invitation sent to ${inviteEmail}`);
    };

    const categories: { id: SettingsSection; label: string; desc: string; icon: React.ReactNode }[] = [
        {
            id: 'workspace',
            label: 'Workspace Preferences',
            desc: 'Theme, plain language & pixel guard',
            icon: <Sliders className="w-4 h-4" />,
        },
        {
            id: 'profile',
            label: 'Profile Settings',
            desc: 'Personal details, avatar & timezone',
            icon: <User className="w-4 h-4" />,
        },
        {
            id: 'payments',
            label: 'Payment Methods & Billing',
            desc: 'Saved cards, plan, tax ID & invoices',
            icon: <CreditCard className="w-4 h-4" />,
        },
        {
            id: 'account',
            label: 'Account & Security',
            desc: 'Password, 2FA, sessions & API keys',
            icon: <Lock className="w-4 h-4" />,
        },
        {
            id: 'integrations',
            label: 'Ad Platforms & Pixels',
            desc: 'Meta, Google, TikTok & CAPI sync',
            icon: <Link2 className="w-4 h-4" />,
        },
        {
            id: 'notifications',
            label: 'Alerts & Notifications',
            desc: 'CPA spikes, 404 alerts & briefings',
            icon: <Bell className="w-4 h-4" />,
        },
        {
            id: 'team',
            label: 'Team & Permissions',
            desc: 'Workspace seats & access roles',
            icon: <Users className="w-4 h-4" />,
        },
    ];

    // Deep Search across all setting items
    const searchableSettings = [
        { title: 'Payment Methods & Credit Cards', section: 'payments' as SettingsSection, detail: 'Add Visa/Mastercard, set default card, or remove cards' },
        { title: 'Billing Address, Tax ID & Invoices', section: 'payments' as SettingsSection, detail: 'Download monthly PDF receipts and manage Growth Pro plan' },
        { title: 'Auto-Recharge Ad Spend Wallet', section: 'payments' as SettingsSection, detail: 'Prevent campaign pauses when ad balance runs low' },
        { title: 'Interface Theme (Daylight / Slate Dark)', section: 'workspace' as SettingsSection, detail: 'Switch between soft alabaster canvas and dark mode' },
        { title: 'Plain Language Mode (Simple View)', section: 'workspace' as SettingsSection, detail: 'Translates CPA, ROAS, CAPI into clear business terms' },
        { title: 'Automated Link & Pixel Guard', section: 'workspace' as SettingsSection, detail: 'Auto-pauses ad sets if landing page returns 404' },
        { title: 'Profile Name, Email & Timezone', section: 'profile' as SettingsSection, detail: 'Update Dinuja Ransara, demo@adoracle.ai, and local timezone' },
        { title: 'Two-Factor Authentication (2FA) & Password', section: 'account' as SettingsSection, detail: 'Manage authenticator app and active browser sessions' },
        { title: 'Developer API Keys & Webhooks', section: 'account' as SettingsSection, detail: 'Copy or rotate live Adoracle REST API keys' },
        { title: 'Connected Ad Accounts (Meta, Google, TikTok)', section: 'integrations' as SettingsSection, detail: 'Manage OAuth connections and CAPI pixel sync' },
        { title: 'Team Members & Access Roles', section: 'team' as SettingsSection, detail: 'Invite media buyers and analysts to your workspace' },
    ];

    const deepSearchResults = settingsSearch.trim()
        ? searchableSettings.filter(
            (item) =>
                item.title.toLowerCase().includes(settingsSearch.toLowerCase()) ||
                item.detail.toLowerCase().includes(settingsSearch.toLowerCase())
        )
        : [];

    return (
        <div className="w-full space-y-6 text-slate-900 dark:text-slate-100 relative">
            {/* Floating Save Notification Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
                    {toast}
                </div>
            )}

            {/* Top Header & Deep Settings Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Settings & Workspace Preferences
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage your payment methods, profile, visual comfort, security, and ad integrations.
                    </p>
                </div>

                {/* Deep Search Box */}
                <div className="relative w-full lg:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={settingsSearch}
                        onChange={(e) => setSettingsSearch(e.target.value)}
                        placeholder="Deep search settings (e.g. payment, card, 2FA)..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />

                    {/* Instant Deep Search Dropdown */}
                    {settingsSearch.trim() !== '' && (
                        <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-40 space-y-1">
                            {deepSearchResults.length > 0 ? (
                                deepSearchResults.map((res, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setActiveSection(res.section);
                                            setSettingsSearch('');
                                        }}
                                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                            {res.title}
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {res.detail}
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 p-3 text-center">
                                    No matching settings found for &ldquo;{settingsSearch}&rdquo;
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Breakdown Navigation (4 Columns) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                    {categories.map((cat) => {
                        const isActive = activeSection === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveSection(cat.id)}
                                className={`w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all cursor-pointer ${isActive
                                    ? 'bg-emerald-50/90 dark:bg-emerald-500/10 border border-emerald-500/30 text-slate-900 dark:text-white'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-transparent'
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isActive
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                        }`}
                                >
                                    {cat.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                        {cat.label}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        {cat.desc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Right Detailed Settings Content (8 Columns) */}
                <div className="lg:col-span-8 space-y-5">
                    {/* ============================================================== */}
                    {/* SECTION: PAYMENT METHODS & BILLING                             */}
                    {/* ============================================================== */}
                    {activeSection === 'payments' && (
                        <div className="space-y-5">
                            {/* Saved Payment Methods Card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-[#169C69]" /> Payment Methods
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Manage cards used for your Adoracle subscription and automated ad spend funding.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowAddCardForm(!showAddCardForm)}
                                        className="px-4 py-2 rounded-xl bg-[#169C69] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Payment Method
                                    </button>
                                </div>

                                {/* Add New Card Drawer Form */}
                                {showAddCardForm && (
                                    <form
                                        onSubmit={handleAddCard}
                                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-emerald-500/30 space-y-3"
                                    >
                                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                            Add New Credit / Debit Card
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <select
                                                value={newCardBrand}
                                                onChange={(e) => setNewCardBrand(e.target.value as 'Visa' | 'Mastercard' | 'Amex')}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
                                            >
                                                <option value="Visa">Visa</option>
                                                <option value="Mastercard">Mastercard</option>
                                                <option value="Amex">American Express</option>
                                            </select>

                                            <input
                                                type="text"
                                                value={newCardNumber}
                                                onChange={(e) => setNewCardNumber(e.target.value)}
                                                placeholder="Card Number (e.g. 4532 •••• 9104)"
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                                            />

                                            <input
                                                type="text"
                                                value={newCardExpiry}
                                                onChange={(e) => setNewCardExpiry(e.target.value)}
                                                placeholder="Expiry (MM/YY)"
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                                            <input
                                                type="text"
                                                value={newCardHolder}
                                                onChange={(e) => setNewCardHolder(e.target.value)}
                                                placeholder="Cardholder Name"
                                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                                            />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddCardForm(false)}
                                                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
                                                >
                                                    Save Card
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {/* Saved Cards List */}
                                <div className="space-y-3">
                                    {cards.map((card) => (
                                        <div
                                            key={card.id}
                                            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${card.isDefault
                                                ? 'bg-[#F2F8F5] dark:bg-emerald-950/20 border-[#169C69]/40'
                                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200/70 dark:border-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-black tracking-wider">
                                                    {card.brand.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                            {card.brand} •••• {card.last4}
                                                        </p>
                                                        {card.isDefault && (
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#169C69] text-[10px] font-extrabold">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {card.holderName} • Expires {card.expiry}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!card.isDefault && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDefaultCard(card.id)}
                                                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 cursor-pointer"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeCard(card.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                                    title="Remove card"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Auto-Recharge Ad Wallet Toggle */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                            Auto-Recharge Ad Spend Guard Wallet
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            Automatically top up $500 using your default card if prepaid ad credits drop below $100.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAutoRechargeAdWallet(!autoRechargeAdWallet);
                                            notify(`Auto-recharge ${!autoRechargeAdWallet ? 'enabled' : 'disabled'}`);
                                        }}
                                        className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 cursor-pointer ${autoRechargeAdWallet ? 'bg-[#169C69]' : 'bg-slate-300 dark:bg-slate-700'
                                            }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-full bg-white transition-transform ${autoRechargeAdWallet ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Billing Details & Tax Registration */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Billing Contact & Tax Details
                                    </h3>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#169C69] text-[10px] font-extrabold">
                                        Growth Pro ($149/mo)
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Invoice Recipient Email
                                        </label>
                                        <input
                                            type="email"
                                            value={billingEmail}
                                            onChange={(e) => setBillingEmail(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            VAT / TIN / Tax ID
                                        </label>
                                        <input
                                            type="text"
                                            value={taxId}
                                            onChange={(e) => setTaxId(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => notify('Billing & tax details saved')}
                                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
                                    >
                                        Save Billing Details
                                    </button>
                                </div>
                            </div>

                            {/* Billing & Invoice History */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-500" /> Recent Invoices
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400">
                                                <th className="pb-2.5">Invoice</th>
                                                <th className="pb-2.5">Date</th>
                                                <th className="pb-2.5">Plan</th>
                                                <th className="pb-2.5">Amount</th>
                                                <th className="pb-2.5 text-right">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {invoices.map((inv) => (
                                                <tr key={inv.id}>
                                                    <td className="py-3 font-bold text-slate-900 dark:text-white">{inv.id}</td>
                                                    <td className="py-3 text-slate-500">{inv.date}</td>
                                                    <td className="py-3 text-slate-600 dark:text-slate-300">{inv.plan}</td>
                                                    <td className="py-3 font-extrabold text-slate-900 dark:text-white">{inv.amount}</td>
                                                    <td className="py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => notify(`Downloaded ${inv.id}.pdf`)}
                                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#169C69] hover:underline cursor-pointer"
                                                        >
                                                            <Download className="w-3 h-3" /> PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* SECTION: WORKSPACE PREFERENCES                                 */}
                    {/* ============================================================== */}
                    {activeSection === 'workspace' && (
                        <>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                        Interface Theme
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Choose between soft warm daylight or comfortable low-glare dark mode.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleThemeSwitch('daylight')}
                                        className={`flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${themeMode === 'daylight'
                                            ? 'bg-[#F2F8F5] dark:bg-emerald-950/30 border-[#169C69] ring-1 ring-[#169C69]/30'
                                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
                                            <Sun className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                Daylight Mode
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Soft alabaster canvas for daytime clarity
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleThemeSwitch('dark')}
                                        className={`flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${themeMode === 'dark'
                                            ? 'bg-[#F2F8F5] dark:bg-emerald-950/30 border-[#169C69] ring-1 ring-[#169C69]/30'
                                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-[#0F2421] text-emerald-400 flex items-center justify-center shrink-0">
                                            <Moon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                Slate Dark Mode
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Low-glare nocturnal palette for night work
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-[#169C69] flex items-center justify-center shrink-0">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            Plain Language Mode
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Translates technical ad jargon (CPA, ROAS, CAPI) into clear business terms.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPlainLanguageMode(!plainLanguageMode);
                                        notify(
                                            !plainLanguageMode
                                                ? 'Simple View enabled across workspace'
                                                : 'Switched to Pro Technical Metrics View'
                                        );
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all shrink-0 cursor-pointer ${plainLanguageMode
                                        ? 'bg-slate-50 dark:bg-emerald-500/10 border-slate-200 dark:border-emerald-500/30 text-slate-900 dark:text-emerald-300'
                                        : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500'
                                        }`}
                                >
                                    {plainLanguageMode ? 'Simple View Active ✓' : 'Enable Simple View'}
                                </button>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-[#169C69] flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            Automated Link & Pixel Guard
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Automatically pauses ad sets if a landing page returns a 404 or tracking drops.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLinkPixelGuard(!linkPixelGuard);
                                        notify(`Link & Pixel Guard ${!linkPixelGuard ? 'enabled' : 'paused'}`);
                                    }}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 cursor-pointer ${linkPixelGuard ? 'bg-[#169C69]' : 'bg-slate-300 dark:bg-slate-700'
                                        }`}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full bg-white transition-transform ${linkPixelGuard ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                    Reporting & Attribution Defaults
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Workspace Currency
                                        </label>
                                        <select
                                            value={currency}
                                            onChange={(e) => {
                                                setCurrency(e.target.value);
                                                notify(`Reporting currency updated to ${e.target.value}`);
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                        >
                                            <option>USD ($)</option>
                                            <option>EUR (€)</option>
                                            <option>GBP (£)</option>
                                            <option>LKR (Rs)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Default Attribution Window
                                        </label>
                                        <select
                                            value={attributionModel}
                                            onChange={(e) => {
                                                setAttributionModel(e.target.value);
                                                notify('Attribution window updated');
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                        >
                                            <option>Data-Driven Neural (7d Click / 1d View)</option>
                                            <option>Strict Last-Click (7d Click)</option>
                                            <option>Full-Funnel Multi-Touch (28d Click)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ============================================================== */}
                    {/* SECTION: PROFILE SETTINGS                                      */}
                    {/* ============================================================== */}
                    {activeSection === 'profile' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
                            <div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-black">
                                    DR
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                        {fullName}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {email} • {jobTitle}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => notify('Avatar badge refreshed')}
                                        className="mt-2 text-[11px] font-bold text-[#169C69] hover:underline cursor-pointer"
                                    >
                                        Update Profile Avatar
                                    </button>
                                </div>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    notify('Profile settings saved');
                                }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Work Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Role / Job Title
                                        </label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Organization / Workspace
                                        </label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Local Timezone
                                    </label>
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                                    >
                                        <option>(GMT+05:30) Sri Jayawardenepura / Colombo</option>
                                        <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                                        <option>(GMT+00:00) London / UTC</option>
                                        <option>(GMT+08:00) Singapore</option>
                                    </select>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl bg-[#169C69] hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Save Profile Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* SECTION: ACCOUNT & SECURITY                                    */}
                    {/* ============================================================== */}
                    {activeSection === 'account' && (
                        <div className="space-y-5">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-[#169C69] flex items-center justify-center shrink-0">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                                Two-Factor Authentication (2FA)
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Protect live ad spend controls with an authenticator app code.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTwoFactorEnabled(!twoFactorEnabled);
                                            notify(`2FA ${!twoFactorEnabled ? 'Enabled' : 'Disabled'}`);
                                        }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${twoFactorEnabled
                                            ? 'bg-emerald-500/10 text-[#169C69]'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                            }`}
                                    >
                                        {twoFactorEnabled ? 'Enabled ✓' : 'Enable 2FA'}
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">Account Password</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Last updated 24 days ago
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => notify('Password reset link sent to demo@adoracle.ai')}
                                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                                    >
                                        Send Password Reset Link
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Workspace API Key
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setApiKey(`ado_live_${Math.random().toString(36).substring(2, 16)}`);
                                            notify('New API key generated');
                                        }}
                                        className="text-xs font-bold text-purple-600 dark:text-purple-400 inline-flex items-center gap-1 hover:underline cursor-pointer"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Rotate Key
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={showApiKey ? apiKey : 'ado_live_••••••••••••••••••••'}
                                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-700 dark:text-slate-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                    >
                                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard?.writeText(apiKey);
                                            notify('API Key copied to clipboard');
                                        }}
                                        className="p-2.5 rounded-xl bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 cursor-pointer"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* SECTION: AD PLATFORMS & PIXELS                                 */}
                    {/* ============================================================== */}
                    {activeSection === 'integrations' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                    Connected Ad Platforms & Conversions API
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Manage live OAuth connections for automated bidding, spend caps, and pixel telemetry.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {platforms.map((plat) => (
                                    <div
                                        key={plat.id}
                                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`w-2 h-2 rounded-full ${plat.connected ? 'bg-[#169C69]' : 'bg-slate-400'
                                                        }`}
                                                />
                                                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                    {plat.name}
                                                </h3>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                                ID: <code className="font-mono">{plat.accountId}</code> • Last sync: {plat.lastSync}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => togglePlatform(plat.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${plat.connected
                                                ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                                                : 'bg-[#169C69] text-white hover:bg-emerald-700'
                                                }`}
                                        >
                                            {plat.connected ? 'Disconnect' : 'Connect Account'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* SECTION: ALERTS & NOTIFICATIONS                                */}
                    {/* ============================================================== */}
                    {activeSection === 'notifications' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                    Autonomous Alerts & Digest Preferences
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Choose which campaign anomalies trigger instant email or in-app notifications.
                                </p>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    {
                                        key: 'brokenLink404' as const,
                                        title: 'Broken Landing Page (404 / 500) Emergency Alert',
                                        desc: 'Instant alert when an active ad points to an unreachable page.',
                                    },
                                    {
                                        key: 'roasDropAlert' as const,
                                        title: 'ROAS Drop & CPA Spike Anomaly Detection',
                                        desc: 'Notify when campaign CPA rises > 25% above 7-day rolling baseline.',
                                    },
                                    {
                                        key: 'dailyMorningBrief' as const,
                                        title: 'Daily 8:00 AM AI Executive Briefing',
                                        desc: 'Morning summary of cross-channel spend, revenue, and AI optimizations.',
                                    },
                                    {
                                        key: 'budgetCapReached' as const,
                                        title: 'Monthly Spend Guardrail Thresholds',
                                        desc: 'Alerts at 75%, 90%, and 100% of allocated monthly budget.',
                                    },
                                ].map((item) => (
                                    <div key={item.key} className="py-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                {item.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                {item.desc}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAlerts((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                                                notify('Notification preference updated');
                                            }}
                                            className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 cursor-pointer ${alerts[item.key] ? 'bg-[#169C69]' : 'bg-slate-300 dark:bg-slate-700'
                                                }`}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-full bg-white transition-transform ${alerts[item.key] ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* SECTION: TEAM & PERMISSIONS                                    */}
                    {/* ============================================================== */}
                    {activeSection === 'team' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Workspace Team Members
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Invite media buyers or analysts to collaborate on campaigns.
                                </p>
                            </div>

                            <form onSubmit={handleInviteMember} className="flex items-center gap-2">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 rounded-xl bg-[#169C69] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Invite
                                </button>
                            </form>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {team.map((member) => (
                                    <div key={member.id} className="py-3 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                                                {member.role}
                                            </span>
                                            <span
                                                className={`text-[11px] font-bold ${member.status === 'Active' ? 'text-[#169C69]' : 'text-amber-500'
                                                    }`}
                                            >
                                                {member.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}