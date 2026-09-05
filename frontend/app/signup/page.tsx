'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authApi, setStoredAuth } from '@/lib/api';
import { User, Shield, Briefcase, Settings, Store, Eye, EyeOff, CheckCircle2, UserPlus, Loader2, X, Clock, AlertTriangle, Mail } from 'lucide-react';

const ROLES = [
  { id: 'SALES_REP', label: 'Sales Representative', desc: 'Create quotations, track customer deals, negotiate in real-time', Icon: User },
  { id: 'MANAGER',   label: 'Sales Manager',        desc: 'Review tier-1 discount approvals, oversee fulfillment & inventory', Icon: Briefcase },
  { id: 'FINANCE',   label: 'Finance Lead',         desc: 'Manage tier-2 CFO approvals, review A/R ledgers & invoices', Icon: Shield },
  { id: 'ADMIN',     label: 'System Administrator', desc: 'Full enterprise oversight, analytics reports & governance override', Icon: Settings },
  { id: 'CUSTOMER',  label: 'Customer Account',     desc: 'Direct customer portal access to view quotations & negotiate', Icon: Store },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess]     = useState(false);

  const [loginAlertModal, setLoginAlertModal] = useState<{
    open: boolean;
    type: 'pending' | 'deactivated' | 'error' | 'info';
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    
    if (!email.trim()) {
      errors.email = 'Work email address is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please provide a valid work email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // 1. Register user
      await authApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      setSuccess(true);

      // Pop persistent alert dialog modal that stays until the user explicitly crosses/closes it
      setLoginAlertModal({
        open: true,
        type: 'pending',
        title: 'Registration Submitted — Awaiting Administrator Approval',
        message: 'Your registration was submitted successfully. For security and role verification, your account is currently pending activation by an Administrator.',
        details: 'An administrator will review and activate your profile in the User Governance panel (/admin/users). Once approved, you can sign in with your email and password.',
      });
    } catch (err: any) {
      const data = err.response?.data;
      const status = err.response?.status;
      const msg = data?.message || 'Registration failed. Please check your details and try again.';

      if (data?.fields) {
        setFieldErrors(data.fields);
        setError('Please resolve the field validation errors highlighted below.');
      } else if (status === 409) {
        setFieldErrors(p => ({ ...p, email: 'This email is already registered. Please sign in instead.' }));
        setError('Email already registered.');
      } else {
        setError(msg);
      }

      setLoginAlertModal({
        open: true,
        type: 'error',
        title: 'Registration Unsuccessful',
        message: msg,
        details: !err.response ? 'Unable to connect to backend server at http://localhost:8080. Please ensure the backend is running.' : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--canvas)] text-[var(--text-primary)] font-sans antialiased">
      <div className="w-full max-w-xl space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/">
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
        <div className="df-card p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="page-heading">
                Create your account
              </h1>
              <span className="badge badge-indigo">
                Enterprise CPQ
              </span>
            </div>
            <p className="body-text mt-1">
              Join DealFlow360 to manage quotations, approvals, and deal pipelines.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-4" noValidate>
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="section-label block mb-1.5">
                  First Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (fieldErrors.firstName) setFieldErrors(p => ({ ...p, firstName: '' }));
                  }}
                  placeholder="e.g. Rahul"
                  className={`w-full text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ${fieldErrors.firstName ? 'border-[var(--error)] bg-[var(--error-subtle)]' : ''}`}
                  autoComplete="given-name"
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-[var(--error)] mt-1 font-medium">{fieldErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="section-label block mb-1.5">
                  Last Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (fieldErrors.lastName) setFieldErrors(p => ({ ...p, lastName: '' }));
                  }}
                  placeholder="e.g. Verma"
                  className={`w-full text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ${fieldErrors.lastName ? 'border-[var(--error)] bg-[var(--error-subtle)]' : ''}`}
                  autoComplete="family-name"
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-[var(--error)] mt-1 font-medium">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="section-label block mb-1.5">
                Work Email Address <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: '' }));
                }}
                placeholder="name@company.com"
                className={`w-full text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ${fieldErrors.email ? 'border-[var(--error)] bg-[var(--error-subtle)]' : ''}`}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="text-xs text-[var(--error)] mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="section-label block mb-1.5">
                Password <span className="text-[var(--error)]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' }));
                  }}
                  placeholder="Minimum 8 characters"
                  className={`w-full text-sm p-3 pr-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ${fieldErrors.password ? 'border-[var(--error)] bg-[var(--error-subtle)]' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="text-xs text-[var(--error)] mt-1 font-medium">{fieldErrors.password}</p>
              ) : (
                <p className="body-sm mt-1">
                  Must be at least 8 characters long.
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="section-label block mb-2">
                Select Your Role <span className="text-[var(--error)]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLES.map((r) => {
                  const isSelected = role === r.id;
                  const Icon = r.Icon;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[var(--accent-subtle)] border-[var(--accent)] shadow-xs'
                          : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--canvas)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={18} className="text-[var(--accent)]" />
                        <span className="section-label text-xs flex-1">{r.label}</span>
                        {isSelected && (
                          <CheckCircle2 size={16} className="text-[var(--accent)]" />
                        )}
                      </div>
                      <p className="body-sm text-[11px] leading-tight">
                        {r.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-xs bg-[var(--error-subtle)] text-[var(--error)] border border-[#FCA5A5]">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-xl px-4 py-3 text-xs bg-[var(--success-subtle)] text-[var(--success)] border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Account created successfully! Redirecting to {role === 'CUSTOMER' ? 'Customer Portal' : 'Dashboard'}...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 mt-2"
              disabled={loading || success}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <UserPlus size={18} />
              )}
              <span>{loading ? 'Creating account...' : success ? 'Redirecting...' : 'Create Account & Sign In'}</span>
            </button>
          </form>

          {/* Already have an account footer */}
          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="body-sm">
              Already have an account?{' '}
              <Link
                href="/"
                className="font-bold text-[var(--accent)] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Persistent Access & Approval Alert Dialog ─────────────────── */}
      {loginAlertModal?.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              background: '#0F172A',
              border: loginAlertModal.type === 'pending'
                ? '1px solid #F59E0B'
                : loginAlertModal.type === 'deactivated'
                ? '1px solid #EF4444'
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              padding: '28px 26px',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            {/* Top Right Close Button */}
            <button
              type="button"
              onClick={() => {
                setLoginAlertModal(null);
                if (loginAlertModal.type === 'pending') {
                  router.push('/');
                }
              }}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'rgba(255,255,255,0.8)',
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              title="Close notification"
            >
              <X size={18} />
            </button>

            {/* Header with Icon */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: loginAlertModal.type === 'pending'
                    ? 'rgba(245, 158, 11, 0.18)'
                    : 'rgba(239, 68, 68, 0.18)',
                  border: loginAlertModal.type === 'pending'
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(239, 68, 68, 0.4)',
                  color: loginAlertModal.type === 'pending' ? '#FBBF24' : '#F87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {loginAlertModal.type === 'pending' ? <Clock size={22} /> : <AlertTriangle size={22} />}
              </div>
              <div style={{ paddingRight: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#FFFFFF', lineHeight: 1.3 }}>
                  {loginAlertModal.title}
                </h2>
                <p style={{ fontSize: 12.5, color: '#94A3B8', margin: 0 }}>
                  DealFlow360 Enterprise Access Security
                </p>
              </div>
            </div>

            {/* Message Body */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 16,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: '#E2E8F0',
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>
                {loginAlertModal.message}
              </p>
              {loginAlertModal.details && (
                <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
                  {loginAlertModal.details}
                </p>
              )}
            </div>

            {/* Admin Support Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(96, 165, 250, 0.25)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 20,
                fontSize: 12.5,
                color: '#93C5FD',
              }}
            >
              <Mail size={16} style={{ flexShrink: 0 }} />
              <span>
                System Administrator: <strong style={{ color: '#FFFFFF' }}>admin@dealflow360.com</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setLoginAlertModal(null);
                  if (loginAlertModal.type === 'pending') {
                    router.push('/');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: loginAlertModal.type === 'pending' ? '#F59E0B' : '#4F46E5',
                  color: loginAlertModal.type === 'pending' ? '#0F172A' : '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {loginAlertModal.type === 'pending' ? 'Go to Sign In' : 'Understood & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
