'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BookForm from '@/components/forms/BookForm';

export default function AddBook() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useState(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleSubmit = async (bookData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (res.ok) {
        alert('Buku berhasil ditambahkan');
        router.push('/admin/books');
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal menambahkan buku');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Terjadi kesalahan saat menambahkan buku');
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-sm text-gray-500">Tambah Buku</p>
              </div>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => router.back()}
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <i className="fas fa-arrow-left w-5 mr-3"></i>
                  <span className="font-medium">Kembali</span>
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
              <h1 className="text-3xl font-bold text-gray-900">Tambah Buku Baru</h1>
              <p className="text-gray-600 mt-2">Tambahkan buku baru ke koleksi perpustakaan</p>
            </div>
          </header>

          <main className="p-8">
            <div className="bg-white rounded-lg shadow p-6">
              <BookForm 
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}