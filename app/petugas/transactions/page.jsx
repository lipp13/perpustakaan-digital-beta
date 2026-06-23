'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'petugas') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'petugas') {
      fetchBorrows();
    }
  }, [session]);

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/petugas/borrows');
      if (response.ok) {
        const data = await response.json();
        setBorrows(data);
      } else {
        console.error('Failed to fetch borrows');
      }
    } catch (error) {
      console.error('Error fetching borrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <i className="fas fa-user-shield text-blue-600 text-2xl"></i>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Petugas Panel</h1>
                <p className="text-sm text-gray-500">Transaksi</p>
              </div>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/petugas/dashboard"
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-tachometer-alt w-5 mr-3"></i>
                  <span className="font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/petugas/approvals"
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-check-circle w-5 mr-3"></i>
                  <span className="font-medium">Persetujuan</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/petugas/transactions"
                  className="flex items-center px-4 py-3 rounded-lg bg-blue-100 text-blue-700 border-r-4 border-blue-600"
                >
                  <i className="fas fa-exchange-alt w-5 mr-3"></i>
                  <span className="font-medium">Transaksi</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/petugas/pengembalian"
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-undo-alt w-5 mr-3"></i>
                  <span className="font-medium">Pengembalian</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="px-8 py-6">
              <h1 className="text-3xl font-bold text-gray-900">Peminjaman Aktif</h1>
              <p className="text-gray-600 mt-2">
                Kelola peminjaman buku yang sedang berlangsung
              </p>
            </div>
          </header>

          <main className="p-8">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-info-circle text-blue-600 text-2xl mr-3"></i>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total Peminjaman Aktif</p>
                    <p className="text-2xl font-bold text-blue-600">{borrows.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-clock text-yellow-600 text-2xl mr-3"></i>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Menunggu Persetujuan</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {borrows.filter(b => b.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-book-reader text-green-600 text-2xl mr-3"></i>
                  <div>
                    <p className="text-sm font-medium text-green-900">Sedang Dipinjam</p>
                    <p className="text-2xl font-bold text-green-600">
                      {borrows.filter(b => b.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Borrows List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  <i className="fas fa-list mr-2 text-blue-600"></i>
                  Daftar Peminjaman Aktif
                </h2>
              </div>
              <div className="p-6">
                {borrows.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-book-open text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Tidak ada peminjaman aktif
                    </h3>
                    <p className="text-gray-600">
                      Semua buku sudah dikembalikan atau belum ada peminjaman
                    </p>
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
                            Peminjam
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Pinjam
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tenggat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hari Tersisa
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {borrows.map((borrow) => (
                          <tr key={borrow.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <img
                                  src={borrow.book_image || '/default-book-cover.jpg'}
                                  alt={borrow.book_title}
                                  className="h-12 w-9 object-cover rounded mr-4"
                                  onError={(e) => {
                                    e.target.src = '/default-book-cover.jpg';
                                  }}
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {borrow.book_title || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {borrow.book_author || ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {borrow.user_name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {borrow.user_email || ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(borrow.borrow_start || borrow.request_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {borrow.borrow_end ? formatDate(borrow.borrow_end) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {borrow.days_remaining !== null && borrow.days_remaining !== undefined ? (
                                <span className={`text-sm font-medium ${
                                  borrow.days_remaining < 0
                                    ? 'text-red-600'
                                    : borrow.days_remaining < 3
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                                }`}>
                                  {borrow.days_remaining < 0
                                    ? `${Math.abs(borrow.days_remaining)} hari terlambat`
                                    : `${borrow.days_remaining} hari tersisa`}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={borrow.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}