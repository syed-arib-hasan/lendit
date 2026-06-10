import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import AppLayout from '@/components/AppLayout';
import BorrowButton from './BorrowButton';
import { MapPin, Phone, Mail, User, Tag, Star } from 'lucide-react';

const PLACEHOLDER: Record<string, string> = {
  book:       'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop',
  electronic: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
  gear:       'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop',
};

export default async function BorrowPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const email = session.user.email;
  const itemId = Number(params.id);

  const [itemRows, lenderRows, ratingRows, existingRequest] = await Promise.all([
    sql`
      SELECT i.id, i.category, i.status, i.owner_email,
             b.title, b.author, b.publisher, b.description, b.image_url AS img,
             e.name AS e_name, e.brand AS e_brand, e.model, e.description AS e_desc, e.image_url AS e_img,
             g.type AS g_type, g.spec, g.brand AS g_brand, g.description AS g_desc, g.image_url AS g_img
      FROM items i
      LEFT JOIN books b ON b.item_id = i.id
      LEFT JOIN electronics e ON e.item_id = i.id
      LEFT JOIN gear g ON g.item_id = i.id
      WHERE i.id = ${itemId}
    `,
    sql`
      SELECT u.name, u.email, u.phone, u.location, u.latitude, u.longitude, u.image_url
      FROM items i JOIN users u ON u.email = i.owner_email WHERE i.id = ${itemId}
    `,
    sql`
      SELECT COALESCE(AVG(r.rating), 0) AS avg, COUNT(*) AS total
      FROM items i JOIN ratings r ON r.borrower_email = i.owner_email WHERE i.id = ${itemId}
    `,
    sql`
      SELECT id FROM borrow_requests
      WHERE item_id = ${itemId} AND borrower_email = ${email} AND status = 'pending'
    `,
  ]);

  if (!itemRows[0]) notFound();

  const item   = itemRows[0];
  const lender = lenderRows[0];
  const rating = ratingRows[0];
  const alreadyRequested = existingRequest.length > 0;

  // Resolve display fields
  let title = '', subtitle = '', extra = '', description = '', img = '';
  if (item.category === 'book') {
    title = item.title; subtitle = `by ${item.author}`; extra = item.publisher;
    description = item.description; img = item.img;
  } else if (item.category === 'electronic') {
    title = item.e_name; subtitle = item.e_brand; extra = item.model;
    description = item.e_desc; img = item.e_img;
  } else {
    title = item.g_type; subtitle = item.g_brand; extra = item.spec;
    description = item.g_desc; img = item.g_img;
  }

  const itemImage   = img   || PLACEHOLDER[item.category];
  const lenderImage = lender.image_url || `https://api.dicebear.com/7.x/personas/svg?seed=${lender.email}`;
  const dueDate     = new Date(); dueDate.setDate(dueDate.getDate() + 14);
  const isOwnItem   = item.owner_email === email;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="text-stone-500 mt-1">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card overflow-hidden">
              <img src={itemImage} alt={title} className="w-full h-72 object-cover" />
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`badge ${
                    item.category === 'book' ? 'badge-book' :
                    item.category === 'electronic' ? 'badge-electronic' : 'badge-gear'
                  }`}>{item.category}</span>
                  <span className={`badge ${item.status === 'available' ? 'badge-available' : 'badge-borrowed'}`}>
                    {item.status}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
                  {item.category === 'book' && (
                    <>
                      <div><dt className="text-stone-400 mb-0.5">Author</dt><dd className="font-medium">{item.author}</dd></div>
                      <div><dt className="text-stone-400 mb-0.5">Publisher</dt><dd className="font-medium">{item.publisher}</dd></div>
                    </>
                  )}
                  {item.category === 'electronic' && (
                    <>
                      <div><dt className="text-stone-400 mb-0.5">Brand</dt><dd className="font-medium">{item.e_brand}</dd></div>
                      <div><dt className="text-stone-400 mb-0.5">Model</dt><dd className="font-medium">{item.model}</dd></div>
                    </>
                  )}
                  {item.category === 'gear' && (
                    <>
                      <div><dt className="text-stone-400 mb-0.5">Brand</dt><dd className="font-medium">{item.g_brand}</dd></div>
                      <div><dt className="text-stone-400 mb-0.5">Spec</dt><dd className="font-medium">{item.spec}</dd></div>
                    </>
                  )}
                  <div><dt className="text-stone-400 mb-0.5">Return by</dt><dd className="font-medium">{dueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</dd></div>
                </dl>

                {description && (
                  <div>
                    <h3 className="font-semibold text-stone-800 mb-2">Description</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            {lender.latitude && lender.longitude && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-stone-100">
                  <h3 className="font-semibold text-stone-800">Pickup location</h3>
                </div>
                <iframe
                  className="w-full h-56"
                  src={`https://www.google.com/maps?q=${lender.latitude},${lender.longitude}&output=embed`}
                  allowFullScreen loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Lender card */}
            <div className="card p-5">
              <h3 className="font-semibold text-stone-800 mb-4">Lender</h3>
              <div className="flex items-start gap-3 mb-4">
                <img src={lenderImage} alt={lender.name}
                  className="w-14 h-14 rounded-full object-cover bg-stone-100 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-stone-800">{lender.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm text-stone-500">
                      {Number(rating.avg).toFixed(1)} ({rating.total} ratings)
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-stone-600">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="truncate">{lender.email}</span>
                </div>
                {lender.phone && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Phone className="w-4 h-4 text-stone-400" />
                    <span>{lender.phone}</span>
                  </div>
                )}
                {lender.location && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <MapPin className="w-4 h-4 text-stone-400" />
                    <span>{lender.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Borrow action */}
            {!isOwnItem && (
              <BorrowButton
                itemId={itemId}
                lenderEmail={item.owner_email}
                available={item.status === 'available'}
                alreadyRequested={alreadyRequested}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
