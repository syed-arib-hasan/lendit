'use client';
import { useState } from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PLACEHOLDER: Record<string, string> = {
  book:       'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=280&fit=crop',
  electronic: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=280&fit=crop',
  gear:       'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=280&fit=crop',
};

export default function InventoryCard({ item }: { item: any }) {
  const router   = useRouter();
  const [deleting, setDeleting] = useState(false);
  const img = item.image_url || PLACEHOLDER[item.category] || PLACEHOLDER.book;

  async function handleDelete() {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/items/${item.id}`, { method: 'DELETE' });
    setDeleting(false);
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative h-40 overflow-hidden bg-stone-100">
        <img src={img} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <span className={`badge ${item.status === 'available' ? 'badge-available' : 'badge-borrowed'}`}>
            {item.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-stone-800 truncate">{item.name}</p>
        <p className="text-stone-500 text-sm truncate">{item.subtitle}</p>
        <p className="text-xs text-stone-400 mt-1 capitalize">{item.category}</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDelete}
            disabled={deleting || item.status === 'borrowed'}
            className="btn-danger flex items-center gap-1.5 text-xs flex-1 justify-center"
            title={item.status === 'borrowed' ? 'Cannot delete a borrowed item' : undefined}
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
