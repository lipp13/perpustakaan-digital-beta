import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { query } from '@/lib/db';

// GET: Fetch all borrow requests (transactions) for admin
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter by status
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      whereClause += ' AND br.status = ?';
      params.push(status);
    }

    // Get all borrow requests with related data
    const borrows = await query(
      `SELECT 
        br.id,
        br.user_id,
        br.book_id,
        br.status,
        br.request_date,
        br.approved_at,
        br.borrow_start,
        br.borrow_end,
        br.completed_at,
        br.petugas_id,
        b.title as book_title,
        b.author as book_author,
        b.image as book_image,
        b.category as book_category,
        u.name as user_name,
        u.email as user_email,
        u.nipd as user_nipd,
        p.name as petugas_name,
        DATEDIFF(COALESCE(br.borrow_end, CURDATE()), CURDATE()) as days_remaining
      FROM borrow_requests br
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN users u ON br.user_id = u.id
      LEFT JOIN users p ON br.petugas_id = p.id
      ${whereClause}
      ORDER BY br.request_date DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count for pagination
    const totalResult = await query(
      `SELECT COUNT(*) as total 
       FROM borrow_requests br 
       ${whereClause}`,
      params
    );
    const total = totalResult[0]?.total || 0;

    return NextResponse.json({
      data: borrows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get admin transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

