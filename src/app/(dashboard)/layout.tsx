import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

async function AuthenticatedSidebar() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const user = token ? await verifyToken(token) : null;
  return <Sidebar user={user || undefined} />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      <Suspense
        fallback={
          <aside className="w-64 bg-white border-r border-slate-200 h-screen" />
        }
      >
        <AuthenticatedSidebar />
      </Suspense>
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}