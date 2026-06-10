import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.user.email;

  const { current, newPw } = await req.json();

  const rows = await sql`SELECT password FROM users WHERE email = ${email}`;
  const valid = await bcrypt.compare(current, rows[0]?.password ?? '');
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });

  const hashed = await bcrypt.hash(newPw, 10);
  await sql`UPDATE users SET password = ${hashed} WHERE email = ${email}`;

  return NextResponse.json({ ok: true });
}
