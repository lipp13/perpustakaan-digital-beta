import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// =============================
// 📌 GET: Ambil semua buku
// =============================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    let where = "WHERE 1=1";
    const params = [];

    // Search (title / author)
    if (search) {
      where += " AND (title LIKE ? OR author LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filter kategori
    if (category && category !== "all") {
      where += " AND category = ?";
      params.push(category);
    }

    const sql = `
      SELECT 
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
      ${where}
      ORDER BY created_at DESC
    `;

    const books = await query(sql, params);

    return NextResponse.json(books);
  } catch (error) {
    console.error("GET /api/books error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data buku" },
      { status: 500 }
    );
  }
}

// =============================
// 📌 POST: Tambah buku baru
// =============================
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      title,
      category,
      author,
      image,
      description,
      total_stock,
      available_stock,
    } = body;

    // Validasi
    if (!title || !category || !author) {
      return NextResponse.json(
        { error: "Judul, kategori, dan author wajib diisi." },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO books 
      (title, category, author, image, description, total_stock, available_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      title,
      category,
      author,
      image || null,
      description || null,
      total_stock || 0,
      available_stock || 0,
    ]);

    return NextResponse.json({
      message: "Buku berhasil ditambahkan",
      book_id: result.insertId,
    });
  } catch (error) {
    console.error("POST /api/books error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan buku" },
      { status: 500 }
    );
  }
}
