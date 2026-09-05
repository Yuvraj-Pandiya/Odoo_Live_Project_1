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
    <div
      className="min-h-screen flex items-center justify-center relative py-12 px-4 overflow-hidden"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Background ambient blobs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--color-primary-container) 8%, transparent)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--color-tertiary) 6%, transparent)' }}
      />

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
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--color-surface-container-low)',
            border: '1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div className="mb-6">
            <h1
              className="text-display-sm font-bold text-white mb-1"
            >
              Sign in to DealFlow360
            </h1>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
              Enterprise CPQ & Sales Platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label
                className="block text-label-md font-semibold mb-1.5"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="input text-body-md w-full"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-label-md font-semibold"
                  style={{ color: 'var(--color-on-surface)' }}
                >
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
                  className="input text-body-md w-full pr-10"
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
              <div
                className="rounded-lg px-4 py-3 text-body-sm animate-in fade-in"
                style={{
                  background: 'color-mix(in srgb, var(--color-error) 15%, transparent)',
                  color: 'var(--color-error)',
                  border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)',
                }}
              >
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Don't have an account? Sign Up Link */}
          <div className="mt-5 text-center">
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-bold transition hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Create an Account
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div style={{ flex: 1, height: '1px', background: 'var(--color-outline-variant)' }} />
            <span className="text-label-sm uppercase tracking-wider text-[11px] font-semibold" style={{ color: 'var(--color-outline)' }}>
              Quick Demo Personas
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-outline-variant)' }} />
          </div>

          {/* Demo Role Switcher */}
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleDemoLogin(account)}
                disabled={loadingDemo !== null}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center cursor-pointer relative"
                style={{
                  background: 'var(--color-surface-container)',
                  border: `1px solid color-mix(in srgb, ${account.color} 20%, transparent)`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-container-high)';
                  (e.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${account.color} 40%, transparent)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-container)';
                  (e.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${account.color} 20%, transparent)`;
                }}
              >
                {loadingDemo === account.email ? (
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px', color: account.color }}>refresh</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: account.color }}>
                    {account.icon}
                  </span>
                )}
                <span className="text-xs font-bold text-white leading-tight">{account.label}</span>
                <span className="text-[10px]" style={{ color: 'var(--color-outline)' }}>{account.name}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-label-sm mt-4 text-[11px]" style={{ color: 'var(--color-outline)' }}>
            Demo password for all personas: <code className="text-label-sm font-bold" style={{ color: 'var(--color-primary)' }}>Password123!</code>
          </p>
        </div>
      </div>
    </div>
  );
}
