import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Semua peminjaman aktif (approved/active)
export async function GET() {
  try {
    const results = await query(`
      SELECT 
        br.*,
        b.title as book_title,
        b.author as book_author,
        b.image as book_image,
        u.name as user_name,
        u.email as user_email,
        DATEDIFF(br.borrow_end, CURDATE()) as days_remaining
      FROM borrow_requests br
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN users u ON br.user_id = u.id
      WHERE br.status IN ('approved', 'active')
        AND (br.borrow_end IS NULL OR br.borrow_end >= CURDATE())
      ORDER BY br.borrow_end ASC
    `);

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error fetching active borrows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active borrows' },
      { status: 500 }
    );
  }
}

// PUT: Proses pengembalian
export async function PUT(request) {
  try {
    const { id, condition = 'good', notes = '' } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Borrow ID is required' },
        { status: 400 }
      );
    }

    // Update status menjadi completed
    await query(
      `UPDATE borrow_requests 
       SET status = 'completed',
           picked_up_at = NOW()
       WHERE id = ? AND status IN ('approved', 'active')`,
      [id]
    );

    // Tambah available_stock buku kembali
    const borrowResult = await query(
      'SELECT book_id FROM borrow_requests WHERE id = ?',
      [id]
    );
    
    if (borrowResult.length > 0) {
      const bookId = borrowResult[0].book_id;
      await query(
        'UPDATE books SET available_stock = available_stock + 1 WHERE id = ?',
        [bookId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pengembalian berhasil diproses'
    });
    
  } catch (error) {
    console.error('Error processing return:', error);
    return NextResponse.json(
      { error: 'Failed to process return', details: error.message },
      { status: 500 }
    );
  }
}