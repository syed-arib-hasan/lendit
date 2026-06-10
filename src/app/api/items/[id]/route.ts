import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const itemId = Number(params.id);
  const email  = session.user.email;

  // Verify ownership
  const rows = await sql`SELECT owner_email, status FROM items WHERE id = ${itemId}`;
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (rows[0].owner_email !== email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (rows[0].status === 'borrowed') return NextResponse.json({ error: 'Cannot delete a borrowed item.' }, { status: 409 });

  // Check no active borrow requests
  const pending = await sql`SELECT id FROM borrow_requests WHERE item_id = ${itemId} AND status = 'pending'`;
  if (pending.length > 0) return NextResponse.json({ error: 'Item has pending requests.' }, { status: 409 });

  await sql`DELETE FROM items WHERE id = ${itemId}`;

  return NextResponse.json({ ok: true });
}
