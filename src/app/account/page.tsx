import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AppLayout from '@/components/AppLayout';
import AccountForms from './AccountForms';
import { StarRating } from '@/components/StarRating';
import { AlertTriangle } from 'lucide-react';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const email = session.user.email;

  const [userRows, ratingRows] = await Promise.all([
    sql`SELECT id, name, email, phone, location, latitude, longitude, image_url, penalty_score FROM users WHERE email = ${email}`,
    sql`SELECT COALESCE(AVG(rating),0) AS avg, COUNT(*) AS total FROM ratings WHERE borrower_email = ${email}`,
  ]);

  const user   = userRows[0];
  const rating = ratingRows[0];

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-8">
        <div className="flex items-center gap-5">
          <img
            src={user.image_url || `https://api.dicebear.com/7.x/personas/svg?seed=${email}`}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover bg-stone-100 flex-shrink-0"
          />
          <div>
            <h1 className="page-title">{user.name}</h1>
            <p className="text-stone-500 text-sm mt-0.5">{email}</p>
            <div className="mt-2">
              <StarRating value={Number(rating.avg)} />
              <p className="text-xs text-stone-400 mt-0.5">Based on {rating.total} ratings</p>
            </div>
          </div>
        </div>

        {user.penalty_score > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 text-sm">Penalty score: {user.penalty_score}</p>
              <p className="text-amber-600 text-sm mt-0.5">Return items on time to reduce your penalty score.</p>
            </div>
          </div>
        )}

        <AccountForms user={user} />
      </div>
    </AppLayout>
  );
}
