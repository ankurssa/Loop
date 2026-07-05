'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <>
      {!isAuthPage && <Sidebar />}
      <main
        className={`h-screen overflow-hidden flex flex-col bg-sooty w-full transition-all duration-300 ${
          isAuthPage ? 'ml-0 w-full' : 'ml-0 lg:ml-[260px] lg:w-[calc(100%-260px)]'
        }`}
      >
        {children}
      </main>
    </>
  );
}
