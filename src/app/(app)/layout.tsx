
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-24"> {/* Added padding-bottom for footer */}
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
