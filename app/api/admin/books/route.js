import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const books = await query(`
      SELECT 
        b.*, 
        bc.name AS category_name,
        bc.slug AS category_slug
      FROM books b
      LEFT JOIN book_categories bc 
        ON b.category_id = bc.id
      ORDER BY b.created_at DESC
    `);

    return NextResponse.json(books);
  } catch (error) {
    console.error("Get admin books error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
