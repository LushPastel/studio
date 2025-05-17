
import { Loader2 } from 'lucide-react';

export default function AppLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]"> {/* Adjusted for header/footer height */}
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 mt-4 text-lg text-foreground">Loading page...</p>
    </div>
  );
}
