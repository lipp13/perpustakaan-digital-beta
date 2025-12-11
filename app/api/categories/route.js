// app/api/categories/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all categories
export async function GET(request) {
  try {
    const [categories] = await db.query(`
      SELECT id, name, slug, created_at
      FROM book_categories
      ORDER BY name ASC
    `);

    return NextResponse.json(categories);

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}