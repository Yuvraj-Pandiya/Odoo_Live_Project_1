'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authApi } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { label: 'Admin',        email: 'admin@dealflow360.com',   role: 'ADMIN',      color: 'var(--color-error)', icon: 'admin_panel_settings' },
  { label: 'Sales Manager',email: 'manager@dealflow360.com', role: 'MANAGER',    color: 'var(--color-primary)', icon: 'manage_accounts' },
  { label: 'Finance',      email: 'finance@dealflow360.com', role: 'FINANCE',    color: 'var(--color-tertiary)', icon: 'payments' },
  { label: 'Sales Rep',    email: 'rep1@dealflow360.com',    role: 'SALES_REP',  color: 'var(--color-secondary)', icon: 'person' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;
      localStorage.setItem('dealflow_token', token);
      localStorage.setItem('dealflow_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoadingDemo(account.email);
    setError('');
    try {
      const res = await authApi.login(account.email, 'Password123!');
      const { token, user } = res.data;
      localStorage.setItem('dealflow_token', token);
      localStorage.setItem('dealflow_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch {
      // fallback: store mock user and redirect
      localStorage.setItem('dealflow_token', 'demo-token');
      localStorage.setItem('dealflow_user', JSON.stringify({
        fullName: `${account.label} User`,
        email: account.email,
        role: account.role,
      }));
      router.push('/dashboard');
    } finally {
      setLoadingDemo(null);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
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
          <Image
            src="/logo.svg"
            alt="DealFlow360"
            width={180}
            height={44}
            priority
            className="h-10 w-auto"
          />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--color-surface-container-low)',
            border: '1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          }}
        >
          <div className="mb-6">
            <h1
              className="text-headline-lg mb-1"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Welcome back
            </h1>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
              Sign in to your DealFlow360 workspace
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-label-md mb-1.5 block" style={{ color: 'var(--color-on-surface-variant)' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="df-input"
              />
            </div>
            <div>
              <label className="text-label-md mb-1.5 block" style={{ color: 'var(--color-on-surface-variant)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="df-input"
              />
            </div>

            {error && (
              <div
                className="rounded-lg px-4 py-3 text-body-sm"
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
              className="btn-primary w-full justify-center py-3"
              disabled={loading}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>refresh</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div style={{ flex: 1, height: '1px', background: 'var(--color-outline-variant)' }} />
            <span className="text-label-sm" style={{ color: 'var(--color-outline)' }}>Quick Demo Access</span>
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
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-center cursor-pointer relative"
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
                <span className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>{account.label}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-label-sm mt-4" style={{ color: 'var(--color-outline)' }}>
            Demo password: <code className="text-label-sm" style={{ color: 'var(--color-primary)' }}>Password123!</code>
          </p>
        </div>
      </div>
    </div>
  );
}
