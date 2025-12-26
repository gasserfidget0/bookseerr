('use client');

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { toast } from '@/components/ui/toast';
import { Users, Zap, RotateCcw } from 'lucide-react';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'sync' | 'settings'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load users');
      
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: 'admin' | 'user') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update user');
      
      toast.success('User role updated');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync/readarr', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Sync failed');
      
      const data = await response.json();
      toast.success(`Sync complete! ${data.stats.newBooksAdded} new books, ${data.stats.booksUpdated} updated`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSyncing(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
        {(['users', 'sync', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold capitalize ${
              activeTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'users' && <Users className="inline mr-2 w-4 h-4" />}
            {tab === 'sync' && <RotateCcw className="inline mr-2 w-4 h-4" />}
            {tab === 'settings' && <Zap className="inline mr-2 w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Users Management</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-3">Username</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Joined</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 font-semibold">{u.username}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as 'admin' | 'user')}
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <button className="text-red-600 hover:text-red-800">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sync Tab */}
      {activeTab === 'sync' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Library Sync</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800">
              Sync your Readarr library to update book statuses and add new books.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Readarr URL</label>
              <input
                type="text"
                placeholder={process.env.NEXT_PUBLIC_READARR_URL || 'http://localhost:8787'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                disabled
              />
              <p className="text-sm text-gray-600 mt-1">Configure in .env file</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">QBittorrent URL</label>
              <input
                type="text"
                placeholder="http://localhost:8080"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                disabled
              />
              <p className="text-sm text-gray-600 mt-1">Configure in .env file</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                To modify these settings, update your .env file and restart the application.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
