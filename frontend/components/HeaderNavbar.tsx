'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { authApi, getStoredUser, clearStoredAuth } from '@/lib/api';
import { getNavItemsForRole, canCreateQuotation, canAccessRoute } from '@/lib/permissions';

/* ─── Light Workspace Tokens ─────────────────────────────────────────────── */
const t = {
  surface:       '#FFFFFF',
  canvas:        '#F5F5F3',
  border:        '#DCDCD9',
  textPrimary:   '#1F1F1C',
  textSecondary: '#4B4B42',
  textMuted:     '#91918F',
  accent:        '#4B4B42',
  accentHover:   '#373730',
  accentSubtle:  '#ECECE9',
  error:         '#DC2626',
  errorSubtle:   '#FEE2E2',
};

export default function HeaderNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const loadUserFromSession = async () => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u || {});

      // Optionally refresh session info from backend if token is active
      try {
        const res = await authApi.session();
        if (res.data && res.data.role) {
          setUser((prev: any) => ({
            ...prev,
            userId: res.data.userId,
            id: res.data.userId,
            email: res.data.email,
            role: res.data.role,
            fullName: res.data.fullName,
            department: res.data.department,
          }));
        }
      } catch {
        // JWT decode fallback already in getStoredUser()
      }
    }
  };

  useEffect(() => {
    loadUserFromSession();

    const handleAuthChange = () => {
      loadUserFromSession();
    };

    window.addEventListener('dealflow-auth-change', handleAuthChange);
    return () => window.removeEventListener('dealflow-auth-change', handleAuthChange);
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

  // Check scroll positions for sliding nav controls
  const checkNavScroll = useCallback(() => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  const userRole = (user?.role || 'SALES_REP').toUpperCase();
  const visibleNavItems = getNavItemsForRole(userRole);
  const showNewQuoteButton = canCreateQuotation(userRole);

  useEffect(() => {
    checkNavScroll();
    const handleResize = () => checkNavScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visibleNavItems, checkNavScroll]);

  // Auto-scroll active item into view on route change
  useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
      setTimeout(checkNavScroll, 350);
    }
  }, [pathname, checkNavScroll]);

  const slideNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = 240;
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkNavScroll, 300);
    }
  };

  const handleNavWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (navRef.current && (e.deltaY !== 0 || e.deltaX !== 0)) {
      navRef.current.scrollLeft += (e.deltaY || e.deltaX);
      checkNavScroll();
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dealflow-auth-change'));
    }
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === 'dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(`/${path}`);
  };

  const userInitials = user.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : (userRole ? userRole.slice(0, 2) : 'DF');

  const SEARCH_ITEMS = [
    { label: 'Quotations', icon: 'receipt_long', href: '/quotations' },
    { label: 'Approvals', icon: 'approval', href: '/approvals' },
    { label: 'Invoices', icon: 'payments', href: '/invoices' },
    { label: 'Fulfillment', icon: 'local_shipping', href: '/fulfillment' },
    { label: 'Subscriptions', icon: 'autorenew', href: '/subscriptions' },
    { label: 'Deal Health', icon: 'health_metrics', href: '/deal-health' },
    { label: 'Reports', icon: 'bar_chart', href: '/reports' },
  ].filter((item) => canAccessRoute(userRole, item.href));

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
          style={{ height: '72px', padding: '0 20px' }}
          className="w-full flex items-center justify-between gap-3 md:gap-4"
        >
          {/* ── Left: Logo + Plan Badge + Smooth Sliding Navigation ───────────────── */}
          <div className="flex items-center gap-4 min-w-0 flex-1 overflow-hidden">
            {/* Logo + Enterprise Badge */}
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0" style={{ textDecoration: 'none' }}>
              <Image
                src="/logo.svg"
                alt="DealFlow360 Logo"
                width={132}
                height={32}
                className="h-7 w-auto object-contain shrink-0"
                priority
              />
              <span
                style={{
                  background: t.accentSubtle,
                  color: t.accent,
                  border: `1px solid ${t.border}`,
                  borderRadius: '9999px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
                className="hidden 2xl:inline-flex shrink-0"
              >
                Enterprise
              </span>
            </Link>

            {/* ── Smooth Sliding Desktop Navigation Bar ─────────────────────── */}
            <div className="hidden lg:flex items-center min-w-0 flex-1 relative overflow-hidden px-1">
              {/* Left Slide Arrow */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => slideNav('left')}
                  className="absolute left-0 z-20 flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    width: '28px',
                    height: '34px',
                    background: 'linear-gradient(to right, #FFFFFF 70%, rgba(255,255,255,0))',
                    border: 'none',
                    color: t.accent,
                  }}
                  title="Scroll left"
                >
                  <span
                    className="material-symbols-outlined rounded-full flex items-center justify-center shadow-sm"
                    style={{
                      fontSize: '18px',
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      width: '24px',
                      height: '24px',
                    }}
                  >
                    chevron_left
                  </span>
                </button>
              )}

              {/* Scrollable Nav Track */}
              <nav
                ref={navRef}
                onScroll={checkNavScroll}
                onWheel={handleNavWheel}
                className="flex items-center gap-1 overflow-x-auto scroll-smooth w-full py-1"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {visibleNavItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.href}
                      data-active={active ? 'true' : 'false'}
                      className="transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      style={
                        active
                          ? {
                              background: t.accentSubtle,
                              color: t.accent,
                              fontWeight: 600,
                              fontSize: '13.5px',
                              padding: '7px 11px',
                              borderRadius: '7px 7px 0 0',
                              borderBottom: `2px solid ${t.accent}`,
                              textDecoration: 'none',
                            }
                          : {
                              color: t.textSecondary,
                              fontWeight: 500,
                              fontSize: '13.5px',
                              padding: '7px 11px',
                              borderRadius: '7px',
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
                    </Link>
                  );
                })}
              </nav>

              {/* Right Slide Arrow */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => slideNav('right')}
                  className="absolute right-0 z-20 flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    width: '28px',
                    height: '34px',
                    background: 'linear-gradient(to left, #FFFFFF 70%, rgba(255,255,255,0))',
                    border: 'none',
                    color: t.accent,
                  }}
                  title="Scroll right"
                >
                  <span
                    className="material-symbols-outlined rounded-full flex items-center justify-center shadow-sm"
                    style={{
                      fontSize: '18px',
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      width: '24px',
                      height: '24px',
                    }}
                  >
                    chevron_right
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* ── Right Cluster: Search + Role-Scoped New Quote + User Profile ── */}
          <div className="flex items-center shrink-0 gap-2 sm:gap-3">
            {/* Search Input Button */}
            <button
              type="button"
              onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
              className="flex items-center gap-2 transition-all cursor-pointer shrink-0"
              style={{
                width: 'clamp(150px, 16vw, 220px)',
                height: '38px',
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: '8px',
                color: t.textMuted,
                padding: '0 10px',
                fontSize: '13.5px',
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
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '17px', color: t.textMuted }}>search</span>
              <span
                className="hidden sm:inline flex-1 text-left truncate"
                style={{ color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                Search deals...
              </span>
              <kbd
                className="hidden md:inline-block rounded shrink-0"
                style={{
                  background: t.canvas,
                  color: t.textSecondary,
                  padding: '1px 5px',
                  border: `1px solid ${t.border}`,
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* "New Quote" Primary Action Button (Only visible for roles permitted to create quotes) */}
            {showNewQuoteButton && (
              <Link
                href="/quotations"
                className="hidden sm:inline-flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                style={{
                  background: t.accent,
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  padding: '0 14px',
                  height: '38px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.accentHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = t.accent; }}
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '17px', color: '#FFFFFF' }}>add</span>
                <span>New Quote</span>
              </Link>
            )}

            {/* Vertical Divider */}
            <div
              className="h-6 w-px hidden sm:block shrink-0"
              style={{ background: t.border }}
            />

            {/* Real Session User Profile Dropdown (No fake persona switcher) */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 transition-all cursor-pointer shrink-0"
                style={{
                  background: profileDropdownOpen ? t.accentSubtle : t.surface,
                  border: `1px solid ${profileDropdownOpen ? t.accent : t.border}`,
                  borderRadius: '8px',
                  padding: '3px 8px',
                  height: '38px',
                }}
              >
                {/* Avatar */}
                <div
                  className="shrink-0"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: t.canvas,
                    border: `1px solid ${t.border}`,
                    color: t.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {userInitials}
                </div>
                <div className="hidden xl:flex flex-col text-left shrink-0">
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, lineHeight: 1.2 }}>
                    {user.fullName || user.email || 'Enterprise User'}
                  </span>
                  <span
                    style={{
                      background: t.accentSubtle,
                      color: t.accent,
                      border: `1px solid ${t.border}`,
                      borderRadius: '4px',
                      padding: '1px 5px',
                      fontSize: '10px',
                      fontWeight: 600,
                      marginTop: '1px',
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

              {/* Secure Session Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Actual Authenticated User Header */}
                  <div className="p-4" style={{ borderBottom: `1px solid ${t.border}` }}>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: t.canvas,
                          border: `1px solid ${t.border}`,
                          color: t.textPrimary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
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
                          {user.email || 'user@company.com'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              background: '#EEF2FF',
                              color: '#4F46E5',
                              border: '1px solid #C7D2FE',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            Role: {userRole}
                          </span>
                          {user.department && (
                            <span
                              style={{
                                display: 'inline-block',
                                background: t.accentSubtle,
                                color: t.textSecondary,
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '10px',
                                fontWeight: 500,
                              }}
                            >
                              {user.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Single Sign out Action */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all cursor-pointer"
                      style={{ color: t.error, fontSize: '13px', fontWeight: 600, background: 'transparent', border: 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = t.errorSubtle; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="lg:hidden rounded-lg transition-all shrink-0"
              style={{ padding: '6px', color: t.textSecondary, background: 'transparent', border: 'none' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Menu (Role filtered) ─────────────────────────────────── */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden"
            style={{
              background: t.surface,
              borderTop: `1px solid ${t.border}`,
              padding: '12px 16px',
            }}
          >
            <div className="flex flex-col" style={{ gap: '4px' }}>
              {visibleNavItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg transition-all flex items-center justify-between"
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

      {/* ── Search Modal Overlay (Role Filtered) ────────────────────────────────── */}
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
              {SEARCH_ITEMS.map((item) => (
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
