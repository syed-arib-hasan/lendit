import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AppLayout from '@/components/AppLayout';
import RequestActions from './RequestActions';
import { Calendar, User } from 'lucide-react';

export default async function RequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const email = session.user.email;

  const requests = await sql`
    SELECT br.id, br.item_id, br.borrower_email, br.created_at,
           COALESCE(b.title, e.name, g.type) AS item_name,
           i.category,
           u.name AS borrower_name
    FROM borrow_requests br
    JOIN items i ON i.id = br.item_id
    LEFT JOIN books      b ON b.item_id = i.id
    LEFT JOIN electronics e ON e.item_id = i.id
    LEFT JOIN gear       g ON g.item_id = i.id
    JOIN users u ON u.email = br.borrower_email
    WHERE br.lender_email = ${email} AND br.status = 'pending'
    ORDER BY br.created_at DESC
  `;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Borrow requests</h1>
          <p className="text-stone-500 mt-1">
            {requests.length === 0 ? 'No pending requests.' : `${requests.length} pending request${requests.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-3">📬</p>
            <p className="font-medium text-stone-600">No requests right now</p>
            <p className="text-stone-400 text-sm mt-1">When someone wants to borrow one of your items, it'll show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req: any) => (
              <div key={req.id} className="card p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <p className="font-semibold text-stone-800">{req.item_name}</p>
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {req.borrower_name} <span className="text-stone-400">({req.borrower_email})</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className={`badge ${
                    req.category === 'book' ? 'badge-book' :
                    req.category === 'electronic' ? 'badge-electronic' : 'badge-gear'
                  }`}>{req.category}</span>
                </div>
                <RequestActions requestId={req.id} itemId={req.item_id} borrowerEmail={req.borrower_email} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
