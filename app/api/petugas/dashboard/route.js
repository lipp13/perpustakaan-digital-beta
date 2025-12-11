import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Sesuaikan dengan db connection lu

export async function GET() {
  try {
    // 1. Total buku
    const totalBooksResult = await query(
      'SELECT COUNT(*) as count FROM books WHERE deleted_at IS NULL'
    );
    const totalBooks = totalBooksResult[0]?.count || 0;

    // 2. Buku tersedia (stock > 0)
    const availableBooksResult = await query(
      'SELECT COUNT(*) as count FROM books WHERE stock > 0 AND deleted_at IS NULL'
    );
    const availableBooks = availableBooksResult[0]?.count || 0;

    // 3. Buku sedang dipinjam (dari tabel peminjaman yang belum dikembalikan)
    // ASUSMSI: ada tabel 'borrow_requests' atau 'transactions' dengan status
    const borrowedBooksResult = await query(`
      SELECT COUNT(DISTINCT book_id) as count 
      FROM borrow_requests 
      WHERE status = 'borrowed' 
        OR status = 'active' 
        OR (return_date IS NULL AND status = 'approved')
    `);
    const borrowedBooks = borrowedBooksResult[0]?.count || 0;

    // 4. Peminjaman menunggu persetujuan
    const pendingApprovalsResult = await query(
      "SELECT COUNT(*) as count FROM borrow_requests WHERE status = 'pending'"
    );
    const pendingApprovals = pendingApprovalsResult[0]?.count || 0;

    return NextResponse.json({
      totalBooks,
      availableBooks,
      borrowedBooks,
      pendingApprovals
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        totalBooks: 0,
        availableBooks: 0,
        borrowedBooks: 0,
        pendingApprovals: 0,
        error: 'Failed to fetch stats' 
      },
      { status: 500 }
    );
  }
}