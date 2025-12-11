import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    let whereClause = 'WHERE deleted_at IS NULL AND stock > 0';
    const params = [];

    if (search) {
      whereClause += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const results = await query(`
      SELECT 
        id,
        title,
        author,
        isbn,
        stock,
        cover_url
      FROM books
      ${whereClause}
      ORDER BY title ASC
      LIMIT ?
    `, [...params, limit]);

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}