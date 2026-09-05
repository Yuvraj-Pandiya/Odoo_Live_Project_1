'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, CheckSquare, Truck,
  Receipt, Activity, Settings, LogOut, TrendingUp,
  Users, Package, ChevronRight
} from 'lucide-react';
import { getStoredUser, clearStoredAuth } from '@/lib/api';
import { canAccessRoute } from '@/lib/permissions';

const NAV = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/quotations',    icon: FileText,         label: 'Quotations' },
  { href: '/approvals',     icon: CheckSquare,      label: 'Approvals' },
  { href: '/fulfillment',   icon: Truck,            label: 'Fulfillment' },
  { href: '/subscriptions', icon: Activity,         label: 'Subscriptions' },
  { href: '/invoices',      icon: Receipt,          label: 'Invoices' },
  { href: '/deal-health',   icon: TrendingUp,       label: 'Deal Health' },
  { href: '/customers',     icon: Users,            label: 'Customers' },
  { href: '/products',      icon: Package,          label: 'Products' },
  { href: '/reports',       icon: Settings,         label: 'Reports' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>({});

  const loadUser = () => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u || {});
    }
  };

  useEffect(() => {
    loadUser();
    const handleAuth = () => loadUser();
    window.addEventListener('dealflow-auth-change', handleAuth);
    return () => window.removeEventListener('dealflow-auth-change', handleAuth);
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dealflow-auth-change'));
    }
    router.push('/');
  };

  const userRole = user?.role || 'SALES_REP';
  const visibleNav = NAV.filter(item => canAccessRoute(userRole, item.href));

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'hsl(222 47% 22%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, hsl(220 90% 56%), hsl(262 83% 58%))' }}>
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">DealFlow<span style={{ color: 'hsl(262 83% 72%)' }}>360</span></p>
            <p className="text-[10px]" style={{ color: 'hsl(215 15% 45%)' }}>Sales Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group"
              style={{
                background: active ? 'hsl(220 90% 56% / 0.15)' : 'transparent',
                color: active ? 'hsl(220 90% 70%)' : 'hsl(215 20% 65%)',
                border: active ? '1px solid hsl(220 90% 56% / 0.25)' : '1px solid transparent',
              }}>
              <Icon size={15} />
              <span>{label}</span>
              {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'hsl(222 47% 22%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
               style={{ background: 'linear-gradient(135deg, hsl(220 90% 56%), hsl(262 83% 58%))' }}>
            {user.fullName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.fullName || 'User'}</p>
            <p className="text-[10px] font-mono text-indigo-400 font-semibold">{userRole}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
          style={{ color: 'hsl(215 20% 65%)', border: '1px solid hsl(222 47% 22%)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'hsl(0 84% 70%)'; e.currentTarget.style.borderColor = 'hsl(0 84% 60% / 0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'hsl(215 20% 65%)'; e.currentTarget.style.borderColor = 'hsl(222 47% 22%)'; }}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );
}
