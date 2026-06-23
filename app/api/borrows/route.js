import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { query } from '@/lib/db';

function formatDateToMySQL(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// GET: Fetch borrow requests
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || session.user.id;

    // Users can only view their own borrows, unless they're admin/petugas
    if (userId !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'petugas') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const borrows = await query(
      `SELECT 
        br.*,
        b.title,
        b.author,
        b.image as cover_url,
        b.category as category_name
      FROM borrow_requests br
      LEFT JOIN books b ON br.book_id = b.id
      WHERE br.user_id = ?
      ORDER BY br.request_date DESC`,
      [userId]
    );

    return NextResponse.json(borrows);
  } catch (error) {
    console.error('Get borrows error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new borrow request
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { book_id, borrow_days = 7 } = await request.json();

    const book = await query(
      'SELECT available_stock FROM books WHERE id = ?',
      [book_id]
    );

    if (!book.length) {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 });
    }

    if (book[0].available_stock <= 0) {
      return NextResponse.json({ error: 'Stok habis' }, { status: 400 });
    }

    const borrowEnd = new Date();
    borrowEnd.setDate(borrowEnd.getDate() + parseInt(borrow_days));
    const borrowEndFormatted = formatDateToMySQL(borrowEnd);

    const result = await query(
      `INSERT INTO borrow_requests 
        (user_id, book_id, borrow_end, status)
        VALUES (?, ?, ?, 'pending')`,
      [session.user.id, book_id, borrowEndFormatted]
    );

    await query(
      `UPDATE books
        SET available_stock = available_stock - 1
        WHERE id = ?`,
      [book_id]
    );

    return NextResponse.json({
      message: 'Buku berhasil dipinjam ✅',
      id: result.insertId
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: 'Internal server error',
      detail: error.message
    }, { status: 500 });
  }
}

