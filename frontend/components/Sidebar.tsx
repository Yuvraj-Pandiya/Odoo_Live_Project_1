'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, CheckSquare, Truck,
  Receipt, Activity, Settings, LogOut, TrendingUp,
  Users, Package, ChevronRight, Lock
} from 'lucide-react';
import { getStoredUser, clearStoredAuth } from '@/lib/api';

const NAV = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',     roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { href: '/quotations',    icon: FileText,         label: 'Quotations',    roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { href: '/approvals',     icon: CheckSquare,      label: 'Approvals',     roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
  { href: '/fulfillment',   icon: Truck,            label: 'Fulfillment',   roles: ['ADMIN', 'MANAGER'] },
  { href: '/subscriptions', icon: Activity,         label: 'Subscriptions', roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { href: '/invoices',      icon: Receipt,          label: 'Invoices',      roles: ['ADMIN', 'FINANCE'] },
  { href: '/deal-health',   icon: TrendingUp,       label: 'Deal Health',   roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { href: '/customers',     icon: Users,            label: 'Customers',     roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { href: '/products',      icon: Package,          label: 'Products',      roles: ['ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'] },
  { href: '/reports',       icon: Settings,         label: 'Reports',       roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = () => {
    clearStoredAuth();
    router.push('/login');
  };

  const userRole = user.role || 'SALES_REP';

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
        {NAV.map(({ href, icon: Icon, label, roles }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const hasAccess = roles.includes(userRole);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${!hasAccess ? 'opacity-40' : ''}`}
              style={{
                background: active ? 'hsl(220 90% 56% / 0.15)' : 'transparent',
                color: active ? 'hsl(220 90% 70%)' : 'hsl(215 20% 65%)',
                border: active ? '1px solid hsl(220 90% 56% / 0.25)' : '1px solid transparent',
              }}>
              <Icon size={15} />
              <span>{label}</span>
              {!hasAccess && <Lock size={12} className="ml-auto opacity-50" />}
              {active && hasAccess && <ChevronRight size={12} className="ml-auto opacity-60" />}
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
