'use client';
import HeaderNavbar from './HeaderNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
          {children}
        </div>
      </main>
    </div>
  );
}
