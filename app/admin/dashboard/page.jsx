'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <i className="fas fa-cog text-blue-600 text-2xl"></i>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/admin/dashboard" className="flex items-center px-4 py-3 rounded-lg bg-blue-100 text-blue-700 border-r-4 border-blue-600">
                  <i className="fas fa-tachometer-alt w-5 mr-3"></i>
                  <span className="font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/books" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <i className="fas fa-book w-5 mr-3"></i>
                  <span className="font-medium">Kelola Buku</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <i className="fas fa-users w-5 mr-3"></i>
                  <span className="font-medium">Kelola User</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/transactions" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <i className="fas fa-exchange-alt w-5 mr-3"></i>
                  <span className="font-medium">Transaksi</span>
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600 mt-2">Overview sistem perpustakaan</p>
            </div>
          </header>

          <main className="p-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <i className="fas fa-book text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Buku</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalBooks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <i className="fas fa-users text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total User</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <i className="fas fa-clock text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pendingBorrows || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.overdueBorrows || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/books/add" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <i className="fas fa-plus-circle text-blue-600 text-2xl mr-4"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Tambah Buku</h3>
                    <p className="text-gray-600 text-sm">Tambah buku baru ke koleksi</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <i className="fas fa-user-plus text-green-600 text-2xl mr-4"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Tambah User</h3>
                    <p className="text-gray-600 text-sm">Tambah user admin/petugas</p>
                  </div>
                </div>
              </Link>

              <Link href="/books" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <i className="fas fa-book-open text-purple-600 text-2xl mr-4"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Lihat Koleksi</h3>
                    <p className="text-gray-600 text-sm">Lihat semua buku</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Recent Activity Section */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terkini</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-gray-400 text-4xl mb-4"></i>
                  <p className="text-gray-500">Fitur aktivitas terkini dalam pengembangan</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}