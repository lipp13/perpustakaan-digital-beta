// app/api/roles/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

// GET all roles
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [roles] = await db.query(`
      SELECT id, name, created_at
      FROM roles
      ORDER BY name ASC
    `);

    return NextResponse.json(roles);

  } catch (error) {
    console.error('Get roles error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data roles' },
      { status: 500 }
    );
  }
}