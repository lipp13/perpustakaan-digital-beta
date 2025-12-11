import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { name, email, nipd, password, role = "umum" } = await request.json();

    // Validasi
    if (!name || !password || (!email && !nipd)) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Cek user sudah ada
    let existingUser;
    if (email) {
      existingUser = await query("SELECT id FROM users WHERE email = ?", [
        email,
      ]);
    } else {
      existingUser = await query("SELECT id FROM users WHERE nipd = ?", [nipd]);
    }

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User sudah terdaftar" },
        { status: 400 }
      );
    }

    // Get role ID
    const roles = await query("SELECT id FROM roles WHERE name = ?", [role]);
    if (roles.length === 0) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    const roleId = roles[0].id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await query(
      `INSERT INTO users (name, email, nipd, password_hash, role_id) 
        VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        email || null, // kalau undefined -> null
        nipd || null, // kalau undefined -> null
        hashedPassword,
        roles[0].id,
      ]
    );

    return NextResponse.json(
      { message: "Registrasi berhasil" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
