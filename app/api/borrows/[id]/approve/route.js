import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { user } = await request.json();
    
    // Update status menjadi approved
    await query(
      `UPDATE borrow_requests 
       SET status = 'approved',
           approved_by = ?,
           approved_at = NOW(),
           borrow_start = CURDATE(),
           borrow_end = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       WHERE id = ? AND status = 'pending'`,
      [user?.id || null, id]
    );

    // Kurangi available_stock
    const borrowResult = await query(
      'SELECT book_id FROM borrow_requests WHERE id = ?',
      [id]
    );
    
    if (borrowResult.length > 0) {
      const bookId = borrowResult[0].book_id;
      await query(
        'UPDATE books SET available_stock = available_stock - 1 WHERE id = ? AND available_stock > 0',
        [bookId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Permintaan disetujui'
    });
    
  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    );
  }
}