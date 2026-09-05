'use client';
import HeaderNavbar from './HeaderNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>
      <HeaderNavbar />
      <main className="flex-1 w-full" style={{ background: 'var(--color-background)' }}>
        {children}
      </main>
    </div>
  );
}
