'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('dealflow_token');
    if (!token) { router.replace('/login'); return; }
    setReady(true);
  }, [router]);

  if (!ready) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'hsl(222 47% 7%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow"
             style={{ background: 'linear-gradient(135deg, hsl(220 90% 56%), hsl(262 83% 58%))' }}>
          <span className="text-white font-bold text-sm">D</span>
        </div>
        <div className="w-5 h-5 animate-spin border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'hsl(222 47% 7%)' }}>
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
