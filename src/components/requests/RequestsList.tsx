('use client');

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { toast } from '@/components/ui/toast';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export interface Request {
  id: number;
  user_id: number;
  book_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  message?: string;
  created_at: string;
  updated_at: string;
  username?: string;
  title?: string;
  author?: string;
}

export function RequestsList() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'fulfilled'>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/requests', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load requests');
      
      const data = await response.json();
      setRequests(data.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to approve request');
      
      toast.success('Request approved!');
      loadRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to reject request');
      
      toast.success('Request rejected');
      loadRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (requestId: number) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete request');
      
      toast.success('Request deleted');
      loadRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="p-4">Loading requests...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Requests</h2>
      
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected', 'fulfilled'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === f 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left p-3">Book</th>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Requested</th>
              {user?.role === 'admin' && <th className="text-left p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'admin' ? 5 : 4} className="p-3 text-center text-gray-500">
                  No requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map(req => (
                <tr key={req.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <div className="font-semibold">{req.title}</div>
                      <div className="text-sm text-gray-600">{req.author}</div>
                    </div>
                  </td>
                  <td className="p-3">{req.username}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {statusIcon(req.status)}
                      <span className="capitalize text-sm">{req.status}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="p-3">
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
