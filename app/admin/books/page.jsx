'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminBooks() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState([]);
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
      fetchBooks();
    }
  }, [session]);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/admin/books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      return;
    }

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Buku berhasil dihapus');
        fetchBooks(); // Refresh list
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal menghapus buku');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Terjadi kesalahan saat menghapus buku');
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
                <p className="text-sm text-gray-500">Kelola Buku</p>
              </div>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/admin/dashboard" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <i className="fas fa-tachometer-alt w-5 mr-3"></i>
                  <span className="font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/books" className="flex items-center px-4 py-3 rounded-lg bg-blue-100 text-blue-700 border-r-4 border-blue-600">
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
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Kelola Buku</h1>
                  <p className="text-gray-600 mt-2">Manajemen koleksi buku perpustakaan</p>
                </div>
                <Link
                  href="/admin/books/add"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Tambah Buku
                </Link>
              </div>
            </div>
          </header>

          <main className="p-8">
            {/* Books Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buku
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stok
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tersedia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {books.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                          <i className="fas fa-book-open text-gray-400 text-4xl mb-4"></i>
                          <p className="text-gray-500">Belum ada buku</p>
                          <Link 
                            href="/admin/books/add" 
                            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                          >
                            Tambah Buku Pertama
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      books.map((book) => (
                        <tr key={book.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={book.cover_url || '/default-book-cover.jpg'}
                                alt={book.title}
                                className="h-12 w-9 object-cover rounded mr-4"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {book.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {book.author}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {book.category_name || 'Tanpa Kategori'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {book.total_stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              book.available_stock > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {book.available_stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                href={`/admin/books/edit/${book.id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                              <Link
                                href={`/books/${book.id}`}
                                className="text-green-600 hover:text-green-900"
                                title="Lihat"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              <button
                                onClick={() => handleDelete(book.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Hapus"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}