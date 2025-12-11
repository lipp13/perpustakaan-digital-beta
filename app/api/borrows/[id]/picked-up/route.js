import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get borrow request
    const borrows = await query(
      `SELECT br.*, b.available_stock 
       FROM borrow_requests br 
       JOIN books b ON br.book_id = b.id 
       WHERE br.id = ? AND br.user_id = ?`,
      [id, session.user.id]
    );

    if (borrows.length === 0) {
      return NextResponse.json(
        { error: 'Permintaan peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    const borrow = borrows[0];

    if (borrow.status !== 'approved') {
      return NextResponse.json(
        { error: 'Status peminjaman tidak valid' },
        { status: 400 }
      );
    }

    // Calculate dates
    const borrowStart = new Date();
    const borrowEnd = new Date(borrow.borrow_end);

    // Update borrow request and decrease available stock
    await query('START TRANSACTION');

    await query(
      `UPDATE borrow_requests 
       SET status = 'active', picked_up_at = NOW(), borrow_start = ?
       WHERE id = ?`,
      [borrowStart, id]
    );

    await query(
      'UPDATE books SET available_stock = available_stock - 1 WHERE id = ?',
      [borrow.book_id]
    );

    await query('COMMIT');

    return NextResponse.json({ message: 'Buku berhasil diambil' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Picked up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}