import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'petugas'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get borrow request
    const borrows = await query(
      `SELECT br.*, b.id as book_id 
       FROM borrow_requests br 
       JOIN books b ON br.book_id = b.id 
       WHERE br.id = ?`,
      [id]
    );

    if (borrows.length === 0) {
      return NextResponse.json(
        { error: 'Permintaan peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    const borrow = borrows[0];

    if (borrow.status !== 'active') {
      return NextResponse.json(
        { error: 'Status peminjaman tidak valid' },
        { status: 400 }
      );
    }

    // Complete borrow request and return stock
    await query('START TRANSACTION');

    await query(
      'UPDATE borrow_requests SET status = "completed" WHERE id = ?',
      [id]
    );

    await query(
      'UPDATE books SET available_stock = available_stock + 1 WHERE id = ?',
      [borrow.book_id]
    );

    await query('COMMIT');

    return NextResponse.json({ message: 'Buku berhasil dikembalikan' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Complete borrow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}