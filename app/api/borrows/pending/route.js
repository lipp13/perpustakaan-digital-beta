import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const results = await query(`
      SELECT 
        br.*,
        b.title,
        b.author,
        b.image as cover_url,
        u.name as user_name,
        u.email,
        u.nipd
      FROM borrow_requests br
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN users u ON br.user_id = u.id
      WHERE br.status = 'pending'
      ORDER BY br.request_date ASC
    `);

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending requests' },
      { status: 500 }
    );
  }
}