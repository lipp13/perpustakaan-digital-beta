'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/ui/Header';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const [borrowsRes, statsRes] = await Promise.all([
        fetch('/api/borrows?user_id=' + session.user.id),
        fetch('/api/borrows/stats?user_id=' + session.user.id)
      ]);

      const borrowsData = await borrowsRes.json();
      const statsData = await statsRes.json();

      setRecentBorrows(borrowsData.slice(0, 5));
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Selamat datang kembali, {session?.user?.name}!
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="fas fa-book text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sedang Dipinjam</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menunggu</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className="fas fa-check text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
          </div>
          <div className="p-6">
            {recentBorrows.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-book-open text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-500">Belum ada aktivitas peminjaman</p>
                <Link 
                  href="/books" 
                  className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Jelajahi Buku
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBorrows.map((borrow) => (
                  <div key={borrow.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={borrow.cover_url || '/default-book-cover.jpg'} 
                        alt={borrow.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{borrow.title}</h3>
                        <p className="text-sm text-gray-600">Oleh: {borrow.author}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          borrow.status === 'active' ? 'bg-green-100 text-green-800' :
                          borrow.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          borrow.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {borrow.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(borrow.request_date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/books" 
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <i className="fas fa-search text-blue-600 text-2xl mr-4"></i>
              <div>
                <h3 className="font-semibold text-gray-900">Jelajahi Koleksi</h3>
                <p className="text-gray-600 text-sm">Temukan buku-buku menarik</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/history" 
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <i className="fas fa-history text-green-600 text-2xl mr-4"></i>
              <div>
                <h3 className="font-semibold text-gray-900">Riwayat Peminjaman</h3>
                <p className="text-gray-600 text-sm">Lihat semua aktivitas Anda</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}