// app/api/books/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

// =========================
// 📌 GET SINGLE BOOK
// =========================
export async function GET(request, { params }) {
  try {
    const { id } = params;

    console.log("Fetching book with ID:", id);

    const [books] = await db.query(
      `SELECT 
        id,
        title,
        author,
        category,
        image,
        description,
        total_stock,
        available_stock,
        created_at
      FROM books
      WHERE id = ?`,
      [id]
    );

    if (books.length === 0) {
      return NextResponse.json(
        { error: "Buku tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(books[0]);

  } catch (error) {
    console.error("Get book error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data buku", details: error.message },
      { status: 500 }
    );
  }
}

// =========================
// 📌 UPDATE BOOK (ADMIN ONLY)
// =========================
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const [existing] = await db.query(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Buku tidak ditemukan" },
        { status: 404 }
      );
    }

    const updates = [];
    const values = [];

    // dynamic update builder
    for (let key in body) {
      updates.push(`${key} = ?`);
      values.push(body[key]);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data untuk diupdate" },
        { status: 400 }
      );
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    await db.query(
      `UPDATE books SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [updated] = await db.query(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      message: "Buku berhasil diupdate",
      book: updated[0],
    });

  } catch (error) {
    console.error("Update book error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate buku", details: error.message },
      { status: 500 }
    );
  }
}

// =========================
// 📌 DELETE BOOK (ADMIN ONLY)
// =========================
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    // Prevent deleting books that are being borrowed
    const [active] = await db.query(
      `SELECT id FROM borrow_requests 
       WHERE book_id = ? AND status IN ('active','pending','approved')`,
      [id]
    );

    if (active.length > 0) {
      return NextResponse.json(
        { error: "Buku sedang dipinjam, tidak bisa dihapus" },
        { status: 400 }
      );
    }

    const [result] = await db.query("DELETE FROM books WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Buku tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Buku berhasil dihapus" });

  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus buku", details: error.message },
      { status: 500 }
    );
  }
}
