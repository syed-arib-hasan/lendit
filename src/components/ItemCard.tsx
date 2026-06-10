import Link from 'next/link';
import { MapPin, User } from 'lucide-react';

const PLACEHOLDER_IMAGES: Record<string, string> = {
  book:       'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
  electronic: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
  gear:       'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop',
};

const CATEGORY_LABELS: Record<string, string> = {
  book: 'Book', electronic: 'Electronic', gear: 'Gear',
};

interface ItemCardProps {
  id: number;
  category: string;
  title: string;
  subtitle: string;
  status: string;
  imageUrl?: string;
  lenderName: string;
  lenderLocation?: string;
  showBorrow?: boolean;
}

export default function ItemCard({
  id, category, title, subtitle, status, imageUrl,
  lenderName, lenderLocation, showBorrow = true,
}: ItemCardProps) {
  const img = imageUrl || PLACEHOLDER_IMAGES[category] || PLACEHOLDER_IMAGES.book;

  return (
    <div className="card overflow-hidden group hover:shadow-md transition-shadow duration-200">
      <div className="relative h-44 overflow-hidden bg-stone-100">
        <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${
            category === 'book' ? 'badge-book' :
            category === 'electronic' ? 'badge-electronic' : 'badge-gear'
          }`}>{CATEGORY_LABELS[category]}</span>
          <span className={`badge ${status === 'available' ? 'badge-available' : 'badge-borrowed'}`}>
            {status === 'available' ? 'Available' : 'Borrowed'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-stone-900 text-base leading-snug mb-0.5 truncate">{title}</h3>
        <p className="text-stone-500 text-sm mb-3 truncate">{subtitle}</p>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <User className="w-3 h-3" />
              <span>{lenderName}</span>
            </div>
            {lenderLocation && (
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <MapPin className="w-3 h-3" />
                <span>{lenderLocation}</span>
              </div>
            )}
          </div>
          {showBorrow && status === 'available' && (
            <Link href={`/borrow/${id}`} className="btn-primary text-xs px-3 py-2">
              View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
