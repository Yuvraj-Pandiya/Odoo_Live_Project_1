'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authApi, setStoredAuth } from '@/lib/api';

const ROLES = [
  { id: 'SALES_REP', label: 'Sales Representative', desc: 'Create quotations, track customer deals, negotiate in real-time', icon: 'person', color: '#f59e0b' },
  { id: 'MANAGER',   label: 'Sales Manager',        desc: 'Review tier-1 discount approvals, oversee fulfillment & inventory', icon: 'manage_accounts', color: '#3b82f6' },
  { id: 'FINANCE',   label: 'Finance Lead',         desc: 'Manage tier-2 CFO approvals, review A/R ledgers & invoices', icon: 'payments', color: '#10b981' },
  { id: 'ADMIN',     label: 'System Administrator', desc: 'Full enterprise oversight, analytics reports & governance override', icon: 'admin_panel_settings', color: '#ef4444' },
];

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]           = useState('SALES_REP');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // 1. Register user
      await authApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      // 2. Automatically log in after registration
      const loginRes = await authApi.login(email.trim().toLowerCase(), password);
      const token = loginRes.data.accessToken || loginRes.data.token;
      const user = {
        userId: loginRes.data.userId,
        email: loginRes.data.email,
        role: loginRes.data.role,
        fullName: loginRes.data.fullName,
      };
      setStoredAuth(token, user);
      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check your details and try again.';
      setError(msg);
    } finally {
      setLoading(false);
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
        style={{ background: 'color-mix(in srgb, var(--color-primary-container) 10%, transparent)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--color-tertiary) 8%, transparent)' }}
      />

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
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
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'var(--color-surface-container-low)',
            border: '1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1
                className="text-display-sm font-bold text-white mb-1"
              >
                Create your Account
              </h1>
              <span
                className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full font-bold"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                  color: 'var(--color-primary)',
                  border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                }}
              >
                Enterprise CPQ
              </span>
            </div>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
              Join DealFlow360 to manage quotations, approvals, and deal pipelines.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-semibold mb-1.5" style={{ color: 'var(--color-on-surface)' }}>
                  First Name <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="input text-body-md w-full"
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className="block text-label-md font-semibold mb-1.5" style={{ color: 'var(--color-on-surface)' }}>
                  Last Name <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Verma"
                  className="input text-body-md w-full"
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-label-md font-semibold mb-1.5" style={{ color: 'var(--color-on-surface)' }}>
                Work Email Address <span style={{ color: 'var(--color-error)' }}>*</span>
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

            {/* Password */}
            <div>
              <label className="block text-label-md font-semibold mb-1.5" style={{ color: 'var(--color-on-surface)' }}>
                Password <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input text-body-md w-full pr-10"
                  autoComplete="new-password"
                  minLength={6}
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
              <p className="text-[11px] mt-1" style={{ color: 'var(--color-outline)' }}>
                Must be at least 6 characters.
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-label-md font-semibold mb-2" style={{ color: 'var(--color-on-surface)' }}>
                Select Your Role <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLES.map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'ring-2' : ''}`}
                      style={{
                        background: isSelected ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)',
                        borderColor: isSelected ? r.color : 'color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
                        boxShadow: isSelected ? `0 0 16px ${r.color}25` : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-lg" style={{ color: r.color }}>
                          {r.icon}
                        </span>
                        <span className="text-xs font-bold text-white flex-1">{r.label}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-sm" style={{ color: r.color }}>
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-tight" style={{ color: 'var(--color-outline)' }}>
                        {r.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
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

            {/* Success Message */}
            {success && (
              <div
                className="rounded-lg px-4 py-3 text-body-sm animate-in fade-in flex items-center gap-2"
                style={{
                  background: 'color-mix(in srgb, var(--color-tertiary) 15%, transparent)',
                  color: 'var(--color-tertiary)',
                  border: '1px solid color-mix(in srgb, var(--color-tertiary) 30%, transparent)',
                }}
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Account created successfully! Redirecting to dashboard...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 mt-2"
              disabled={loading || success}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>refresh</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>how_to_reg</span>
              )}
              {loading ? 'Creating account...' : success ? 'Redirecting...' : 'Create Account & Sign In'}
            </button>
          </form>

          {/* Already have an account footer */}
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold transition hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
