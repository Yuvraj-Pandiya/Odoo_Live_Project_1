'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Lock, Mail, TrendingUp, Shield, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mode, setMode]         = useState<'login' | 'register'>('login');
  const [regData, setRegData]   = useState({ firstName: '', lastName: '', role: 'SALES_REP' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('dealflow_token', res.data.accessToken);
      localStorage.setItem('dealflow_user', JSON.stringify(res.data));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.register({ email, password, ...regData });
      setMode('login');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const quickFill = (role: string) => {
    const accounts: any = {
      admin:   ['admin@dealflow360.com',   'Password123!'],
      manager: ['manager@dealflow360.com', 'Password123!'],
      finance: ['finance@dealflow360.com', 'Password123!'],
      rep:     ['rep1@dealflow360.com',    'Password123!'],
    };
    const [e, p] = accounts[role] || [];
    setEmail(e); setPassword(p);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(222 47% 7%)' }}>
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12"
           style={{ background: 'linear-gradient(135deg, hsl(220 90% 12%), hsl(262 83% 12%))' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow"
               style={{ background: 'linear-gradient(135deg, hsl(220 90% 56%), hsl(262 83% 58%))' }}>
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">DealFlow<span style={{ color: 'hsl(262 83% 72%)' }}>360</span></span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Intelligent Sales<br />
              <span style={{ background: 'linear-gradient(135deg, hsl(220 90% 70%), hsl(262 83% 72%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Operations Platform
              </span>
            </h1>
            <p style={{ color: 'hsl(215 20% 65%)' }} className="text-lg">
              Multi-tier discount governance, live upsell recommendations, and real-time deal health monitoring.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Shield, text: 'Automated discount approval routing' },
              { icon: Zap,    text: 'Live margin impact & upsell engine' },
              { icon: TrendingUp, text: 'Deal health anomaly detection' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: 'hsl(220 90% 56% / 0.2)', border: '1px solid hsl(220 90% 56% / 0.3)' }}>
                  <Icon size={14} style={{ color: 'hsl(220 90% 70%)' }} />
                </div>
                <span style={{ color: 'hsl(215 20% 75%)' }} className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'hsl(215 15% 45%)' }} className="text-sm">
          DealFlow360 MVP · Hackathon Edition
        </p>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 animate-in">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, hsl(220 90% 56%), hsl(262 83% 58%))' }}>
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">DealFlow<span style={{ color: 'hsl(262 83% 72%)' }}>360</span></span>
          </div>

          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(210 40% 96%)' }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create account'}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'hsl(215 20% 65%)' }}>
              {mode === 'login' ? 'Enter your credentials to continue' : 'Fill in details to register'}
            </p>
          </div>

          {/* Quick login buttons */}
          {mode === 'login' && (
            <div>
              <p className="text-xs mb-2" style={{ color: 'hsl(215 15% 45%)' }}>Quick fill (demo accounts):</p>
              <div className="flex flex-wrap gap-2">
                {['admin','manager','finance','rep'].map(r => (
                  <button key={r} onClick={() => quickFill(r)}
                          className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                          style={{ background: 'hsl(222 47% 15%)', border: '1px solid hsl(222 47% 22%)', color: 'hsl(215 20% 65%)' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'hsl(220 90% 56%)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(222 47% 22%)')}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>First Name</label>
                  <input className="input" value={regData.firstName} onChange={e => setRegData(p => ({ ...p, firstName: e.target.value }))} placeholder="John" required />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>Last Name</label>
                  <input className="input" value={regData.lastName} onChange={e => setRegData(p => ({ ...p, lastName: e.target.value }))} placeholder="Doe" required />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(215 15% 45%)' }} />
                <input id="email" type="email" className="input" style={{ paddingLeft: '2.25rem' }}
                       value={email} onChange={e => setEmail(e.target.value)}
                       placeholder="you@company.com" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(215 15% 45%)' }} />
                <input id="password" type="password" className="input" style={{ paddingLeft: '2.25rem' }}
                       value={password} onChange={e => setPassword(e.target.value)}
                       placeholder="••••••••" required />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>Role</label>
                <select className="input" value={regData.role} onChange={e => setRegData(p => ({ ...p, role: e.target.value }))}>
                  <option value="SALES_REP">Sales Rep</option>
                  <option value="MANAGER">Manager</option>
                  <option value="FINANCE">Finance</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.2)', color: 'hsl(0 84% 70%)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: 'hsl(215 20% 65%)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
                    className="font-semibold" style={{ color: 'hsl(220 90% 70%)' }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="text-center text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
            Demo password for all accounts: <code className="px-1 py-0.5 rounded" style={{ background: 'hsl(222 47% 15%)' }}>Password123!</code>
          </p>
        </div>
      </div>
    </div>
  );
}
