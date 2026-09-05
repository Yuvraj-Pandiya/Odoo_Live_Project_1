'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const NAV_ITEMS = [
  { path: 'dashboard',     label: 'Dashboard',     href: '/dashboard' },
  { path: 'quotations',    label: 'Quotations',    href: '/quotations' },
  { path: 'approvals',     label: 'Approvals',     href: '/approvals' },
  { path: 'fulfillment',   label: 'Fulfillment',   href: '/fulfillment' },
  { path: 'subscriptions', label: 'Subscriptions', href: '/subscriptions' },
  { path: 'invoices',      label: 'Invoices',      href: '/invoices' },
  { path: 'deal-health',   label: 'Deal Health',   href: '/deal-health' },
  { path: 'reports',       label: 'Reports',       href: '/reports' },
];

export default function HeaderNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setUser(JSON.parse(localStorage.getItem('dealflow_user') || '{}'));
      } catch { setUser({}); }
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setMobileMenuOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dealflow_token');
    localStorage.removeItem('dealflow_user');
    router.push('/login');
  };

  const isActive = (path: string) =>
    pathname === `/${path}` || pathname.startsWith(`/${path}/`);

  const userInitials = user.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      {/* ── Main Header ─────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'color-mix(in srgb, var(--color-surface-container-lowest) 80%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
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
                background: 'color-mix(in srgb, var(--color-surface-container-low) 60%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-outline-variant) 20%, transparent)',
              }}
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.href}
                    className="px-3 py-1.5 rounded-lg transition-all text-label-md"
                    style={
                      active
                        ? {
                            background: 'var(--color-surface-container-high)',
                            color: 'var(--color-on-surface)',
                            fontWeight: 700,
                            border: '1px solid color-mix(in srgb, var(--color-outline-variant) 60%, transparent)',
                            boxShadow: '0 0 12px rgba(77,142,255,0.15)',
                          }
                        : {
                            color: 'var(--color-on-surface-variant)',
                            border: '1px solid transparent',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--color-surface-container-high)';
                        e.currentTarget.style.color = 'var(--color-on-surface)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-on-surface-variant)';
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Right: Search + Notifications + User ─────────────── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Bar */}
            <button
              type="button"
              onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
              className="flex items-center gap-2 rounded-lg transition-all cursor-pointer"
              style={{
                background: 'var(--color-surface-container)',
                border: '1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)',
                color: 'var(--color-on-surface-variant)',
                padding: '0.375rem 0.75rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-outline)' }}>search</span>
              <span className="text-body-sm hidden md:inline" style={{ color: 'var(--color-on-surface-variant)' }}>
                Search deals, accounts...
              </span>
              <kbd
                className="hidden md:inline-block text-label-sm rounded"
                style={{
                  background: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface-variant)',
                  padding: '0.1rem 0.35rem',
                  border: '1px solid color-mix(in srgb, var(--color-outline-variant) 60%, transparent)',
                  fontSize: '11px',
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-lg transition-all cursor-pointer"
              style={{ padding: '0.375rem', color: 'var(--color-on-surface-variant)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-container-high)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-on-surface)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-on-surface-variant)';
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 animate-pulse"
                style={{
                  background: 'var(--color-error)',
                  boxShadow: '0 0 0 2px var(--color-surface-container-lowest)',
                }}
              />
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
              style={{ background: 'color-mix(in srgb, var(--color-outline-variant) 40%, transparent)' }}
            />

            {/* User Avatar */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-1 transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-container), var(--color-secondary-container))',
                  color: 'white',
                  boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-outline-variant) 60%, transparent)',
                }}
              >
                {userInitials}
              </div>
              <div className="hidden 2xl:flex flex-col text-left">
                <span className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>
                  {user.fullName || 'User'}
                </span>
                <span className="text-label-sm" style={{ color: 'var(--color-outline)' }}>
                  {user.role || 'Sales'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden 2xl:flex rounded-lg transition-all cursor-pointer"
                style={{ padding: '0.25rem', color: 'var(--color-on-surface-variant)' }}
                title="Sign out"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
              </button>
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
              background: 'var(--color-surface-container-low)',
              borderTop: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
              padding: '0.75rem',
            }}
          >
            <div className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-label-md transition-all"
                    style={
                      active
                        ? {
                            background: 'var(--color-surface-container-high)',
                            color: 'var(--color-on-surface)',
                            fontWeight: 700,
                          }
                        : { color: 'var(--color-on-surface-variant)' }
                    }
                  >
                    {item.label}
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
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: 'var(--color-surface-container)',
              border: '1px solid var(--color-outline-variant)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>search</span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search deals, quotations, customers..."
                className="flex-1 bg-transparent outline-none text-body-lg"
                style={{ color: 'var(--color-on-surface)' }}
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
