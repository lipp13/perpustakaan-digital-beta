import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    let whereClause = 'WHERE role = "user" AND deleted_at IS NULL';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const results = await query(`
      SELECT 
        id,
        name,
        email,
        student_id,
        phone
      FROM users
      ${whereClause}
      ORDER BY name ASC
      LIMIT ?
    `, [...params, limit]);

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}