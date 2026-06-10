import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AppLayout from '@/components/AppLayout';
import ItemCard from '@/components/ItemCard';
import SearchBar from './SearchBar';

interface Props {
  searchParams: { q?: string; category?: string; sort?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const email = session.user.email;

  const q        = searchParams.q ?? '';
  const category = searchParams.category ?? 'all';
  const sort     = searchParams.sort ?? 'availability';

  const like = `%${q}%`;

  let rows: any[] = [];

  if (sort === 'location') {
    const locRow = await sql`SELECT location FROM users WHERE email = ${email}`;
    const loc = locRow[0]?.location ?? '';
    rows = await sql`
      SELECT i.id, i.category, i.status,
             COALESCE(b.title, e.name, g.type)        AS title,
             COALESCE(b.author, e.brand, g.brand)     AS subtitle,
             COALESCE(b.image_url, e.image_url, g.image_url) AS image_url,
             u.name AS lender_name, u.location AS lender_location
      FROM items i
      JOIN users u ON u.email = i.owner_email
      LEFT JOIN books      b ON b.item_id = i.id
      LEFT JOIN electronics e ON e.item_id = i.id
      LEFT JOIN gear       g ON g.item_id = i.id
      WHERE i.owner_email != ${email}
        AND (${q} = '' OR COALESCE(b.title, e.name, g.type) ILIKE ${like})
        AND (${category} = 'all' OR i.category = ${category})
        AND u.location ILIKE ${'%' + loc + '%'}
      ORDER BY i.status ASC, i.created_at DESC
      LIMIT 60
    `;
  } else {
    rows = await sql`
      SELECT i.id, i.category, i.status,
             COALESCE(b.title, e.name, g.type)        AS title,
             COALESCE(b.author, e.brand, g.brand)     AS subtitle,
             COALESCE(b.image_url, e.image_url, g.image_url) AS image_url,
             u.name AS lender_name, u.location AS lender_location
      FROM items i
      JOIN users u ON u.email = i.owner_email
      LEFT JOIN books      b ON b.item_id = i.id
      LEFT JOIN electronics e ON e.item_id = i.id
      LEFT JOIN gear       g ON g.item_id = i.id
      WHERE i.owner_email != ${email}
        AND i.status = 'available'
        AND (${q} = '' OR COALESCE(b.title, e.name, g.type) ILIKE ${like})
        AND (${category} = 'all' OR i.category = ${category})
      ORDER BY i.created_at DESC
      LIMIT 60
    `;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Browse items</h1>
          <p className="text-stone-500 mt-1">Find something to borrow from your community.</p>
        </div>

        <SearchBar defaultQ={q} defaultCategory={category} defaultSort={sort} />

        {rows.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium text-stone-700">No items found</p>
            <p className="text-stone-400 text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rows.map((item: any) => (
              <ItemCard
                key={item.id}
                id={item.id}
                category={item.category}
                title={item.title ?? 'Untitled'}
                subtitle={item.subtitle ?? ''}
                status={item.status}
                imageUrl={item.image_url}
                lenderName={item.lender_name}
                lenderLocation={item.lender_location}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
