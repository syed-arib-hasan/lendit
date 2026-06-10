import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const lenderEmail = session.user.email;

  const { requestId, itemId, borrowerEmail, action } = await req.json();

  if (action === 'accept') {
    // Mark request accepted
    await sql`UPDATE borrow_requests SET status = 'accepted' WHERE id = ${requestId}`;
    // Reject all other pending requests for the same item
    await sql`UPDATE borrow_requests SET status = 'rejected' WHERE item_id = ${itemId} AND id != ${requestId} AND status = 'pending'`;
    // Mark item as borrowed
    await sql`UPDATE items SET status = 'borrowed' WHERE id = ${itemId}`;
    // Create active borrow record
    await sql`
      INSERT INTO active_borrows (item_id, borrower_email, lender_email)
      VALUES (${itemId}, ${borrowerEmail}, ${lenderEmail})
    `;
  } else if (action === 'reject') {
    await sql`UPDATE borrow_requests SET status = 'rejected' WHERE id = ${requestId}`;
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
