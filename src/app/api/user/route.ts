import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.user.email;

  const { name, phone, location, latitude, longitude, imageUrl } = await req.json();

  await sql`
    UPDATE users SET
      name      = ${name ?? null},
      phone     = ${phone ?? null},
      location  = ${location ?? null},
      latitude  = ${latitude ? Number(latitude) : null},
      longitude = ${longitude ? Number(longitude) : null},
      image_url = ${imageUrl ?? null}
    WHERE email = ${email}
  `;

  return NextResponse.json({ ok: true });
}
