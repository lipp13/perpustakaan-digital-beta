import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching dashboard stats with correct structure...');
    
    // 1. Total buku
    const totalBooksResult = await query(
      'SELECT COUNT(*) as count FROM books'
    );
    const totalBooks = totalBooksResult[0]?.count || 0;
    console.log('Total books:', totalBooks);

    // 2. Buku tersedia (available_stock > 0)
    const availableBooksResult = await query(
      'SELECT COUNT(*) as count FROM books WHERE available_stock > 0'
    );
    const availableBooks = availableBooksResult[0]?.count || 0;
    console.log('Available books:', availableBooks);

    // 3. Buku sedang dipinjam
    // CARA: total_stock - available_stock = buku yang dipinjam
    const borrowedBooksResult = await query(`
      SELECT SUM(total_stock - available_stock) as borrowed_count 
      FROM books 
      WHERE available_stock < total_stock
    `);
    const borrowedBooks = borrowedBooksResult[0]?.borrowed_count || 0;
    console.log('Borrowed books:', borrowedBooks);

    // 4. Peminjaman menunggu persetujuan
    const pendingApprovalsResult = await query(
      "SELECT COUNT(*) as count FROM borrow_requests WHERE status = 'pending'"
    );
    const pendingApprovals = pendingApprovalsResult[0]?.count || 0;
    console.log('Pending approvals:', pendingApprovals);

    // 5. Peminjaman aktif
    const activeBorrowsResult = await query(
      "SELECT COUNT(*) as count FROM borrow_requests WHERE status IN ('approved', 'active')"
    );
    const activeBorrows = activeBorrowsResult[0]?.count || 0;

    // 6. Peminjaman terlambat
    const overdueBorrowsResult = await query(
      `SELECT COUNT(*) as count FROM borrow_requests 
       WHERE status IN ('approved', 'active') 
       AND borrow_end < CURDATE()`
    );
    const overdueBorrows = overdueBorrowsResult[0]?.count || 0;

    // 7. Aktivitas terbaru
    const recentActivityResult = await query(`
      SELECT 
        br.id,
        br.book_id,
        br.status,
        br.request_date,
        br.approved_at,
        br.borrow_start,
        br.borrow_end,
        b.title as book_title,
        u.name as user_name
      FROM borrow_requests br
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN users u ON br.user_id = u.id
      ORDER BY br.request_date DESC
      LIMIT 5
    `);

    const recentActivity = recentActivityResult.map(activity => ({
      id: activity.id,
      book_title: activity.book_title || 'Unknown Book',
      user_name: activity.user_name || 'Unknown User',
      status: activity.status,
      created_at: activity.request_date || activity.approved_at
    }));

    console.log('Recent activity count:', recentActivity.length);

    return NextResponse.json({
      totalBooks,
      availableBooks,
      borrowedBooks,
      pendingApprovals,
      activeBorrows,
      overdueBorrows,
      recentActivity
    });
    
  } catch (error) {
    console.error('Error in dashboard API:', error);
    
    // Fallback untuk development
    return NextResponse.json({
      totalBooks: 0,
      availableBooks: 0,
      borrowedBooks: 0,
      pendingApprovals: 0,
      recentActivity: [],
      _error: error.message
    });
  }
}