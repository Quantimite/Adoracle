'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sparkles, ArrowRight, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 900));
    if (email && password) {
      router.push('/dashboard');
    } else {
      setError('Please enter your email and password.');
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient flex-col justify-between p-14 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-300 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
              <path d="M20 7L8 33H15L17.8 26.5H25.2L28 33H35L23 7H20Z" fill="white" fillRule="evenodd" clipRule="evenodd"/>
              <path d="M19 21.5L21.5 15.5L24 21.5H19Z" fill="rgba(0,0,0,0.3)"/>
              <circle cx="34" cy="6" r="4" fill="#38BDF8"/>
              <path d="M34 3.5L34.8 6L37.5 6L35.4 7.5L36.2 10L34 8.5L31.8 10L32.6 7.5L30.5 6L33.2 6L34 3.5Z" fill="white"/>
            </svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Adoracle</span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white leading-tight">
              Smarter ads.<br />
              <span className="text-sky-300">Zero guesswork.</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-sm">
              Manage Meta, TikTok, Google, and LinkedIn campaigns from one beautiful dashboard.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              'AI-powered 70/30 budget allocation',
              'Live cross-platform performance tracking',
              'Pre-launch safety guard for broken links',
              'Plain language mode — no jargon',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-sky-400/20 border border-sky-400/40 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" />
                </div>
                <span className="text-slate-200 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { number: '94.2%', label: 'AI Accuracy' },
            { number: '5×', label: 'Avg. ROAS' },
            { number: '$0', label: 'Wasted Spend' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-white">{stat.number}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Adoracle</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm">
              Sign in to your workspace
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-400 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 block">
                  Password
                </label>
                <button type="button" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-lg shadow-sky-200 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-slate-400">or</span>
            </div>
          </div>

          {/* Demo button */}
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Explore with demo account</span>
          </button>

          {/* Sign up */}
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/login" className="text-sky-600 font-semibold hover:text-sky-700">
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

