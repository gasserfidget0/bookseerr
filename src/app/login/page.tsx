'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { toast } from '@/components/ui/toast';

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Only redirect if loading is done, a user exists, and we are still on the login page.
    if (!isLoading && user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, isLoading, pathname, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('Login successful!');
      // The useEffect hook will handle the redirect.
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  // While loading auth state, show a loading indicator.
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }
  
  // If user is already logged in, show a redirect message instead of the form.
  if (user) {
    return <div className="min-h-screen flex items-center justify-center"><p>Already logged in. Redirecting...</p></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4 text-center">Login to Bookseerr</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
