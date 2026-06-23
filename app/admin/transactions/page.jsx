"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchTransactions();
    }
  }, [session, filterStatus, pagination.page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: filterStatus,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/admin/transactions?${params}`);
      const result = await response.json();

      if (response.ok) {
        setTransactions(result.data || []);
        setPagination((prev) => ({
          ...prev,
          total: result.pagination?.total || 0,
          totalPages: result.pagination?.totalPages || 0,
        }));
      } else {
        console.error("Error fetching transactions:", result.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <i className="fas fa-cog text-blue-600 text-2xl"></i>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-500">Transaksi</p>
              </div>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-tachometer-alt w-5 mr-3"></i>
                  <span className="font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/books"
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-book w-5 mr-3"></i>
                  <span className="font-medium">Kelola Buku</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-users w-5 mr-3"></i>
                  <span className="font-medium">Kelola User</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/transactions"
                  className="flex items-center px-4 py-3 rounded-lg bg-blue-100 text-blue-700 border-r-4 border-blue-600"
                >
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
              <h1 className="text-3xl font-bold text-gray-900">
                History Peminjaman
              </h1>
              <p className="text-gray-600 mt-2">
                Semua transaksi peminjaman buku
              </p>
            </div>
          </header>

          <main className="p-8">
            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Filter Status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="approved">Disetujui</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Ditolak</option>
                  <option value="overdue">Terlambat</option>
                </select>
                <div className="text-sm text-gray-600">
                  Total: {pagination.total} transaksi
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-book-open text-gray-400 text-6xl mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tidak ada data transaksi
                  </h3>
                  <p className="text-gray-600">
                    {filterStatus !== "all"
                      ? `Tidak ada transaksi dengan status "${filterStatus}"`
                      : "Belum ada history peminjaman"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Buku
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Request
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tenggat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Petugas
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{transaction.id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.user_name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.user_email ||
                                  transaction.user_nipd ||
                                  ""}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {transaction.book_image && (
                                  <img
                                    src={transaction.book_image}
                                    alt={transaction.book_title}
                                    className="h-12 w-9 object-cover rounded mr-3"
                                    onError={(e) => {
                                      e.target.src = "/default-book-cover.jpg";
                                    }}
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {transaction.book_title || "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {transaction.book_author || ""}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transaction.request_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.borrow_end ? (
                                <div>
                                  <div>
                                    {formatDate(transaction.borrow_end)}
                                  </div>
                                  {transaction.days_remaining !== null && (
                                    <div
                                      className={`text-xs ${
                                        transaction.days_remaining < 0
                                          ? "text-red-600"
                                          : transaction.days_remaining < 3
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {transaction.days_remaining < 0
                                        ? `${Math.abs(
                                            transaction.days_remaining
                                          )} hari terlambat`
                                        : `${transaction.days_remaining} hari tersisa`}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={transaction.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.petugas_name || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Menampilkan{" "}
                        {(pagination.page - 1) * pagination.limit + 1} -{" "}
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}{" "}
                        dari {pagination.total} transaksi
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page - 1,
                            }))
                          }
                          disabled={pagination.page === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sebelumnya
                        </button>
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page + 1,
                            }))
                          }
                          disabled={pagination.page >= pagination.totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
