'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import HeaderNavbar from './HeaderNavbar';
import { getStoredUser, getStoredToken } from '@/lib/api';
import { canAccessRoute } from '@/lib/permissions';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      if (typeof window === 'undefined') return;

      const token = getStoredToken();
      // If no token on protected route, redirect to root landing/login
      if (!token && !pathname.startsWith('/portal') && pathname !== '/login' && pathname !== '/register' && pathname !== '/signup' && pathname !== '/') {
        router.replace('/');
        return;
      }

      const user = getStoredUser();
      const userRole = user?.role || 'SALES_REP';

      // Check route access whitelist
      if (!canAccessRoute(userRole, pathname)) {
        setAuthorized(false);
        router.replace('/dashboard');
        return;
      }

      setAuthorized(true);
    };

    checkAccess();

    window.addEventListener('dealflow-auth-change', checkAccess);
    return () => window.removeEventListener('dealflow-auth-change', checkAccess);
  }, [pathname, router]);

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--canvas, #F0F2F7)' }}>
      <HeaderNavbar />
      <main
        className="flex-1 w-full"
        style={{
          background: 'var(--canvas, #F0F2F7)',
          padding: '32px',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {authorized ? children : (
            <div className="flex items-center justify-center p-12 text-sm text-gray-500">
              Verifying role access...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
