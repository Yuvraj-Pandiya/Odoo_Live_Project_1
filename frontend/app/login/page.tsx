'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authApi, setStoredAuth } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { label: 'Admin',         email: 'admin@dealflow360.com',   role: 'ADMIN',      color: 'var(--color-error)',     icon: 'admin_panel_settings', name: 'Aarav Sharma' },
  { label: 'Sales Manager', email: 'manager@dealflow360.com', role: 'MANAGER',    color: 'var(--color-primary)',   icon: 'manage_accounts',       name: 'Priya Patel' },
  { label: 'Finance Lead',  email: 'finance@dealflow360.com', role: 'FINANCE',    color: 'var(--color-tertiary)',  icon: 'payments',              name: 'Rohan Mehta' },
  { label: 'Sales Rep',     email: 'rep1@dealflow360.com',    role: 'SALES_REP',  color: 'var(--color-secondary)', icon: 'person',                name: 'Vikram Singh' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email.trim().toLowerCase(), password);
      const token = res.data.accessToken || res.data.token;
      const user = {
        userId: res.data.userId,
        email: res.data.email,
        role: res.data.role,
        fullName: res.data.fullName,
      };
      setStoredAuth(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoadingDemo(account.email);
    setError('');
    try {
      const res = await authApi.login(account.email, 'Password123!');
      const token = res.data.accessToken || res.data.token;
      const user = {
        userId: res.data.userId,
        email: res.data.email,
        role: res.data.role,
        fullName: res.data.fullName,
      };
      setStoredAuth(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to sign in as ${account.label}`);
    } finally {
      setLoadingDemo(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative py-12 px-4 overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Background ambient blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/login">
            <Image
              src="/logo.svg"
              alt="DealFlow360"
              width={180}
              height={44}
              priority
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="df-card p-8 shadow-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl">
          <div className="mb-6">
            <h1 className="text-heading-1 font-bold text-white mb-1">
              Sign in to DealFlow360
            </h1>
            <p className="type-body-base text-slate-400">
              Enterprise CPQ & Sales Platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="type-subheading block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="df-input w-full text-sm"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="type-subheading block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="df-input w-full text-sm pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-xs bg-rose-950/40 text-rose-400 border border-rose-800/60 animate-in fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 mt-1"
              disabled={loading}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>refresh</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
              )}
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Don't have an account? Sign Up Link */}
          <div className="mt-5 text-center">
            <p className="type-body-base text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Create an Account
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="type-subheading text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Quick Demo Personas
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Demo Role Switcher */}
          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleDemoLogin(account)}
                disabled={loadingDemo !== null}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center cursor-pointer bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50"
              >
                {loadingDemo === account.email ? (
                  <span className="material-symbols-outlined animate-spin text-lg text-indigo-400">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-lg text-indigo-400">
                    {account.icon}
                  </span>
                )}
                <span className="text-xs font-bold text-white leading-tight">{account.label}</span>
                <span className="type-body-base text-[10px] text-slate-400">{account.name}</span>
              </button>
            ))}
          </div>

          <p className="text-center type-body-base text-[11px] text-slate-500 mt-4">
            Demo password for all personas: <code className="font-mono font-bold text-indigo-400">Password123!</code>
          </p>
        </div>
      </div>
    </div>
  );
}
