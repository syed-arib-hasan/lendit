'use client';
import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RequestActions({
  requestId, itemId, borrowerEmail,
}: { requestId: number; itemId: number; borrowerEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);

  async function handle(action: 'accept' | 'reject') {
    if (!confirm(`${action === 'accept' ? 'Accept' : 'Reject'} this request?`)) return;
    setLoading(action);
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, itemId, borrowerEmail, action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handle('accept')}
        disabled={loading !== null}
        className="btn-success flex items-center gap-1.5"
      >
        {loading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Accept
      </button>
      <button
        onClick={() => handle('reject')}
        disabled={loading !== null}
        className="btn-danger flex items-center gap-1.5"
      >
        {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        Reject
      </button>
    </div>
  );
}
