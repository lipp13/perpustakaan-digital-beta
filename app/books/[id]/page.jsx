"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/ui/Header";

export default function BookDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchBook();
    }
  }, [session, params.id]);

  const fetchBook = async () => {
  try {
    console.log("Fetching book with ID:", params.id); // Debug
    
    const res = await fetch(`/api/books/${params.id}`);
    console.log("Response status:", res.status); // Debug
    
    const data = await res.json();
    console.log("API Response data:", data); // Debug

    if (res.ok) {
      setBook(data);
    } else {
      console.error("API Error:", data.error);
      setBook(null);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    setBook(null);
  } finally {
    setLoading(false);
  }
};

  const handleBorrow = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setBorrowing(true);
    try {
      const res = await fetch("/api/borrows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_id: params.id,
          borrow_days: 7,
        }),
      });

      if (res.ok) {
        alert("Permintaan peminjaman berhasil dikirim!");
        fetchBook(); // Refresh book data
      } else {
        const error = await res.json();
        alert(error.error || "Gagal mengajukan peminjaman");
      }
    } catch (error) {
      console.error("Error borrowing book:", error);
      alert("Terjadi kesalahan saat mengajukan peminjaman");
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-book-open text-gray-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Buku tidak ditemukan
          </h2>
          <Link href="/books" className="text-blue-600 hover:text-blue-700">
            Kembali ke koleksi buku
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/books" className="text-gray-600 hover:text-gray-900">
              <i className="fas fa-arrow-left mr-2"></i>
              Kembali
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Detail Buku</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Book Cover */}
            <div className="md:w-1/3 p-8">
              <img
                src={book.image || "/default-book-cover.jpg"}
                alt={book.title}
                className="w-full h-auto rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = "/default-book-cover.jpg";
                }}
              />
            </div>
            {/* Book Details */}
            <div className="md:w-2/3 p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  Oleh: {book.author}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {book.category_name}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      book.available_stock > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {book.available_stock > 0 ? "Tersedia" : "Tidak Tersedia"}
                  </span>
                  {book.isbn && (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      ISBN: {book.isbn}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Informasi Stok
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Stok</p>
                    <p className="text-lg font-semibold">
                      {book.total_stock} eksemplar
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tersedia</p>
                    <p className="text-lg font-semibold">
                      {book.available_stock} eksemplar
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Deskripsi
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleBorrow}
                  disabled={
                    book.available_stock <= 0 ||
                    borrowing ||
                    session?.user?.role !== "umum"
                  }
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    book.available_stock <= 0 || session?.user?.role !== "umum"
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {borrowing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bookmark mr-2"></i>
                      Pinjam Buku
                    </>
                  )}
                </button>

                {session?.user?.role === "admin" && (
                  <Link
                    href={`/admin/books/edit/${book.id}`}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Edit Buku
                  </Link>
                )}
              </div>

              {/* Info Messages */}
              {book.available_stock <= 0 && (
                <p className="text-red-600 mt-3">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Maaf, buku sedang tidak tersedia untuk dipinjam
                </p>
              )}
              {session?.user?.role !== "umum" && (
                <p className="text-yellow-600 mt-3">
                  <i className="fas fa-info-circle mr-2"></i>
                  Hanya user umum yang dapat meminjam buku
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
