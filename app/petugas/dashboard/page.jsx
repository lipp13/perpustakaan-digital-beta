"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PetugasDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    pendingApprovals: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");

      const response = await fetch("/api/petugas");
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Dashboard data received:", data);

        setStats({
          totalBooks: data.totalBooks || 0,
          availableBooks: data.availableBooks || 0,
          borrowedBooks: data.borrowedBooks || 0,
          pendingApprovals: data.pendingApprovals || 0,
        });
        setRecentActivity(data.recentActivity || []);

        // Check if using fallback data
        if (data._debug) {
          console.warn("Using fallback data:", data._debug);
        }
      } else {
        console.error("Failed to fetch dashboard");
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);

      // Fallback untuk development
      setStats({
        totalBooks: 10,
        availableBooks: 7,
        borrowedBooks: 3,
        pendingApprovals: 2,
      });
      setRecentActivity([
        {
          id: 1,
          book_title: "Test Book 1",
          status: "pending",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          book_title: "Test Book 2",
          status: "approved",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Menunggu';
    case 'approved': return 'Disetujui';
    case 'active': return 'Aktif';
    case 'completed': return 'Selesai';
    case 'rejected': return 'Ditolak';
    case 'overdue': return 'Terlambat';
    case 'cancelled': return 'Dibatalkan';
    default: return status;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'approved': return 'bg-blue-100 text-blue-800';
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'overdue': return 'bg-orange-100 text-orange-800';
    case 'cancelled': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

  const quickActions = [
    {
      title: "Persetujuan",
      description: "Tinjau permintaan peminjaman",
      href: "/petugas/approvals",
      color: "bg-green-500 hover:bg-green-600",
      icon: "✅",
    },
    {
      title: "Pengembalian",
      description: "Tinjau pengembalian",
      href: "/petugas/pengembalian",
      color: "bg-blue-500 hover:bg-blue-600",
      icon: "🔁",
    },
    {
      title: "Riwayat",
      description: "Lihat riwayat transaksi",
      href: "/history",
      color: "bg-red-500 hover:bg-red-600",
      icon: "📋",
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Petugas</h1>
        <p className="text-gray-600">
          Selamat datang di panel petugas perpustakaan
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Total Buku
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalBooks}
              </p>
            </div>
            <div className="text-blue-500 text-3xl">📖</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Judul buku tersedia</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Tersedia</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.availableBooks}
              </p>
            </div>
            <div className="text-green-500 text-3xl">✅</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Buku bisa dipinjam</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Dipinjam</h3>
              <p className="text-3xl font-bold text-orange-600">
                {stats.borrowedBooks}
              </p>
            </div>
            <div className="text-orange-500 text-3xl">🔖</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Sedang dipinjam</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Menunggu</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pendingApprovals}
              </p>
            </div>
            <div className="text-yellow-500 text-3xl">⏳</div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Perlu persetujuan</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div
              className={`${action.color} text-white p-6 rounded-lg shadow-md transition-colors cursor-pointer hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                  <p className="opacity-90">{action.description}</p>
                </div>
                <div className="text-3xl">{action.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Aktivitas Terbaru</h2>

        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada aktivitas terbaru</p>
            <p className="text-sm mt-1">
              Riwayat transaksi akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Buku
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Peminjam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {activity.book_title || "Unknown Book"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">
                        {activity.user_name || "Unknown User"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          activity.status
                        )}`}
                      >
                        {getStatusText(activity.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
