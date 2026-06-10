'use client';
import { useState } from 'react';
import { Loader2, CheckCircle, Send } from 'lucide-react';

export default function BorrowButton({
  itemId, lenderEmail, available, alreadyRequested,
}: { itemId: number; lenderEmail: string; available: boolean; alreadyRequested: boolean }) {
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(alreadyRequested);
  const [error, setError]       = useState('');

  async function sendRequest() {
    setLoading(true); setError('');
    const res = await fetch('/api/borrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, lenderEmail }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setSent(true);
    else setError(data.error ?? 'Could not send request.');
  }

  if (!available) {
    return (
      <div className="card p-5 text-center">
        <p className="text-stone-500 text-sm">This item is currently borrowed.</p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="card p-5 flex items-center gap-3 text-emerald-700">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">Request sent!</p>
          <p className="text-sm text-emerald-600 mt-0.5">The lender will respond shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-3">
      <p className="text-sm text-stone-600">Ready to borrow this item? Send a request to the lender.</p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button onClick={sendRequest} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? 'Sending…' : 'Send borrow request'}
      </button>
    </div>
  );
}
