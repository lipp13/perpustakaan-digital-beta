'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';

export default function PetugasApprovals() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'petugas') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'petugas') {
      fetchPendingRequests();
    }
  }, [session]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/petugas/approvals'); // ✅ Ganti endpoint
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      } else {
        console.error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    if (!session?.user?.id) {
      alert('Anda harus login sebagai petugas');
      return;
    }

    const actionText = action === 'approve' ? 'menyetujui' : 'menolak';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} permintaan ini?`)) {
      return;
    }

    try {
      setProcessing(true);
      const res = await fetch('/api/petugas/approvals', { // ✅ Ganti endpoint
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          action: action,
          petugas_id: session.user.id
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        fetchPendingRequests(); // Refresh list
      } else {
        alert(result.error || `Gagal ${actionText} permintaan`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert('Terjadi kesalahan');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = (requestId) => handleAction(requestId, 'approve');
  const handleReject = (requestId) => handleAction(requestId, 'reject');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <i className="fas fa-user-shield text-blue-600 text-2xl"></i>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Petugas</h1>
                <p className="text-sm text-gray-500">Persetujuan</p>
              </div>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => router.push('/petugas/dashboard')} // ✅ Ganti ke dashboard petugas
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <i className="fas fa-arrow-left w-5 mr-3"></i>
                  <span className="font-medium">Kembali ke Dashboard</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="px-8 py-6">
              <h1 className="text-3xl font-bold text-gray-900">Persetujuan Peminjaman</h1>
              <p className="text-gray-600 mt-2">
                {pendingRequests.length} permintaan menunggu persetujuan
              </p>
            </div>
          </header>

          <main className="p-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-check-circle text-gray-400 text-6xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada permintaan</h3>
                  <p className="text-gray-600">Semua permintaan telah diproses</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User & Buku
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal Request
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <img
                                src={request.book_image || request.cover_url || '/default-book-cover.jpg'}
                                alt={request.book_title}
                                className="h-12 w-9 object-cover rounded mr-4"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {request.book_title || request.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {request.book_author || request.author}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {request.user_name} 
                                  {request.nipd && ` (${request.nipd})`}
                                  {request.email && ` - ${request.email}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(request.request_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApprove(request.id)}
                                disabled={processing}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <i className="fas fa-check mr-1"></i>
                                {processing ? 'Memproses...' : 'Setujui'}
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                disabled={processing}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <i className="fas fa-times mr-1"></i>
                                Tolak
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}