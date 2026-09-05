'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { authApi, getStoredUser, setStoredAuth, clearStoredAuth } from '@/lib/api';

/* ─── Light Workspace Tokens ─────────────────────────────────────────────── */
const t = {
  surface:       '#FFFFFF',
  canvas:        '#F0F2F7',
  border:        '#D8DCE8',
  textPrimary:   '#111827',
  textSecondary: '#4B5563',
  textMuted:     '#9CA3AF',
  accent:        '#2E51D6',
  accentHover:   '#2341B8',
  accentSubtle:  '#EEF2FF',
  error:         '#DC2626',
  errorSubtle:   '#FEE2E2',
};

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
  { label: 'Admin',         role: 'ADMIN',     email: 'admin@dealflow360.com',   name: 'Aarav Sharma',   icon: 'admin_panel_settings' },
  { label: 'Sales Manager', role: 'MANAGER',   email: 'manager@dealflow360.com', name: 'Priya Patel',    icon: 'manage_accounts' },
  { label: 'Finance Lead',  role: 'FINANCE',   email: 'finance@dealflow360.com', name: 'Rohan Mehta',    icon: 'payments' },
  { label: 'Sales Rep',     role: 'SALES_REP', email: 'rep1@dealflow360.com',    name: 'Vikram Singh',   icon: 'person' },
];

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
      setStoredAuth('demo-token', {
        userId: 1,
        email: persona.email,
        role: persona.role,
        fullName: persona.name,
      });
      setUser({
        userId: 1,
        email: persona.email,
        role: persona.role,
        fullName: persona.name,
      });
      setProfileDropdownOpen(false);
      router.refresh();
    } finally {
      setSwitchingRole(null);
    }
  };

  const isActive = (path: string) => {
    if (path === 'dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(`/${path}`);
  };

  const userRole = user.role || 'SALES_REP';

  const userInitials = user.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : (userRole ? userRole.slice(0, 2) : 'DF');

  return (
    <>
      {/* ── Main Header (Light Theme: Surface White, 1px Border Bottom) ───────── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{ height: '72px', padding: '0 24px' }}
          className="w-full flex items-center justify-between gap-4"
        >
          {/* ── Left: Logo + Plan Badge + Desktop Navigation ───────────────── */}
          <div className="flex items-center gap-6 min-w-0 flex-1">
            {/* Logo + Enterprise Badge */}
            <Link href="/dashboard" className="flex items-center gap-3 shrink-0" style={{ textDecoration: 'none' }}>
              <Image
                src="/logo.svg"
                alt="DealFlow360 Logo"
                width={140}
                height={34}
                className="h-8 w-auto object-contain shrink-0"
                priority
              />
              <span
                style={{
                  background: t.accentSubtle,
                  color: t.accent,
                  border: `1px solid ${t.border}`,
                  borderRadius: '9999px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
                className="hidden xl:inline-flex shrink-0"
              >
                Enterprise
              </span>
            </Link>

            {/* Desktop Navigation (Equal 16px spacing between items, scoped underline active state) */}
            <nav className="hidden xl:flex items-center overflow-hidden" style={{ gap: '16px' }}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                const hasAccess = item.roles.includes(userRole);
                return (
                  <Link
                    key={item.path}
                    href={item.href}
                    className={`transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${!hasAccess ? 'opacity-50' : ''}`}
                    style={
                      active
                        ? {
                            background: t.accentSubtle,
                            color: t.accent,
                            fontWeight: 600,
                            fontSize: '14px',
                            padding: '8px 12px',
                            borderRadius: '8px 8px 0 0',
                            borderBottom: `2px solid ${t.accent}`,
                            textDecoration: 'none',
                          }
                        : {
                            color: t.textSecondary,
                            fontWeight: 500,
                            fontSize: '14px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            borderBottom: '2px solid transparent',
                            textDecoration: 'none',
                            background: 'transparent',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = t.canvas;
                        e.currentTarget.style.color = t.textPrimary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = t.textSecondary;
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

          {/* ── Right Cluster: Search (Fixed Width) + New Quote + User Profile (Guaranteed Room) ── */}
          <div className="flex items-center shrink-0" style={{ gap: '16px' }}>
            {/* Search Input Button (Fixed 240px width, no line wrapping) */}
            <button
              type="button"
              onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
              className="flex items-center gap-2 transition-all cursor-pointer shrink-0"
              style={{
                width: '240px',
                height: '40px',
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: '8px',
                color: t.textMuted,
                padding: '0 12px',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = t.accent;
                e.currentTarget.style.background = t.accentSubtle;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${t.accent}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = t.border;
                e.currentTarget.style.background = t.surface;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px', color: t.textMuted }}>search</span>
              <span
                className="hidden sm:inline flex-1 text-left truncate"
                style={{ color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                Search deals, accounts...
              </span>
              <kbd
                className="hidden sm:inline-block rounded shrink-0"
                style={{
                  background: t.canvas,
                  color: t.textSecondary,
                  padding: '2px 6px',
                  border: `1px solid ${t.border}`,
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* "New Quote" Primary Action Button */}
            <Link
              href="/quotations"
              className="hidden sm:inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
              style={{
                background: t.accent,
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                padding: '0 16px',
                height: '40px',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.accentHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = t.accent; }}
            >
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px', color: '#FFFFFF' }}>add</span>
              <span>New Quote</span>
            </Link>

            {/* Vertical Divider */}
            <div
              className="h-6 w-px hidden sm:block shrink-0"
              style={{ background: t.border }}
            />

            {/* User Profile & Role Switcher Dropdown (Guaranteed room, never clipped) */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 transition-all cursor-pointer shrink-0"
                style={{
                  background: profileDropdownOpen ? t.accentSubtle : t.surface,
                  border: `1px solid ${profileDropdownOpen ? t.accent : t.border}`,
                  borderRadius: '8px',
                  padding: '4px 10px',
                  height: '40px',
                }}
              >
                {/* Neutral --border-outlined circle avatar */}
                <div
                  className="shrink-0"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: t.canvas,
                    border: `1px solid ${t.border}`,
                    color: t.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {userInitials}
                </div>
                <div className="hidden lg:flex flex-col text-left shrink-0">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: t.textPrimary, lineHeight: 1.2 }}>
                    {user.fullName || 'Enterprise User'}
                  </span>
                  {/* Small --accent-subtle chip with --accent text */}
                  <span
                    style={{
                      background: t.accentSubtle,
                      color: t.accent,
                      border: `1px solid ${t.border}`,
                      borderRadius: '4px',
                      padding: '1px 6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      marginTop: '2px',
                      width: 'fit-content',
                    }}
                  >
                    {userRole}
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm opacity-60 ml-0.5 shrink-0" style={{ color: t.textSecondary }}>
                  {profileDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Current User Header */}
                  <div className="p-4" style={{ borderBottom: `1px solid ${t.border}` }}>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: t.canvas,
                          border: `1px solid ${t.border}`,
                          color: t.textPrimary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '14px', fontWeight: 700, color: t.textPrimary, margin: 0 }} className="truncate">
                          {user.fullName || 'User'}
                        </p>
                        <p style={{ fontSize: '12px', color: t.textMuted, margin: '2px 0 0 0' }} className="truncate">
                          {user.email || 'user@dealflow360.com'}
                        </p>
                        <span
                          style={{
                            display: 'inline-block',
                            background: t.accentSubtle,
                            color: t.accent,
                            border: `1px solid ${t.border}`,
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            marginTop: '4px',
                          }}
                        >
                          Role: {userRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Persona Section */}
                  <div className="p-3">
                    <p style={{ fontSize: '11px', fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px', marginBottom: '8px' }}>
                      Switch Role Persona (Instant Demo)
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {DEMO_PERSONAS.map((persona) => {
                        const isCurrent = userRole === persona.role;
                        const isSwitching = switchingRole === persona.role;
                        return (
                          <button
                            key={persona.role}
                            type="button"
                            onClick={() => handleSwitchPersona(persona)}
                            disabled={isSwitching}
                            className="w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer"
                            style={{
                              background: isCurrent ? t.accentSubtle : 'transparent',
                              border: isCurrent ? `1px solid ${t.accent}` : '1px solid transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrent) e.currentTarget.style.background = t.canvas;
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrent) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-lg" style={{ color: t.accent }}>
                                {persona.icon}
                              </span>
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: 600, color: t.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {persona.label}
                                  {isCurrent && (
                                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: t.accent, color: '#FFFFFF', fontWeight: 700 }}>
                                      Active
                                    </span>
                                  )}
                                </p>
                                <p style={{ fontSize: '11px', color: t.textMuted, margin: 0 }}>{persona.name}</p>
                              </div>
                            </div>
                            {isSwitching ? (
                              <span className="material-symbols-outlined text-sm animate-spin" style={{ color: t.accent }}>refresh</span>
                            ) : isCurrent ? (
                              <span className="material-symbols-outlined text-base" style={{ color: t.accent }}>check</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sign out Footer */}
                  <div className="p-2" style={{ borderTop: `1px solid ${t.border}` }}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer"
                      style={{ color: t.error, fontSize: '13px', fontWeight: 600, background: 'transparent', border: 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = t.errorSubtle; }}
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
              className="xl:hidden rounded-lg transition-all shrink-0"
              style={{ padding: '6px', color: t.textSecondary, background: 'transparent', border: 'none' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Menu ────────────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div
            className="xl:hidden"
            style={{
              background: t.surface,
              borderTop: `1px solid ${t.border}`,
              padding: '12px 16px',
            }}
          >
            <div className="flex flex-col" style={{ gap: '4px' }}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                const hasAccess = item.roles.includes(userRole);
                return (
                  <Link
                    key={item.path}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg transition-all flex items-center justify-between ${!hasAccess ? 'opacity-50' : ''}`}
                    style={
                      active
                        ? {
                            background: t.accentSubtle,
                            color: t.accent,
                            fontWeight: 600,
                            fontSize: '14px',
                            textDecoration: 'none',
                          }
                        : {
                            color: t.textSecondary,
                            fontSize: '14px',
                            textDecoration: 'none',
                          }
                    }
                  >
                    <span>{item.label}</span>
                    {!hasAccess && (
                      <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>lock</span>
                    )}
                  </Link>
                );
              })}
              <div style={{ height: '1px', background: t.border, margin: '8px 0' }} />
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-lg text-left transition-all"
                style={{ color: t.error, fontSize: '14px', fontWeight: 600, background: 'transparent', border: 'none' }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Search Modal Overlay (Light Theme) ────────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24"
          style={{ background: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div
            className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
            }}
          >
            <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${t.border}` }}>
              <span className="material-symbols-outlined" style={{ color: t.textMuted }}>search</span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search deals, quotations, customers..."
                className="flex-1 bg-transparent outline-none"
                style={{ color: t.textPrimary, fontSize: '15px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false);
                  if (e.key === 'Enter') {
                    const v = (e.target as HTMLInputElement).value.trim();
                    if (v) { router.push(`/quotations?q=${encodeURIComponent(v)}`); setSearchOpen(false); }
                  }
                }}
              />
              <kbd
                className="rounded px-2 py-0.5"
                style={{
                  background: t.canvas,
                  color: t.textSecondary,
                  border: `1px solid ${t.border}`,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => setSearchOpen(false)}
              >
                ESC
              </kbd>
            </div>
            <div className="p-3 flex flex-col" style={{ gap: '2px' }}>
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
                  style={{ color: t.textSecondary, textDecoration: 'none' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = t.accentSubtle;
                    (e.currentTarget as HTMLElement).style.color = t.accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = t.textSecondary;
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: t.textMuted }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
