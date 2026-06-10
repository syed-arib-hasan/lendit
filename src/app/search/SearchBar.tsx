'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({
  defaultQ, defaultCategory, defaultSort,
}: { defaultQ: string; defaultCategory: string; defaultSort: string }) {
  const router = useRouter();
  const [q, setQ]               = useState(defaultQ);
  const [category, setCategory] = useState(defaultCategory);
  const [sort, setSort]         = useState(defaultSort);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ q, category, sort });
    router.push(`/search?${params}`);
  }

  return (
    <form onSubmit={submit} className="card p-4 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[160px]">
        <label className="form-label">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            className="form-input pl-9"
            placeholder="Book title, part name…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="form-label">Category</label>
        <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          <option value="book">Books</option>
          <option value="electronic">Electronics</option>
          <option value="gear">Outdoor gear</option>
        </select>
      </div>
      <div>
        <label className="form-label">Filter by</label>
        <select className="form-input" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="availability">Availability</option>
          <option value="location">Near me</option>
        </select>
      </div>
      <button type="submit" className="btn-primary">Search</button>
    </form>
  );
}
