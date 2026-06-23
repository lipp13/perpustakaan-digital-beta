"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

export default function PetugasDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    pendingApprovals: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== "petugas") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "petugas") {
      fetchDashboardData();
    }
  }, [session]);

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
          activeBorrows: data.activeBorrows || 0,
          overdueBorrows: data.overdueBorrows || 0,
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
      case "pending":
        return "Menunggu";
      case "approved":
        return "Disetujui";
      case "active":
        return "Aktif";
      case "completed":
        return "Selesai";
      case "rejected":
        return "Ditolak";
      case "overdue":
        return "Terlambat";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "overdue":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const quickActions = [
    {
      title: "Persetujuan Peminjaman",
      description: `${stats.pendingApprovals} permintaan menunggu persetujuan`,
      href: "/petugas/approvals",
      color:
        "bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700",
      icon: "fas fa-check-circle",
      count: stats.pendingApprovals,
      action: "Tinjau & Setujui/Tolak permintaan peminjaman baru",
    },
    {
      title: "Peminjaman Aktif",
      description: `${stats.activeBorrows} buku sedang dipinjam`,
      href: "/petugas/transactions",
      color:
        "bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800",
      icon: "fas fa-book-reader",
      count: stats.activeBorrows,
      action: "Lihat & kelola peminjaman yang sedang berlangsung",
    },
    {
      title: "Pengembalian Buku",
      description: "Proses pengembalian buku yang sudah dipinjam",
      href: "/petugas/pengembalian",
      color:
        "bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800",
      icon: "fas fa-undo-alt",
      action: "Terima pengembalian buku dari anggota",
    },
    {
      title: "Riwayat Lengkap",
      description: "Lihat semua history transaksi peminjaman",
      href: "/petugas/transactions",
      color:
        "bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800",
      icon: "fas fa-history",
      action: "Akses riwayat lengkap semua transaksi",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
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
                <h1 className="text-lg font-semibold text-gray-900">
                  Petugas Panel
                </h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/petugas/dashboard"
                  className="flex items-center px-4 py-3 rounded-lg bg-blue-100 text-blue-700 border-r-4 border-blue-600"
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
                  {stats.pendingApprovals > 0 && (
                    <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      {stats.pendingApprovals}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href="/petugas/transactions"
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard Petugas
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Selamat datang kembali, {session?.user?.name || "Petugas"}!
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Hari ini</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <i className="fas fa-book text-2xl"></i>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.totalBooks}</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">Total Buku</h3>
                <p className="text-blue-100 text-sm">Semua koleksi buku</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <i className="fas fa-check-circle text-2xl"></i>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.availableBooks}</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">Buku Tersedia</h3>
                <p className="text-green-100 text-sm">Siap untuk dipinjam</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <i className="fas fa-book-reader text-2xl"></i>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{stats.borrowedBooks}</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">Sedang Dipinjam</h3>
                <p className="text-orange-100 text-sm">Buku yang dipinjam</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <i className="fas fa-clock text-2xl"></i>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      {stats.pendingApprovals}
                    </p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  Menunggu Persetujuan
                </h3>
                <p className="text-yellow-100 text-sm">Perlu ditinjau</p>
              </div>
            </div>

            {/* Additional Stats */}
            {(stats.activeBorrows > 0 || stats.overdueBorrows > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {stats.activeBorrows > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">
                          Peminjaman Aktif
                        </h3>
                        <p className="text-3xl font-bold text-purple-600 mt-2">
                          {stats.activeBorrows}
                        </p>
                      </div>
                      <i className="fas fa-bookmark text-purple-500 text-4xl"></i>
                    </div>
                  </div>
                )}
                {stats.overdueBorrows > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">
                          Terlambat
                        </h3>
                        <p className="text-3xl font-bold text-red-600 mt-2">
                          {stats.overdueBorrows}
                        </p>
                      </div>
                      <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <i className="fas fa-bolt mr-2 text-yellow-500"></i>
                Aksi Cepat
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div
                      className={`${action.color} text-white p-6 rounded-xl shadow-lg transition-all cursor-pointer hover:shadow-xl hover:scale-105 transform relative overflow-hidden`}
                    >
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <i className={`${action.icon} text-2xl`}></i>
                          </div>
                          {action.count !== undefined && action.count > 0 && (
                            <span className="bg-white/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                              {action.count}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {action.title}
                        </h3>
                        <p className="text-white/90 text-sm mb-2">
                          {action.description}
                        </p>
                        {action.action && (
                          <p className="text-white/70 text-xs italic mt-2">
                            <i className="fas fa-info-circle mr-1"></i>
                            {action.action}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    <i className="fas fa-history mr-2 text-blue-600"></i>
                    Aktivitas Terbaru
                  </h2>
                  <Link
                    href="/petugas/transactions"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    Lihat Semua Transaksi{" "}
                    <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-inbox text-gray-400 text-6xl mb-4"></i>
                    <p className="text-gray-600 font-medium">
                      Belum ada aktivitas terbaru
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Riwayat transaksi akan muncul di sini
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <i className="fas fa-book text-blue-600"></i>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {activity.book_title || "Unknown Book"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              <i className="fas fa-user mr-1"></i>
                              {activity.user_name || "Unknown User"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <StatusBadge status={activity.status} />
                            <p className="text-xs text-gray-500 mt-2">
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
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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
