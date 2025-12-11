import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { user } = await request.json();
    
    // Update status menjadi rejected
    await query(
      `UPDATE borrow_requests 
       SET status = 'rejected',
           approved_by = ?,
           approved_at = NOW()
       WHERE id = ? AND status = 'pending'`,
      [user?.id || null, id]
    );

    return NextResponse.json({
      success: true,
      message: 'Permintaan ditolak'
    });
    
  } catch (error) {
    console.error('Error rejecting request:', error);
    return NextResponse.json(
      { error: 'Failed to reject request' },
      { status: 500 }
    );
  }
}