import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get multiple stats in parallel
    const [
      totalBooks,
      totalUsers,
      totalBorrows,
      pendingBorrows,
      activeBorrows,
      overdueBorrows
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM books'),
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM borrow_requests'),
      query('SELECT COUNT(*) as count FROM borrow_requests WHERE status = "pending"'),
      query('SELECT COUNT(*) as count FROM borrow_requests WHERE status = "active"'),
      query('SELECT COUNT(*) as count FROM borrow_requests WHERE status = "overdue"')
    ]);

    const stats = {
      totalBooks: totalBooks[0].count,
      totalUsers: totalUsers[0].count,
      totalBorrows: totalBorrows[0].count,
      pendingBorrows: pendingBorrows[0].count,
      activeBorrows: activeBorrows[0].count,
      overdueBorrows: overdueBorrows[0].count
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}