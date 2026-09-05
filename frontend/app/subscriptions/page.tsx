'use client';
import AppLayout from '@/components/AppLayout';

export default function SubscriptionsPage() {
  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Manage recurring billing plans and subscription lifecycles</p>
        </div>
        <div className="glass-card p-8 text-center">
          <p style={{ color: 'hsl(215 20% 65%)' }}>Subscriptions are created automatically when a confirmed order contains recurring lines.</p>
          <p className="text-sm mt-2" style={{ color: 'hsl(215 15% 45%)' }}>Module ready — data comes from <code>/api/subscriptions</code></p>
        </div>
      </div>
    </AppLayout>
  );
}
