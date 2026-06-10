import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import InventoryCard from './InventoryCard';

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const email = session.user.email;

  const items = await sql`
    SELECT i.id, i.category, i.status,
           COALESCE(b.title, e.name, g.type)              AS name,
           COALESCE(b.image_url, e.image_url, g.image_url) AS image_url,
           COALESCE(b.author, e.brand, g.brand)            AS subtitle
    FROM items i
    LEFT JOIN books      b ON b.item_id = i.id
    LEFT JOIN electronics e ON e.item_id = i.id
    LEFT JOIN gear       g ON g.item_id = i.id
    WHERE i.owner_email = ${email}
    ORDER BY i.created_at DESC
  `;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">My Items</h1>
            <p className="text-stone-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} listed</p>
          </div>
          <Link href="/inventory/add" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add item
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="font-semibold text-stone-700 text-lg">No items yet</p>
            <p className="text-stone-400 text-sm mt-2 mb-6">List your first item so others in your community can borrow it.</p>
            <Link href="/inventory/add" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> List an item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item: any) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
