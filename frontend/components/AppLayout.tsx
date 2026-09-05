'use client';
import HeaderNavbar from './HeaderNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <HeaderNavbar />
      <main className="pt-16 w-full min-h-screen" style={{ background: 'var(--color-background)' }}>
        {children}
      </main>
    </div>
  );
}
