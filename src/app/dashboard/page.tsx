import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AppLayout from '@/components/AppLayout';
import { Package, BookOpen, History, HandshakeIcon, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const email = session.user.email;

  const [userRows, lentCount, borrowedCount, pendingCount, avgRating] = await Promise.all([
    sql`SELECT name, penalty_score FROM users WHERE email = ${email}`,
    sql`SELECT COUNT(*) FROM active_borrows WHERE lender_email = ${email}`,
    sql`SELECT COUNT(*) FROM active_borrows WHERE borrower_email = ${email}`,
    sql`SELECT COUNT(*) FROM borrow_requests WHERE lender_email = ${email} AND status = 'pending'`,
    sql`SELECT COALESCE(AVG(rating), 0) as avg FROM ratings WHERE borrower_email = ${email}`,
  ]);

  const user        = userRows[0];
  const lent        = Number(lentCount[0]?.count ?? 0);
  const borrowed    = Number(borrowedCount[0]?.count ?? 0);
  const pending     = Number(pendingCount[0]?.count ?? 0);
  const rating      = Number(avgRating[0]?.avg ?? 0).toFixed(1);

  // Recent active borrows (as borrower)
  const recentBorrows = await sql`
    SELECT ab.item_id, ab.due_date, ab.borrowed_at,
           COALESCE(b.title, e.name, g.type) AS item_name,
           i.category, u.name AS lender_name
    FROM active_borrows ab
    JOIN items i ON i.id = ab.item_id
    LEFT JOIN books b ON b.item_id = i.id
    LEFT JOIN electronics e ON e.item_id = i.id
    LEFT JOIN gear g ON g.item_id = i.id
    JOIN users u ON u.email = ab.lender_email
    WHERE ab.borrower_email = ${email}
    ORDER BY ab.borrowed_at DESC LIMIT 3
  `;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="page-title">Good to see you, {user?.name?.split(' ')[0] ?? 'there'} 👋</h1>
          <p className="text-stone-500 mt-1">Here's what's happening with your items.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{lent}</p>
            <p className="text-sm text-stone-500">Items lent out</p>
          </div>
          <div className="stat-card">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{borrowed}</p>
            <p className="text-sm text-stone-500">Items borrowed</p>
          </div>
          <div className="stat-card">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <HandshakeIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-stone-900">{pending}</p>
              {pending > 0 && (
                <Link href="/requests" className="text-xs text-maroon-800 font-medium hover:underline">View →</Link>
              )}
            </div>
            <p className="text-sm text-stone-500">Pending requests</p>
          </div>
          <div className="stat-card">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{rating}</p>
            <p className="text-sm text-stone-500">Your rating</p>
          </div>
        </div>

        {/* Penalty warning */}
        {user?.penalty_score > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 text-sm">Penalty score: {user.penalty_score}</p>
              <p className="text-red-600 text-sm mt-0.5">Late returns contribute to your penalty score. Return items on time to keep it low.</p>
            </div>
          </div>
        )}

        {/* Currently borrowing */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-900">Currently borrowing</h2>
            <Link href="/history" className="text-sm text-maroon-800 hover:underline">Full history →</Link>
          </div>

          {recentBorrows.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-stone-400 text-sm">You're not borrowing anything right now.</p>
              <Link href="/search" className="btn-primary inline-block mt-4">Browse items</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBorrows.map((row: any) => {
                const due = new Date(row.due_date);
                const overdue = due < new Date();
                return (
                  <div key={row.item_id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-800">{row.item_name}</p>
                      <p className="text-sm text-stone-500">From {row.lender_name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-stone-600'}`}>
                        {overdue ? 'Overdue' : 'Due'} {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <span className={`badge ${row.category === 'book' ? 'badge-book' : row.category === 'electronic' ? 'badge-electronic' : 'badge-gear'}`}>
                        {row.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-semibold text-stone-900 mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/search',    icon: '🔍', label: 'Browse items' },
              { href: '/inventory/add', icon: '➕', label: 'List an item' },
              { href: '/requests',  icon: '📬', label: 'Manage requests' },
              { href: '/history',   icon: '📋', label: 'View history' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-sm font-medium text-stone-700">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
