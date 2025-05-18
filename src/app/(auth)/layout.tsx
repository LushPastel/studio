
import type { ReactNode } from 'react';
import { APP_NAME } from '@/lib/constants';
import { CircleDollarSign } from 'lucide-react'; // Changed TvMinimalPlayIcon to CircleDollarSign

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center space-x-2 text-primary">
        <CircleDollarSign className="h-10 w-10" /> {/* Changed Icon */}
        <h1 className="text-4xl font-bold tracking-tighter">{APP_NAME}</h1>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
