
import { redirect } from 'next/navigation';

export default function RootRedirectPage() {
  redirect('/home'); // Redirect to the new home page
  return null; 
}
