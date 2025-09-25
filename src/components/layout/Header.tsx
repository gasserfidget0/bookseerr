'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
          Bookseerr
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700 dark:text-gray-200">Hi, {user.username}</span>
              <button
                onClick={() => logout()}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-gray-700 dark:text-gray-200 hover:text-blue-500">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
