import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AppLayout from '@/components/AppLayout';
import HistoryTabs from './HistoryTabs';

interface Props { searchParams: { view?: string } }

export default async function HistoryPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const email = session.user.email;
  const view = searchParams.view === 'borrowing' ? 'borrowing' : 'lending';

  const rows = view === 'lending'
    ? await sql`
        SELECT h.id, h.item_id, h.borrower_email, h.penalty, h.returned_at,
               COALESCE(b.title, e.name, g.type)             AS item_name,
               COALESCE(b.image_url, e.image_url, g.image_url) AS image_url,
               i.category,
               u.name AS other_name,
               COALESCE(r.rating, 0) AS rating
        FROM history h
        JOIN items i ON i.id = h.item_id
        LEFT JOIN books      b ON b.item_id = i.id
        LEFT JOIN electronics e ON e.item_id = i.id
        LEFT JOIN gear       g ON g.item_id = i.id
        JOIN users u ON u.email = h.borrower_email
        LEFT JOIN ratings r ON r.borrower_email = h.borrower_email AND r.lender_email = h.lender_email
        WHERE h.lender_email = ${email}
        ORDER BY h.returned_at DESC
      `
    : await sql`
        SELECT h.id, h.item_id, h.lender_email, h.penalty, h.returned_at,
               COALESCE(b.title, e.name, g.type)             AS item_name,
               COALESCE(b.image_url, e.image_url, g.image_url) AS image_url,
               i.category,
               u.name AS other_name,
               COALESCE(r.rating, 0) AS rating
        FROM history h
        JOIN items i ON i.id = h.item_id
        LEFT JOIN books      b ON b.item_id = i.id
        LEFT JOIN electronics e ON e.item_id = i.id
        LEFT JOIN gear       g ON g.item_id = i.id
        JOIN users u ON u.email = h.lender_email
        LEFT JOIN ratings r ON r.borrower_email = h.borrower_email AND r.lender_email = h.lender_email
        WHERE h.borrower_email = ${email}
        ORDER BY h.returned_at DESC
      `;

  // Active borrows (for return + rating action)
  const activeLends = view === 'lending' ? await sql`
    SELECT ab.id, ab.item_id, ab.borrower_email, ab.due_date,
           COALESCE(b.title, e.name, g.type) AS item_name,
           i.category, u.name AS borrower_name
    FROM active_borrows ab
    JOIN items i ON i.id = ab.item_id
    LEFT JOIN books b ON b.item_id = i.id
    LEFT JOIN electronics e ON e.item_id = i.id
    LEFT JOIN gear g ON g.item_id = i.id
    JOIN users u ON u.email = ab.borrower_email
    WHERE ab.lender_email = ${email}
    ORDER BY ab.due_date ASC
  ` : [];

  return (
    <AppLayout>
      <HistoryTabs view={view} rows={rows as any[]} activeLends={activeLends as any[]} />
    </AppLayout>
  );
}
