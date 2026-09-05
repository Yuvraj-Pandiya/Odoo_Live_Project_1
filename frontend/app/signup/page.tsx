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
    <div className="min-h-screen flex items-center justify-center relative py-12 px-4 overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Background ambient blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

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
        <div className="df-card p-8 shadow-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-heading-1 font-bold text-white mb-1">
                Create your Account
              </h1>
              <span className="badge badge-indigo">
                Enterprise CPQ
              </span>
            </div>
            <p className="type-body-base text-slate-400">
              Join DealFlow360 to manage quotations, approvals, and deal pipelines.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="type-subheading block text-xs font-semibold text-slate-300 mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="df-input w-full text-sm"
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className="type-subheading block text-xs font-semibold text-slate-300 mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Verma"
                  className="df-input w-full text-sm"
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="type-subheading block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address <span className="text-rose-500">*</span>
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

            {/* Password */}
            <div>
              <label className="type-subheading block text-xs font-semibold text-slate-300 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="df-input w-full text-sm pr-10"
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
              <p className="type-body-base text-[11px] text-slate-500 mt-1">
                Must be at least 6 characters.
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="type-subheading block text-xs font-semibold text-slate-300 mb-2">
                Select Your Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLES.map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-lg" style={{ color: r.color }}>
                          {r.icon}
                        </span>
                        <span className="text-xs font-bold text-white flex-1">{r.label}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-sm text-indigo-400">
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="type-body-base text-[11px] text-slate-400 leading-tight">
                        {r.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-xs bg-rose-950/40 text-rose-400 border border-rose-800/60 animate-in fade-in">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-xl px-4 py-3 text-xs bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 animate-in fade-in flex items-center gap-2">
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
              <span>{loading ? 'Creating account...' : success ? 'Redirecting...' : 'Create Account & Sign In'}</span>
            </button>
          </form>

          {/* Already have an account footer */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="type-body-base text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
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
