// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

// GET all users (Admin only)
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

    const [users] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.nipd,
        u.role_id,
        u.profile_photo,
        u.created_at,
        u.updated_at,
        r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json(users);

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data users' },
      { status: 500 }
    );
  }
}

// POST create new user (Admin only)
export async function POST(request) {
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

    const body = await request.json();
    const { name, email, nipd, password, role_id } = body;

    // Validation
    if (!name || !password || !role_id) {
      return NextResponse.json(
        { error: 'Nama, password, dan role harus diisi' },
        { status: 400 }
      );
    }

    if (!email && !nipd) {
      return NextResponse.json(
        { error: 'Email atau NIPD harus diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if email or nipd already exists
    if (email) {
      const [existingEmail] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (existingEmail.length > 0) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        );
      }
    }

    if (nipd) {
      const [existingNipd] = await db.query(
        'SELECT id FROM users WHERE nipd = ?',
        [nipd]
      );
      if (existingNipd.length > 0) {
        return NextResponse.json(
          { error: 'NIPD sudah terdaftar' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      `INSERT INTO users (name, email, nipd, password_hash, role_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email || null, nipd || null, passwordHash, role_id]
    );

    // Get created user
    const [newUser] = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(
      { 
        message: 'User berhasil ditambahkan',
        user: newUser[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan user' },
      { status: 500 }
    );
  }
}