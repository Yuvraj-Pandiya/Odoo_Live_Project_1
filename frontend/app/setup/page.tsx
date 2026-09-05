'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  User,
  Building2,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Shield,
  KeyRound,
} from 'lucide-react';
import { setupApi, setStoredAuth } from '@/lib/api';

/* ─── Design Tokens ─────────────────────────────────────────────── */
const t = {
  accent:        '#4B4B42',
  accentHover:   '#373730',
  accentSubtle:  '#ECECE9',
  panelBg:       '#373730',
  textPrimary:   '#1F1F1C',
  textSecondary: '#4B4B42',
  textMuted:     '#91918F',
  border:        '#DCDCD9',
  canvas:        '#F5F5F3',
  surface:       '#FFFFFF',
  success:       '#2E6B4F',
  successSubtle: '#E8F5EE',
  error:         '#DC2626',
  errorSubtle:   '#FEE2E2',
};

export default function SetupWizardPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [setupAllowed, setSetupAllowed] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Executive Operations');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check setup accessibility on load
  useEffect(() => {
    let mounted = true;
    async function verifySetup() {
      try {
        const res = await setupApi.checkAdminStatus();
        if (mounted) {
          if (res.data?.setupAllowed) {
            setSetupAllowed(true);
          } else {
            router.replace('/login');
          }
        }
      } catch {
        // If 403 Forbidden or any error -> an admin already exists, route to login immediately
        if (mounted) {
          router.replace('/login');
        }
      } finally {
        if (mounted) setChecking(false);
      }
    }
    verifySetup();
    return () => { mounted = false; };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide your full first and last name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await setupApi.bootstrapAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        department: department.trim(),
        password,
      });

      const { accessToken, role, email: ue, fullName, userId } = res.data;
      setStoredAuth(accessToken, { id: userId, email: ue, fullName, role });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dealflow-auth-change'));
      }

      setSuccess('Primary Administrator successfully configured. Initializing your dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403) {
        setError('Setup has already been concluded. Redirecting to login...');
        setTimeout(() => router.replace('/login'), 1500);
      } else {
        setError(err.response?.data?.message || 'Bootstrap setup failed. Please check the provided information.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: t.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', color: t.textSecondary }}>
          <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto mb-3" />
          <p style={{ fontSize: '14px', fontWeight: 500 }}>Verifying system bootstrap status...</p>
        </div>
      </div>
    );
  }

  if (!setupAllowed) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: t.canvas, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Header */}
      <header style={{ height: '60px', background: t.surface, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px' }}>
            DF
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: t.textPrimary }}>
            DealFlow<span style={{ color: '#3B82F6' }}>360</span>
          </span>
          <span style={{ fontSize: '12px', background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, border: '1px solid #E0E7FF' }}>
            System Bootstrap
          </span>
        </div>
        <div style={{ fontSize: '12px', color: t.textMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} color="#16A34A" /> One-Time First Admin Configuration
        </div>
      </header>

      {/* Main Wizard Container */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: '540px', width: '100%', background: t.surface, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '36px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#4F46E5' }}>
              <KeyRound size={24} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: t.textPrimary, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Create First Administrator
            </h1>
            <p style={{ fontSize: '14px', color: t.textSecondary, lineHeight: 1.5, margin: 0 }}>
              Zero administrators detected on this deployment. Provision your root enterprise administrator to unlock full governance and staff provisioning.
            </p>
          </div>

          {/* Security Notice */}
          <div style={{ padding: '12px 14px', borderRadius: '8px', background: '#F8FAFC', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px' }}>
            <ShieldCheck size={16} color="#4F46E5" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12.5px', color: t.textSecondary, lineHeight: 1.4 }}>
              <strong>Permanent Lockdown:</strong> Once this account is created, the <code>/setup</code> route is permanently sealed and will return <code>403 Forbidden</code> for all subsequent requests.
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{ padding: '12px 14px', borderRadius: '8px', background: t.errorSubtle, border: '1px solid #FCA5A5', color: t.error, fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div style={{ padding: '12px 14px', borderRadius: '8px', background: t.successSubtle, border: '1px solid #86EFAC', color: t.success, fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Setup Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: t.textPrimary, marginBottom: '6px' }}>
                  First Name <span style={{ color: t.error }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Aarav"
                    className="df-input"
                    style={{ width: '100%', height: '42px', fontSize: '14px', paddingLeft: '34px' }}
                  />
                  <User size={15} color={t.textMuted} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: t.textPrimary, marginBottom: '6px' }}>
                  Last Name <span style={{ color: t.error }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Sharma"
                    className="df-input"
                    style={{ width: '100%', height: '42px', fontSize: '14px', paddingLeft: '34px' }}
                  />
                  <User size={15} color={t.textMuted} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: t.textPrimary, marginBottom: '6px' }}>
                Corporate Administrator Email <span style={{ color: t.error }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@dealflow360.com"
                  className="df-input"
                  style={{ width: '100%', height: '42px', fontSize: '14px', paddingLeft: '34px' }}
                />
                <Mail size={15} color={t.textMuted} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Department Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: t.textPrimary, marginBottom: '6px' }}>
                Department
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Executive Operations / Revenue Operations"
                  className="df-input"
                  style={{ width: '100%', height: '42px', fontSize: '14px', paddingLeft: '34px' }}
                />
                <Building2 size={15} color={t.textMuted} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Password Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: t.textPrimary, marginBottom: '6px' }}>
                  Password <span style={{ color: t.error }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="df-input"
                    style={{ width: '100%', height: '42px', fontSize: '14px', paddingLeft: '34px', paddingRight: '36px' }}
                  />
                  <Lock size={15} color={t.textMuted} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: t.textPrimary, marginBottom: '6px' }}>
                  Confirm Password <span style={{ color: t.error }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCpw ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="df-input"
                    style={{ width: '100%', height: '42px', fontSize: '14px', paddingLeft: '34px', paddingRight: '36px' }}
                  />
                  <Lock size={15} color={t.textMuted} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button type="button" onClick={() => setShowCpw(!showCpw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}>
                    {showCpw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '8px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                  transition: 'background 0.15s ease',
                }}
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Initialize Enterprise Platform</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
