import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

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
    const userId = searchParams.get('userId') || searchParams.get('user_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (userId) {
      whereClause += ' AND br.user_id = ?';
      params.push(userId);
    } else if (session.user.role !== 'admin' && session.user.role !== 'petugas') {
      // Regular users can only see their own history
      whereClause += ' AND br.user_id = ?';
      params.push(session.user.id);
    }
    
    if (status) {
      whereClause += ' AND br.status = ?';
      params.push(status);
    }

    // Get history with pagination
    const history = await query(
      `SELECT 
        br.*,
        b.id as book_id,
        b.title,
        b.author,
        b.image as coverImage,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        p.name as petugas_name
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
      data: history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching peminjaman history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}