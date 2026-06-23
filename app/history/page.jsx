'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import Header from '@/components/ui/Header';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchBorrowHistory();
    }
  }, [session]);

  const fetchBorrowHistory = async () => {
    try {
      const res = await fetch('/api/borrows?user_id=' + session.user.id);
      const data = await res.json();
      setBorrows(data);
    } catch (error) {
      console.error('Error fetching borrow history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickedUp = async (borrowId) => {
    try {
      const res = await fetch(`/api/borrows/${borrowId}/picked-up`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('Konfirmasi pengambilan buku berhasil');
        fetchBorrowHistory(); // Refresh data
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal mengonfirmasi pengambilan');
      }
    } catch (error) {
      console.error('Error confirming pickup:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Peminjaman</h1>
          <p className="text-gray-600 mt-2">Lihat semua aktivitas peminjaman Anda</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {borrows.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-history text-gray-400 text-6xl mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada riwayat peminjaman</h3>
              <p className="text-gray-600">Mulai pinjam buku untuk melihat riwayat di sini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buku
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Pinjam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenggat
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
                  {borrows.map((borrow) => (
                    <tr key={borrow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={borrow.cover_url || '/default-book-cover.jpg'}
                            alt={borrow.title}
                            className="h-12 w-9 object-cover rounded mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {borrow.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {borrow.author}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(borrow.request_date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrow.borrow_end ? new Date(borrow.borrow_end).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={borrow.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {borrow.status === 'approved' && (
                          <button
                            onClick={() => handlePickedUp(borrow.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                          >
                            <i className="fas fa-check mr-1"></i>
                            Sudah Ambil
                          </button>
                        )}
                        {borrow.status === 'active' && (
                          <span className="text-green-600">
                            <i className="fas fa-clock mr-1"></i>
                            Sedang Dipinjam
                          </span>
                        )}
                        {borrow.status === 'completed' && (
                          <span className="text-blue-600">
                            <i className="fas fa-check-circle mr-1"></i>
                            Selesai
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics */}
        {borrows.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {borrows.filter(b => b.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Sedang Dipinjam</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {borrows.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Menunggu</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {borrows.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {borrows.filter(b => b.status === 'overdue').length}
              </div>
              <div className="text-sm text-gray-600">Terlambat</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}