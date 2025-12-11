'use client';

import { useState, useEffect } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('borrow'); // 'borrow' or 'return'

  // Form states
  const [formData, setFormData] = useState({
    bookId: '',
    userId: '',
    transactionType: 'borrow'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/petugas/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/petugas/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Transaksi berhasil diproses!');
        setFormData({ bookId: '', userId: '', transactionType: 'borrow' });
        fetchTransactions(); // Refresh list
      } else {
        alert('Gagal memproses transaksi');
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Kelola Transaksi</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setSelectedAction('borrow')}
          className={`p-4 rounded-lg border ${
            selectedAction === 'borrow' 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          <h3 className="font-semibold">Peminjaman Buku</h3>
          <p className="text-sm">Proses peminjaman baru</p>
        </button>

        <button
          onClick={() => setSelectedAction('return')}
          className={`p-4 rounded-lg border ${
            selectedAction === 'return' 
              ? 'bg-green-500 text-white border-green-500' 
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          <h3 className="font-semibold">Pengembalian Buku</h3>
          <p className="text-sm">Proses pengembalian</p>
        </button>
      </div>

      {/* Transaction Form */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {selectedAction === 'borrow' ? 'Form Peminjaman' : 'Form Pengembalian'}
        </h2>

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">ID Buku</label>
            <input
              type="text"
              name="bookId"
              value={formData.bookId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Masukkan ID buku"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ID User/anggota</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Masukkan ID anggota"
              required
            />
          </div>

          <input
            type="hidden"
            name="transactionType"
            value={selectedAction}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded text-white font-semibold ${
              selectedAction === 'borrow' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-green-500 hover:bg-green-600'
            } disabled:opacity-50`}
          >
            {loading ? 'Memproses...' : 
             selectedAction === 'borrow' ? 'Proses Peminjaman' : 'Proses Pengembalian'}
          </button>
        </form>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4">Transaksi Terbaru</h2>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">ID</th>
                  <th className="border p-2 text-left">Buku</th>
                  <th className="border p-2 text-left">Anggota</th>
                  <th className="border p-2 text-left">Tipe</th>
                  <th className="border p-2 text-left">Tanggal</th>
                  <th className="border p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="border p-2">{transaction.id}</td>
                    <td className="border p-2">{transaction.bookTitle}</td>
                    <td className="border p-2">{transaction.userName}</td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.type === 'borrow' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.type === 'borrow' ? 'Pinjam' : 'Kembali'}
                      </span>
                    </td>
                    <td className="border p-2">{transaction.date}</td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status === 'active' ? 'Aktif' : 'Selesai'}
                      </span>
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