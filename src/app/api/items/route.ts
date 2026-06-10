import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.user.email;

  try {
    const body = await req.json();
    const { category, description, imageUrl } = body;

    if (!['book', 'electronic', 'gear'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
    }

    // Insert into items table
    const itemRow = await sql`
      INSERT INTO items (owner_email, category, status)
      VALUES (${email}, ${category}, 'available')
      RETURNING id
    `;
    const itemId = itemRow[0].id;

    // Insert into type-specific table
    if (category === 'book') {
      const { title, author, publisher } = body;
      await sql`
        INSERT INTO books (item_id, title, author, publisher, description, image_url)
        VALUES (${itemId}, ${title}, ${author}, ${publisher}, ${description ?? null}, ${imageUrl ?? null})
      `;
    } else if (category === 'electronic') {
      const { name, brand, model } = body;
      await sql`
        INSERT INTO electronics (item_id, name, brand, model, description, image_url)
        VALUES (${itemId}, ${name}, ${brand}, ${model}, ${description ?? null}, ${imageUrl ?? null})
      `;
    } else {
      const { type, brand, spec } = body;
      await sql`
        INSERT INTO gear (item_id, type, brand, spec, description, image_url)
        VALUES (${itemId}, ${type}, ${brand}, ${spec ?? null}, ${description ?? null}, ${imageUrl ?? null})
      `;
    }

    return NextResponse.json({ id: itemId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
