'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type Category = 'book' | 'electronic' | 'gear';

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'book',       label: 'Book',         emoji: '📚' },
  { value: 'electronic', label: 'Electronic',    emoji: '🔧' },
  { value: 'gear',       label: 'Outdoor gear',  emoji: '🏕️' },
];

export default function AddItemForm() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('book');
  const [form, setForm]         = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push('/inventory');
    else setError(data.error ?? 'Failed to add item.');
  }

  return (
    <>
      {/* Category picker */}
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            type="button"
            onClick={() => { setCategory(c.value); setForm({}); }}
            className={`card p-4 text-center transition-all ${
              category === c.value
                ? 'ring-2 ring-maroon-800 bg-maroon-50'
                : 'hover:shadow-md'
            }`}
          >
            <div className="text-2xl mb-1">{c.emoji}</div>
            <p className="text-sm font-medium text-stone-700">{c.label}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {/* Book fields */}
        {category === 'book' && (
          <>
            <div>
              <label className="form-label">Book title *</label>
              <input className="form-input" required placeholder="e.g. The Great Gatsby"
                value={form.title ?? ''} onChange={e => update('title', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Author *</label>
                <input className="form-input" required placeholder="F. Scott Fitzgerald"
                  value={form.author ?? ''} onChange={e => update('author', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Publisher *</label>
                <input className="form-input" required placeholder="Scribner"
                  value={form.publisher ?? ''} onChange={e => update('publisher', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* Electronic fields */}
        {category === 'electronic' && (
          <>
            <div>
              <label className="form-label">Part name *</label>
              <input className="form-input" required placeholder="e.g. Arduino Uno"
                value={form.name ?? ''} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Brand *</label>
                <input className="form-input" required placeholder="Arduino"
                  value={form.brand ?? ''} onChange={e => update('brand', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Model *</label>
                <input className="form-input" required placeholder="Rev3"
                  value={form.model ?? ''} onChange={e => update('model', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* Gear fields */}
        {category === 'gear' && (
          <>
            <div>
              <label className="form-label">Gear type *</label>
              <input className="form-input" required placeholder="e.g. Tent, Climbing Rope"
                value={form.type ?? ''} onChange={e => update('type', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Brand *</label>
                <input className="form-input" required placeholder="Coleman"
                  value={form.brand ?? ''} onChange={e => update('brand', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Specification</label>
                <input className="form-input" placeholder="2-person, 4-season…"
                  value={form.spec ?? ''} onChange={e => update('spec', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* Shared fields */}
        <div>
          <label className="form-label">Description</label>
          <textarea className="form-input resize-none" rows={3}
            placeholder="Describe the item's condition and any notes for borrowers…"
            value={form.description ?? ''} onChange={e => update('description', e.target.value)} />
        </div>
        <div>
          <label className="form-label">
            Image URL <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <input className="form-input" placeholder="https://…"
            value={form.imageUrl ?? ''} onChange={e => update('imageUrl', e.target.value)} />
          <p className="text-xs text-stone-400 mt-1">Paste a direct image link.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Adding…' : 'Add item'}
          </button>
        </div>
      </form>
    </>
  );
}
