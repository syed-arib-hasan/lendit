import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, email, phone, location, latitude, longitude, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    }

    const existing = await sql`SELECT email FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (name, email, password, phone, location, latitude, longitude)
      VALUES (${name}, ${email}, ${hashed}, ${phone ?? null}, ${location ?? null},
              ${latitude ? Number(latitude) : null}, ${longitude ? Number(longitude) : null})
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
