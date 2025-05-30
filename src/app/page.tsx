
import { redirect } from 'next/navigation';

export default function RootRedirectPage() {
  // Redirect to the root of the authenticated app section,
  // which will be handled by src/app/(app)/page.tsx, which then redirects to /home
  redirect('/home'); 
  return null;
}
