import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.user.email;

  const { itemId, lenderEmail } = await req.json();

  // Guard: can't borrow your own item
  if (lenderEmail === email) return NextResponse.json({ error: 'You cannot borrow your own item.' }, { status: 400 });

  // Guard: already requested
  const existing = await sql`
    SELECT id FROM borrow_requests WHERE item_id = ${itemId} AND borrower_email = ${email} AND status = 'pending'
  `;
  if (existing.length > 0) return NextResponse.json({ error: 'Request already sent.' }, { status: 409 });

  // Guard: item available
  const item = await sql`SELECT status FROM items WHERE id = ${itemId}`;
  if (!item[0] || item[0].status !== 'available') {
    return NextResponse.json({ error: 'Item is not available.' }, { status: 409 });
  }

  await sql`
    INSERT INTO borrow_requests (item_id, borrower_email, lender_email, status)
    VALUES (${itemId}, ${email}, ${lenderEmail}, 'pending')
  `;

  return NextResponse.json({ ok: true });
}
