import { redirect } from 'next/navigation';
import { auth } from '@/backend/auth';

export const dynamic = 'force-dynamic';

// Already signed in? Skip the login screen.
export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user) redirect('/dashboard');
  return <>{children}</>;
}
