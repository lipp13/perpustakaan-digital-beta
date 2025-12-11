// app/api/admin/users/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

// GET single user (Admin only)
export async function GET(request, { params }) {
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
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = params;

    const [users] = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(users[0]);

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data user' },
      { status: 500 }
    );
  }
}

// PUT update user (Admin only)
export async function PUT(request, { params }) {
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
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, role_id, password } = body;

    // Validation
    if (!name || !role_id) {
      return NextResponse.json(
        { error: 'Nama dan role harus diisi' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Prevent self-demotion (admin can't change their own role)
    if (parseInt(id) === parseInt(session.user.id)) {
      const [currentRole] = await db.query(
        'SELECT role_id FROM users WHERE id = ?',
        [id]
      );
      const [adminRole] = await db.query(
        'SELECT id FROM roles WHERE name = ?',
        ['admin']
      );
      
      if (currentRole[0].role_id === adminRole[0].id && role_id !== adminRole[0].id) {
        return NextResponse.json(
          { error: 'Anda tidak dapat mengubah role Anda sendiri' },
          { status: 400 }
        );
      }
    }

    // Update user
    let updateQuery = 'UPDATE users SET name = ?, role_id = ?';
    let params = [name, role_id];

    // Update password if provided
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password minimal 6 karakter' },
          { status: 400 }
        );
      }
      const passwordHash = await bcrypt.hash(password, 10);
      updateQuery += ', password_hash = ?';
      params.push(passwordHash);
    }

    updateQuery += ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params.push(id);

    await db.query(updateQuery, params);

    // Get updated user
    const [updatedUser] = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [id]
    );

    return NextResponse.json({
      message: 'User berhasil diupdate',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate user' },
      { status: 500 }
    );
  }
}

// DELETE user (Admin only)
export async function DELETE(request, { params }) {
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
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Prevent self-deletion
    if (parseInt(id) === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun Anda sendiri' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user has active borrows
    const [activeBorrows] = await db.query(
      `SELECT id FROM borrow_requests 
       WHERE user_id = ? AND status IN ('pending', 'approved', 'active')`,
      [id]
    );

    if (activeBorrows.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus user yang memiliki peminjaman aktif' },
        { status: 400 }
      );
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({
      message: 'User berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus user' },
      { status: 500 }
    );
  }
}