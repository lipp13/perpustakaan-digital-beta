'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import BookForm from '@/components/forms/BookForm';

export default function EditBookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin' && params.id) {
      fetchBook();
    }
  }, [session, params.id]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data);
      } else {
        alert('Buku tidak ditemukan');
        router.push('/admin/books');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      alert('Terjadi kesalahan saat mengambil data buku');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (bookData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/books/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (res.ok) {
        alert('Buku berhasil diupdate');
        router.push('/admin/books');
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal mengupdate buku');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Terjadi kesalahan saat mengupdate buku');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data buku...</p>
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
                <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Edit Buku</p>
              </div>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => router.push('/admin/books')}
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <i className="fas fa-arrow-left w-5 mr-3"></i>
                  <span className="font-medium">Kembali ke Daftar</span>
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Buku</h1>
              <p className="text-gray-600 mt-2">
                Ubah informasi buku: <span className="font-semibold">{book?.title}</span>
              </p>
            </div>
          </header>

          <main className="p-8">
            <div className="bg-white rounded-lg shadow p-6">
              {book ? (
                <BookForm 
                  book={book}
                  onSubmit={handleSubmit}
                  loading={saving}
                  mode="edit"
                />
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
                  <p className="text-gray-700">Buku tidak ditemukan</p>
                  <button
                    onClick={() => router.push('/admin/books')}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Kembali ke Daftar Buku
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}