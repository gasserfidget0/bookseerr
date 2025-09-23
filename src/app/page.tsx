import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function HomePage() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth-token');

  if (authToken) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
