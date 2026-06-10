import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const lenderEmail = session.user.email;

  const { activeBorrowId, itemId, borrowerEmail, rating } = await req.json();

  // Mark item available
  await sql`UPDATE items SET status = 'available' WHERE id = ${itemId}`;

  // Move to history
  await sql`
    INSERT INTO history (item_id, borrower_email, lender_email, penalty)
    VALUES (${itemId}, ${borrowerEmail}, ${lenderEmail}, 0)
  `;

  // Delete active borrow
  await sql`DELETE FROM active_borrows WHERE id = ${activeBorrowId}`;

  // Save rating
  if (rating && rating >= 1 && rating <= 5) {
    await sql`
      INSERT INTO ratings (borrower_email, lender_email, rating)
      VALUES (${borrowerEmail}, ${lenderEmail}, ${rating})
    `;
  }

  return NextResponse.json({ ok: true });
}
