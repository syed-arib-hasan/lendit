'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Star, RotateCcw, Loader2, AlertCircle } from 'lucide-react';

const PLACEHOLDER: Record<string, string> = {
  book:       'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=80&h=80&fit=crop',
  electronic: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=80&fit=crop',
  gear:       'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=80&h=80&fit=crop',
};

function RatingInput({ activeBorrowId, itemId, borrowerEmail }: { activeBorrowId: number; itemId: number; borrowerEmail: string }) {
  const router = useRouter();
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  async function submit() {
    if (!rating) return;
    setLoading(true);
    await fetch('/api/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeBorrowId, itemId, borrowerEmail, rating }),
    });
    setLoading(false);
    setDone(true);
    router.refresh();
  }

  if (done) return <p className="text-emerald-600 text-sm font-medium">Returned & rated ✓</p>;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex">
        {[1,2,3,4,5].map(v => (
          <button key={v} type="button"
            onMouseEnter={() => setHovered(v)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(v)}
          >
            <Star className={`w-6 h-6 transition-colors ${
              v <= (hovered || rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
            }`} />
          </button>
        ))}
      </div>
      <button
        onClick={submit}
        disabled={loading || !rating}
        className="btn-primary flex items-center gap-1.5 text-xs"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
        Mark returned
      </button>
    </div>
  );
}

export default function HistoryTabs({
  view, rows, activeLends,
}: { view: string; rows: any[]; activeLends: any[] }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-display">Transaction history</h1>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 p-1 bg-stone-100 rounded-xl w-fit">
        {(['lending', 'borrowing'] as const).map(v => (
          <button key={v}
            onClick={() => router.push(`/history?view=${v}`)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              view === v ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {v === 'lending' ? 'Items I lent' : 'Items I borrowed'}
          </button>
        ))}
      </div>

      {/* Active lends (lending view only) */}
      {view === 'lending' && activeLends.length > 0 && (
        <div>
          <h2 className="font-semibold text-stone-800 mb-3">Currently out on loan</h2>
          <div className="space-y-3">
            {activeLends.map((lend: any) => {
              const due = new Date(lend.due_date);
              const overdue = due < new Date();
              return (
                <div key={lend.id} className="card p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-stone-800">{lend.item_name}</p>
                      <p className="text-sm text-stone-500">Borrowed by {lend.borrower_name} ({lend.borrower_email})</p>
                      {overdue && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Overdue since {due.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <RatingInput activeBorrowId={lend.id} itemId={lend.item_id} borrowerEmail={lend.borrower_email} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-semibold text-stone-800 mb-3">Past transactions</h2>
        {rows.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-stone-400 text-sm">No history yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row: any) => (
              <div key={row.id} className="card p-4 flex items-center gap-4">
                <img
                  src={row.image_url || PLACEHOLDER[row.category]}
                  alt={row.item_name}
                  className="w-14 h-14 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 truncate">{row.item_name}</p>
                  <p className="text-stone-500 text-sm">
                    {view === 'lending' ? 'Borrowed by' : 'Lent by'} {row.other_name}
                  </p>
                  <p className="text-stone-400 text-xs mt-0.5">
                    Returned {new Date(row.returned_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  {row.rating > 0 && (
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">{row.rating}</span>
                    </div>
                  )}
                  {row.penalty > 0 && (
                    <span className="badge bg-red-50 text-red-600">Penalty: {row.penalty}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
