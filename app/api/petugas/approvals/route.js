import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Semua permintaan yang pending
export async function GET() {
  try {
    const results = await query(`
      SELECT 
        br.*,
        b.title as book_title,
        b.image as book_image,
        b.available_stock,
        u.name as user_name,
        u.email as user_email
      FROM borrow_requests br
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN users u ON br.user_id = u.id
      WHERE br.status = 'pending'
      ORDER BY br.request_date ASC
    `);

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}

// PUT: Approve atau reject peminjaman
export async function PUT(request) {
  try {
    const { id, action, petugas_id } = await request.json();
    
    if (!id || !action) {
      return NextResponse.json(
        { error: 'ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const now = new Date();
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    if (action === 'approve') {
      // 1. Update status menjadi approved
      await query(
        `UPDATE borrow_requests 
         SET status = ?, 
             approved_by = ?,
             approved_at = ?,
             borrow_start = ?,
             borrow_end = DATE_ADD(?, INTERVAL 7 DAY)
         WHERE id = ? AND status = 'pending'`,
        [newStatus, petugas_id || null, now, now, now, id]
      );

      // 2. Kurangi available_stock buku
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
    } else {
      // Hanya update status untuk reject
      await query(
        `UPDATE borrow_requests 
         SET status = ?,
             approved_by = ?,
             approved_at = ?
         WHERE id = ? AND status = 'pending'`,
        [newStatus, petugas_id || null, now, id]
      );
    }

    // Ambil data yang sudah diupdate
    const updatedRequest = await query(`
      SELECT 
        br.*,
        b.title as book_title,
        u.name as user_name
      FROM borrow_requests br
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN users u ON br.user_id = u.id
      WHERE br.id = ?
    `, [id]);

    return NextResponse.json({
      success: true,
      message: `Permintaan berhasil di${action === 'approve' ? 'setujui' : 'tolak'}`,
      data: updatedRequest[0] || null
    });
    
  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { error: 'Failed to process approval', details: error.message },
      { status: 500 }
    );
  }
}