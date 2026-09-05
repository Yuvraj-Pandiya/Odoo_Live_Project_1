'use client';
import AppLayout from '@/components/AppLayout';

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Sales trends, approval bottlenecks, and platform analytics</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {['Period', 'Sales Team / Rep', 'Approval Status', 'Product / Category'].map(f => (
            <div key={f} className="glass-card p-4">
              <p className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>Filter by</p>
              <p className="text-sm font-medium text-white mt-1">{f}</p>
            </div>
          ))}
        </div>
        <div className="glass-card p-8 text-center">
          <p style={{ color: 'hsl(215 20% 65%)' }}>Export options: PDF / XLS</p>
          <div className="flex justify-center gap-3 mt-4">
            <button className="btn-primary">Export PDF</button>
            <button className="btn-secondary">Export XLS</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
