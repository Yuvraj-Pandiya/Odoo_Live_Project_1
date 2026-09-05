'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { authApi, getStoredUser, setStoredAuth, clearStoredAuth } from '@/lib/api';

const NAV_ITEMS = [
  { path: 'dashboard',     label: 'Dashboard',     href: '/dashboard',     roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { path: 'quotations',    label: 'Quotations',    href: '/quotations',    roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { path: 'approvals',     label: 'Approvals',     href: '/approvals',     roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
  { path: 'fulfillment',   label: 'Fulfillment',   href: '/fulfillment',   roles: ['ADMIN', 'MANAGER'] },
  { path: 'subscriptions', label: 'Subscriptions', href: '/subscriptions', roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { path: 'invoices',      label: 'Invoices',      href: '/invoices',      roles: ['ADMIN', 'FINANCE'] },
  { path: 'deal-health',   label: 'Deal Health',   href: '/deal-health',   roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { path: 'reports',       label: 'Reports',       href: '/reports',       roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
];

const DEMO_PERSONAS = [
  { label: 'Admin',         role: 'ADMIN',     email: 'admin@dealflow360.com',   name: 'Aarav Sharma',   color: '#ef4444', icon: 'admin_panel_settings' },
  { label: 'Sales Manager', role: 'MANAGER',   email: 'manager@dealflow360.com', name: 'Priya Patel',    color: '#3b82f6', icon: 'manage_accounts' },
  { label: 'Finance Lead',  role: 'FINANCE',   email: 'finance@dealflow360.com', name: 'Rohan Mehta',    color: '#10b981', icon: 'payments' },
  { label: 'Sales Rep',     role: 'SALES_REP', email: 'rep1@dealflow360.com',    name: 'Vikram Singh',   color: '#f59e0b', icon: 'person' },
];

const ROLE_BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  ADMIN:     { bg: 'rgba(239, 68, 68, 0.15)',   color: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
  MANAGER:   { bg: 'rgba(59, 130, 246, 0.15)',  color: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' },
  FINANCE:   { bg: 'rgba(16, 185, 129, 0.15)',  color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  SALES_REP: { bg: 'rgba(245, 158, 11, 0.15)',  color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
};

export default function HeaderNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUserFromStorage = () => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u);
    }
  };

  useEffect(() => {
    loadUserFromStorage();
  }, [pathname]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    router.push('/login');
  };

  const handleSwitchPersona = async (persona: typeof DEMO_PERSONAS[0]) => {
    setSwitchingRole(persona.role);
    try {
      const res = await authApi.login(persona.email, 'Password123!');
      const token = res.data.accessToken || res.data.token;
      const newUser = {
        userId: res.data.userId,
        email: res.data.email,
        role: res.data.role,
        fullName: res.data.fullName,
      };
      setStoredAuth(token, newUser);
      setUser(newUser);
      setProfileDropdownOpen(false);
      router.refresh();
      window.location.reload();
    } catch {
      // Fallback
    } finally {
      setSwitchingRole(null);
    }
  };

  const isActive = (path: string) =>
    pathname === `/${path}` || pathname.startsWith(`/${path}/`);

  const userRole = user.role || 'SALES_REP';
  const roleStyle = ROLE_BADGE_STYLES[userRole] || ROLE_BADGE_STYLES.SALES_REP;

  const userInitials = user.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : (userRole ? userRole.slice(0, 2) : 'DF');

  return (
    <>
      {/* ── Main Header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: 'rgba(10, 10, 10, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <div
          style={{ height: '64px' }}
          className="w-full px-4 sm:px-6 flex items-center justify-between gap-4"
        >
          {/* ── Left: Logo + Nav ─────────────────────────────────── */}
          <div className="flex items-center gap-4 shrink-0 min-w-0">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo.svg"
                alt="DealFlow360 Logo"
                width={140}
                height={34}
                className="h-8 w-auto object-contain"
                priority
              />
              <span
                className="text-label-sm badge hidden xl:inline-flex"
                style={{
                  background: 'color-mix(in srgb, var(--color-tertiary-container) 20%, transparent)',
                  color: 'var(--color-tertiary)',
                  border: '1px solid color-mix(in srgb, var(--color-tertiary) 30%, transparent)',
                }}
              >
                ENTERPRISE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden xl:flex items-center gap-0.5 p-1 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                const hasAccess = item.roles.includes(userRole);
                return (
                  <Link
                    key={item.path}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg transition-all text-label-md flex items-center gap-1.5 ${!hasAccess ? 'opacity-50' : ''}`}
                    style={
                      active
                        ? {
                            background: 'rgba(255, 255, 255, 0.10)',
                            color: '#f0f0f0',
                            fontWeight: 600,
                            border: '1px solid rgba(255, 255, 255, 0.20)',
                          }
                        : {
                            color: '#888888',
                            border: '1px solid transparent',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = '#f0f0f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#888888';
                      }
                    }}
                  >
                    <span>{item.label}</span>
                    {!hasAccess && (
                      <span className="material-symbols-outlined text-xs" style={{ fontSize: '13px', opacity: 0.6 }} title={`Restricted to ${item.roles.join(', ')}`}>
                        lock
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Right: Search + Quick Persona Pill + User Profile ──────── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Bar */}
            <button
              type="button"
              onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
              className="flex items-center gap-2 rounded-lg transition-all cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                color: '#888888',
                padding: '0.375rem 0.75rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#555555' }}>search</span>
              <span className="text-body-sm hidden md:inline" style={{ color: '#666666' }}>
                Search deals, accounts...
              </span>
              <kbd
                className="hidden md:inline-block text-label-sm rounded"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#666666',
                  padding: '0.1rem 0.35rem',
                  border: '1px solid rgba(255,255,255,0.10)',
                  fontSize: '11px',
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* New Quote */}
            <Link
              href="/quotations"
              className="btn-primary hidden sm:flex"
              style={{ padding: '0.375rem 0.75rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              <span className="text-label-md hidden md:inline">New Quote</span>
            </Link>

            {/* Divider */}
            <div
              className="h-6 w-px hidden sm:block"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border"
                style={{
                  background: profileDropdownOpen ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
                  borderColor: profileDropdownOpen ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.09)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ring-1 transition-all"
                  style={{
                    background: roleStyle.bg,
                    color: roleStyle.color,
                    border: `1px solid ${roleStyle.border}`,
                  }}
                >
                  {userInitials}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {user.fullName || 'Enterprise User'}
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.2 rounded mt-0.5 w-fit"
                    style={{ background: roleStyle.bg, color: roleStyle.color }}
                  >
                    {userRole}
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm opacity-60 ml-0.5">
                  {profileDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6)',
                  }}
                >
                  {/* Current User Header */}
                  <div className="p-4 border-b" style={{ borderColor: 'color-mix(in srgb, var(--color-outline-variant) 30%, transparent)' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}
                      >
                        {userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user.fullName || 'User'}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-outline)' }}>{user.email || 'user@dealflow360.com'}</p>
                        <span
                          className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1"
                          style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}
                        >
                          Role: {userRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Persona Section */}
                  <div className="p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider px-2 mb-2" style={{ color: 'var(--color-outline)' }}>
                      Switch Role Persona (Instant Demo)
                    </p>
                    <div className="space-y-1">
                      {DEMO_PERSONAS.map((persona) => {
                        const isCurrent = userRole === persona.role;
                        const isSwitching = switchingRole === persona.role;
                        return (
                          <button
                            key={persona.role}
                            type="button"
                            onClick={() => handleSwitchPersona(persona)}
                            disabled={isSwitching}
                            className="w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer"
                            style={{
                              background: isCurrent ? 'var(--color-surface-container-highest)' : 'transparent',
                              border: isCurrent ? `1px solid ${persona.color}40` : '1px solid transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrent) e.currentTarget.style.background = 'var(--color-surface-container-high)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrent) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-lg" style={{ color: persona.color }}>
                                {persona.icon}
                              </span>
                              <div>
                                <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                                  {persona.label}
                                  {isCurrent && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold" style={{ background: `${persona.color}20`, color: persona.color }}>
                                      ACTIVE
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px]" style={{ color: 'var(--color-outline)' }}>{persona.name}</p>
                              </div>
                            </div>
                            {isSwitching ? (
                              <span className="material-symbols-outlined text-sm animate-spin" style={{ color: persona.color }}>refresh</span>
                            ) : isCurrent ? (
                              <span className="material-symbols-outlined text-base" style={{ color: persona.color }}>check</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sign out Footer */}
                  <div className="p-2 border-t" style={{ borderColor: 'color-mix(in srgb, var(--color-outline-variant) 30%, transparent)' }}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      style={{ color: 'var(--color-error)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-error) 15%, transparent)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Sign out of DealFlow360</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="xl:hidden rounded-lg transition-all"
              style={{ padding: '0.375rem', color: 'var(--color-on-surface-variant)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Menu ───────────────────────────────────── */}
        {mobileMenuOpen && (
          <div
            className="xl:hidden"
            style={{
              background: '#0f0f0f',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              padding: '0.75rem',
            }}
          >
            <div className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                const hasAccess = item.roles.includes(userRole);
                return (
                  <Link
                    key={item.path}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-label-md transition-all flex items-center justify-between ${!hasAccess ? 'opacity-50' : ''}`}
                    style={
                      active
                        ? {
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#f0f0f0',
                            fontWeight: 600,
                          }
                        : { color: '#888888' }
                    }
                  >
                    <span>{item.label}</span>
                    {!hasAccess && (
                      <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>lock</span>
                    )}
                  </Link>
                );
              })}
              <div
                style={{ height: '1px', background: 'color-mix(in srgb, var(--color-outline-variant) 40%, transparent)', margin: '0.5rem 0' }}
              />
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-lg text-label-md text-left transition-all"
                style={{ color: 'var(--color-error)' }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Search Modal Overlay ──────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
            }}
          >
            <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="material-symbols-outlined" style={{ color: '#555555' }}>search</span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search deals, quotations, customers..."
                className="flex-1 bg-transparent outline-none text-body-lg"
                style={{ color: '#f0f0f0' }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false);
                  if (e.key === 'Enter') {
                    const v = (e.target as HTMLInputElement).value.trim();
                    if (v) { router.push(`/quotations?q=${encodeURIComponent(v)}`); setSearchOpen(false); }
                  }
                }}
              />
              <kbd
                className="text-label-sm rounded px-2 py-0.5"
                style={{
                  background: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface-variant)',
                  border: '1px solid var(--color-outline-variant)',
                  cursor: 'pointer',
                }}
                onClick={() => setSearchOpen(false)}
              >
                ESC
              </kbd>
            </div>
            <div className="p-3 flex flex-col gap-0.5">
              {[
                { label: 'Quotations', icon: 'receipt_long', href: '/quotations' },
                { label: 'Approvals', icon: 'approval', href: '/approvals' },
                { label: 'Invoices', icon: 'payments', href: '/invoices' },
                { label: 'Fulfillment', icon: 'local_shipping', href: '/fulfillment' },
                { label: 'Deal Health', icon: 'health_metrics', href: '/deal-health' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-container-high)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-on-surface)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-on-surface-variant)';
                  }}
                >
                  <span className="material-symbols-outlined text-headline-sm" style={{ color: 'var(--color-outline)' }}>{item.icon}</span>
                  <span className="text-body-md">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
