'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authApi, setStoredAuth } from '@/lib/api';
import { User, Shield, Briefcase, Settings, Store, Eye, EyeOff, CheckCircle2, UserPlus, Loader2 } from 'lucide-react';

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

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    
    if (!email.trim()) {
      errors.email = 'Work email address is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@company.com).';
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

      // 2. Log in
      let token = 'demo-token';
      let userObj = {
        userId: 1,
        email: email.trim().toLowerCase(),
        role: role,
        fullName: `${firstName.trim()} ${lastName.trim()}`,
      };

      try {
        const loginRes = await authApi.login(email.trim().toLowerCase(), password);
        if (loginRes?.data) {
          token = loginRes.data.accessToken || loginRes.data.token || token;
          userObj = {
            userId: loginRes.data.userId || 1,
            email: loginRes.data.email || email.trim().toLowerCase(),
            role: loginRes.data.role || role,
            fullName: loginRes.data.fullName || `${firstName.trim()} ${lastName.trim()}`,
          };
        }
      } catch {
        // Fallback for offline demo mode
      }

      setStoredAuth(token, userObj);
      setSuccess(true);

      setTimeout(() => {
        if (role === 'CUSTOMER') {
          router.push('/portal/token-tcs-1001');
        } else {
          router.push('/dashboard');
        }
      }, 900);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.fields) {
        setFieldErrors(data.fields);
        setError('Please resolve the field validation errors highlighted below.');
      } else if (data?.message) {
        setError(data.message);
      } else if (err.message === 'Network Error' || !err.response) {
        setError('Cannot connect to backend server at http://localhost:8080. Please ensure the backend is running.');
      } else {
        setError(data?.error || 'Registration failed. Please check your details and try again.');
      }
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
    </div>
  );
}
