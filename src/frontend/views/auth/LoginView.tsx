// src/app/login/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  User,
} from 'lucide-react';
import { AdoracleLogo } from '@/frontend/components/common/AdoracleLogo';

const AUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    'This email already has an account. Sign in with your email and password, or try Google again.',
  AccessDenied: 'Access was denied. Please try again.',
  Configuration: 'Sign-in is not configured on the server yet (missing Google keys or AUTH_SECRET).',
  CredentialsSignin: 'Invalid email or password.',
  Verification: 'That sign-in link is no longer valid.',
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authErrorParam = searchParams.get('error');

  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(
    authErrorParam ? AUTH_ERRORS[authErrorParam] || 'Authentication failed. Please try again.' : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (isRegister) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('The two passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          setError(regData.error || 'Could not create account.');
          setIsLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          isRegister
            ? 'Account created, but automatic sign-in failed. Please sign in.'
            : 'Invalid email or password. If you created your account with Google, use "Continue with Google".'
        );
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Unable to reach authentication server.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError('');
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#EEF5FF] text-[#0B1A3A] selection:bg-[#2A6FE0] selection:text-white">
      {/* LEFT BRAND PANEL */}
      <div className="relative lg:w-[52%] bg-gradient-to-br from-[#0C1018] via-[#12182A] to-[#091813] text-white p-6 sm:p-10 lg:px-14 lg:py-10 flex flex-col justify-between overflow-hidden">
        <div
          className="pointer-events-none absolute -top-28 -left-28 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #36BAFC 0%, rgba(54,186,252,0) 70%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #36BAFC 1px, transparent 1px), linear-gradient(to bottom, #36BAFC 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-block focus:outline-none">
            <AdoracleLogo variant="dark" size="md" />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-blue-500/15 border border-sky-400/25 text-sky-300">
            <Sparkles size={15} /> Live Ad API Engine
          </span>
        </div>

        <div className="relative z-10 my-8 lg:my-0 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight leading-[1.12] mb-4">
            Smarter ads.{' '}
            <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-sky-200 bg-clip-text text-transparent">
              Zero guesswork.
            </span>
          </h1>
          <p className="text-blue-100/85 text-base sm:text-lg leading-relaxed mb-7">
            Connect your real Meta, TikTok, Google, and LinkedIn ad accounts in one unified command center—protected by live 404 link monitoring.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { icon: Zap, text: 'Real-time multi-channel OAuth sync' },
              { icon: TrendingUp, text: 'Unified ROAS & CPA telemetry' },
              { icon: ShieldCheck, text: 'Live pre-launch 404 URL scanner' },
              { icon: CheckCircle2, text: 'AES-256 encrypted token vault' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-950/55 border border-blue-500/25 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-sky-300 flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-semibold text-blue-50">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 p-5 rounded-2xl bg-blue-950/55 border border-blue-500/25 backdrop-blur-md text-sm text-blue-200/85">
          Direct Graph API v26.0, Google Ads, TikTok Business & LinkedIn Marketing integrations.
        </div>
      </div>

      {/* RIGHT AUTH PANEL */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:px-12 lg:py-6 bg-[#EEF5FF]">
        <div className="w-full max-w-md">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#BBD9FF] shadow-xl shadow-blue-950/5">
            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1A3A]">
                {isRegister ? 'Create your workspace' : 'Welcome back'}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                {isRegister
                  ? 'Register to link your ad accounts and start tracking.'
                  : 'Sign in to access your connected ad accounts.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#BBD9FF] text-[#0B1A3A] font-semibold text-sm sm:text-base hover:bg-[#EEF5FF] hover:border-[#2A6FE0] transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{googleLoading ? 'Redirecting to Google...' : isRegister ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#BBD9FF]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-500 font-bold">
                  or continue with email
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900/80 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700/70" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#EEF5FF] border border-[#BBD9FF] text-sm sm:text-base text-[#0B1A3A] focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900/80 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#EEF5FF] border border-[#BBD9FF] text-sm sm:text-base text-[#0B1A3A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#EEF5FF] border border-[#BBD9FF] text-sm sm:text-base text-[#0B1A3A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0B1A3A] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900/80 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700/70" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#EEF5FF] border border-[#BBD9FF] text-sm sm:text-base text-[#0B1A3A] focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || googleLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl green-cta-gradient text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition-all disabled:opacity-60 cursor-pointer"
              >
                <span>
                  {isLoading
                    ? 'Authenticating...'
                    : isRegister
                      ? 'Create Workspace Account'
                      : 'Sign in to Workspace'}
                </span>
                <ArrowRight size={17} />
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-600 mt-4">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setConfirmPassword('');
                setError('');
              }}
              className="font-bold text-[#2A6FE0] hover:underline cursor-pointer"
            >
              {isRegister ? 'Sign in here' : 'Create a free account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#EEF5FF] text-[#2A6FE0] font-semibold">
          Loading Adoracle workspace login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}