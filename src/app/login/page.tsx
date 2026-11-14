'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { AdoracleLogo } from '@/components/shared/AdoracleLogo';

const SAMPLE_CREDENTIALS = {
  email: 'demo@adoracle.ai',
  password: 'Adoracle2026!',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSampleFill = () => {
    setEmail(SAMPLE_CREDENTIALS.email);
    setPassword(SAMPLE_CREDENTIALS.password);
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password, or use the sample login below.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (
        (email.toLowerCase() === SAMPLE_CREDENTIALS.email &&
          password === SAMPLE_CREDENTIALS.password) ||
        password.length >= 6
      ) {
        router.push('/dashboard');
      } else {
        setIsLoading(false);
        setError('Invalid credentials. Click "Auto-Fill" to use the demo account.');
      }
    }, 650);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError('');
    setTimeout(() => {
      router.push('/dashboard');
    }, 700);
  };

  const handleDemoAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 450);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-frostWhite text-obsidianBlack selection:bg-skyPulse selection:text-obsidianBlack">
      {/* LEFT PANEL: Modern Artistic Brand & AI Showcase */}
      <div className="relative lg:w-[52%] bg-obsidianBlack text-pureWhite p-8 sm:p-10 lg:px-14 lg:py-10 flex flex-col justify-between overflow-hidden">
        {/* Artistic Ambient Glows & Subtle Grid Overlay */}
        <div
          className="pointer-events-none absolute -top-28 -left-28 w-[460px] h-[460px] rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #38BDF8 0%, rgba(2,132,199,0) 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-24 w-[520px] h-[520px] rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #0284C7 0%, rgba(15,23,42,0) 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Top Official Logo Lockup */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-block focus:outline-none">
            <AdoracleLogo variant="dark" size="md" />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pureWhite/5 border border-pureWhite/10 text-skyPulse">
            <Sparkles size={13} /> AI Ad Intelligence v1.0
          </span>
        </div>

        {/* Center Artistic Value Proposition + Feature Grid */}
        <div className="relative z-10 my-8 lg:my-0 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-[1.12] mb-4">
            Smarter ads.{' '}
            <span className="bg-gradient-to-r from-skyPulse via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Zero guesswork.
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Unify Meta, TikTok, Google, YouTube, and LinkedIn campaigns in one intelligent workspace—backed by automated waste protection.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Zap, text: 'AI-powered 70/30 budget allocation' },
              { icon: TrendingUp, text: 'Live cross-platform performance' },
              { icon: ShieldCheck, text: 'Pre-launch broken link safety guard' },
              { icon: CheckCircle2, text: 'Plain language mode — zero jargon' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-pureWhite/[0.04] border border-pureWhite/10 backdrop-blur-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-skyPulse/15 text-skyPulse flex items-center justify-center shrink-0">
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-slate-200">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Glassmorphic Live KPI Bar */}
        <div className="relative z-10 grid grid-cols-3 gap-4 p-4 rounded-2xl bg-pureWhite/[0.04] border border-pureWhite/10 backdrop-blur-md">
          <div>
            <div className="text-xl sm:text-2xl font-black text-pureWhite tracking-tight">
              94.2%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">AI CPA Accuracy</div>
          </div>
          <div className="border-x border-pureWhite/10 px-4">
            <div className="text-xl sm:text-2xl font-black text-skyPulse tracking-tight">
              5.0×
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Avg. Blended ROAS</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emeraldGreen tracking-tight">
              $0
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Wasted Link Spend</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Compact Zero-Scroll Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:px-12 lg:py-6 bg-frostWhite">
        <div className="w-full max-w-md">
          <div className="bg-pureWhite p-7 sm:p-8 rounded-3xl border border-cloudLine shadow-xl shadow-slate-200/60">
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold tracking-tight text-obsidianBlack">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slateGray mt-1">
                Sign in to your Adoracle workspace to manage active campaigns.
              </p>
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-pureWhite border border-cloudLine text-obsidianBlack font-semibold text-sm hover:bg-frostWhite hover:border-slate-300 transition-all shadow-sm disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cloudLine" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-pureWhite px-3 text-slateGray font-medium">
                  or sign in with email
                </span>
              </div>
            </div>

            {/* Sample Credentials Helper Box */}
            <div className="mb-4 p-3 rounded-xl bg-skyPulse/10 border border-skyPulse/25 flex items-center justify-between gap-2">
              <div className="text-xs">
                <span className="font-bold text-obsidianBlack block">Sample Login Ready</span>
                <span className="text-slateGray font-mono text-[11px]">
                  {SAMPLE_CREDENTIALS.email}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSampleFill}
                className="px-3 py-1 rounded-lg bg-deepSky text-pureWhite text-xs font-bold hover:bg-skyPulse hover:text-obsidianBlack transition-colors shrink-0"
              >
                Auto-Fill
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-crimsonRed/10 border border-crimsonRed/20 text-crimsonRed text-xs font-medium">
                {error}
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slateGray mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateGray"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-frostWhite border border-cloudLine text-sm text-obsidianBlack placeholder:text-slate-400 focus:bg-pureWhite focus:outline-none focus:border-skyPulse focus:ring-2 focus:ring-skyPulse/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slateGray">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleSampleFill}
                    className="text-xs font-semibold text-deepSky hover:text-skyPulse transition-colors"
                  >
                    Use demo password
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateGray"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-9 py-2 rounded-xl bg-frostWhite border border-cloudLine text-sm text-obsidianBlack placeholder:text-slate-400 focus:bg-pureWhite focus:outline-none focus:border-skyPulse focus:ring-2 focus:ring-skyPulse/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slateGray hover:text-obsidianBlack"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || googleLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-deepSky to-skyPulse text-pureWhite font-bold text-sm shadow-lg shadow-skyPulse/25 hover:brightness-105 transition-all disabled:opacity-60"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign in to Workspace'}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Instant One-Click Demo Button */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={isLoading || googleLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-frostWhite border border-cloudLine text-obsidianBlack font-semibold text-xs hover:border-skyPulse hover:bg-skyPulse/5 transition-all"
              >
                <Sparkles size={13} className="text-deepSky" />
                <span>Explore Instantly with Demo Account</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slateGray mt-4">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={handleDemoAccess}
              className="font-bold text-deepSky hover:underline"
            >
              Start 14-day free trial
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}