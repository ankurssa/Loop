'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Layers,
  Zap,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states with default JumpCloud details as requested
  const [email, setEmail] = useState('anilkumar.mallemuri@jumpcloud.com');
  const [password, setPassword] = useState('As defined by me');
  const [displayName, setDisplayName] = useState('Anil Kumar M');
  const [avatarInitial, setAvatarInitial] = useState('AK');

  // Sync initials if display name changes
  useEffect(() => {
    if (activeTab === 'signup' && displayName.trim()) {
      const parts = displayName.trim().split(/\s+/);
      if (parts.length >= 2) {
        setAvatarInitial((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
      } else if (parts.length === 1 && parts[0].length >= 2) {
        setAvatarInitial(parts[0].substring(0, 2).toUpperCase());
      }
    }
  }, [displayName, activeTab]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const userObj = {
        displayName: displayName || 'Anil Kumar M',
        email: email || 'anilkumar.mallemuri@jumpcloud.com',
        avatar: avatarInitial || 'AK',
      };
      try {
        localStorage.setItem('loop-auth-user', JSON.stringify(userObj));
      } catch (err) {}

      setIsLoading(false);
      router.push('/board');
    }, 800);
  };

  const handleQuickJumpCloudLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const userObj = {
        displayName: 'Anil Kumar M',
        email: 'anilkumar.mallemuri@jumpcloud.com',
        avatar: 'AK',
      };
      try {
        localStorage.setItem('loop-auth-user', JSON.stringify(userObj));
      } catch (err) {}
      setIsLoading(false);
      router.push('/board');
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-sooty flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden select-none">
      {/* Background ambient glowing orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#7C5CFC]/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-4xl bg-dire-wolf border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] animate-fade-in">
        
        {/* Left Side: Brand & Value Prop (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sooty via-dire-wolf to-sooty p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.06] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                <span className="text-white font-extrabold text-lg tracking-tighter">L</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-sans">
                Loop<span className="text-accent">.</span>
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-3 pt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-wide uppercase">
                <Sparkles size={13} />
                <span>JumpCloud SSO Verified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Where Design & Engineering Align.
              </h1>
              <p className="text-xs sm:text-sm text-chestnut leading-relaxed font-medium">
                Unified feedback intelligence. Capture stakeholder notes, auto-translate technical chatter, and ship flawless product experiences.
              </p>
            </div>
          </div>

          {/* Feature Checklist */}
          <div className="relative z-10 space-y-3 pt-6 border-t border-white/[0.06] mt-8 lg:mt-0">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
              <CheckCircle2 size={16} className="text-status-nice shrink-0" />
              <span>Real-time Kanban resolution boards</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
              <CheckCircle2 size={16} className="text-status-nice shrink-0" />
              <span>AI Plain-English translation engine</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
              <CheckCircle2 size={16} className="text-status-nice shrink-0" />
              <span>Executive Slack & PDF Daily Digest</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative bg-dire-wolf/50">
          
          {/* Quick SSO Banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-[#4E9AF1]/15 to-[#7C5CFC]/15 border border-[#4E9AF1]/30 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#4E9AF1] flex items-center justify-center shrink-0 shadow-md shadow-[#4E9AF1]/30">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">JumpCloud Enterprise SSO</p>
                <p className="text-[10px] text-chestnut truncate">Ready for <span className="text-white font-semibold">Anil Kumar M</span></p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickJumpCloudLogin}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-xl bg-[#4E9AF1] hover:bg-[#3d82d4] text-white text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Zap size={13} className="fill-current" />
              <span>1-Click Sign In</span>
            </button>
          </div>

          {/* Tab Toggle */}
          <div className="grid grid-cols-2 p-1.5 bg-sooty rounded-2xl border border-white/[0.06] mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-accent text-white shadow-md shadow-accent/25'
                  : 'text-chestnut hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Lock size={14} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-accent text-white shadow-md shadow-accent/25'
                  : 'text-chestnut hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <User size={14} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Display Name */}
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="block text-xs font-bold text-white">Display Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chestnut pointer-events-none" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      placeholder="e.g. Anil Kumar M"
                      className="w-full bg-sooty border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all h-[42px]"
                    />
                  </div>
                </div>

                {/* Avatar Initial */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-white text-center">Initial</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={avatarInitial}
                    onChange={(e) => setAvatarInitial(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-sooty border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs font-extrabold text-accent text-center tracking-wider focus:border-accent focus:outline-none transition-all h-[42px]"
                  />
                </div>
              </div>
            )}

            {/* Username / Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white">
                {activeTab === 'signin' ? 'JumpCloud Username or Email' : 'Work Email Address'}
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chestnut pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@jumpcloud.com"
                  className="w-full bg-sooty border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all h-[42px]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-white">Password</label>
                {activeTab === 'signin' && (
                  <button type="button" className="text-[11px] font-semibold text-accent hover:underline cursor-pointer">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chestnut pointer-events-none" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-sooty border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all h-[42px]"
                />
              </div>
            </div>

            {/* Remember Me checkbox */}
            {activeTab === 'signin' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/[0.2] bg-sooty text-accent focus:ring-accent accent-accent cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs font-medium text-chestnut cursor-pointer select-none">
                  Remember this device for 30 days
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-extrabold text-xs transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{activeTab === 'signin' ? 'Authenticating...' : 'Creating Workspace...'}</span>
                  </>
                ) : (
                  <>
                    <span>{activeTab === 'signin' ? 'Sign In to Loop' : 'Create Account & Launch'}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <p className="text-[11px] font-medium text-chestnut">
              {activeTab === 'signin' ? "Don't have an account yet?" : 'Already have a JumpCloud workspace?'}{' '}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
                className="font-bold text-white hover:text-accent transition-colors underline ml-1 cursor-pointer"
              >
                {activeTab === 'signin' ? 'Create one now' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-sooty flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

