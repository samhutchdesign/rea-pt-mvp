'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { mockDocuments } from '@/lib/mock-data';
import { cx } from '@/utils/cx';
import { Folder, Heart } from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(mockDocuments.filter((d) => d.isFavorite).map((d) => d.id))
  );

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filtered = showFavoritesOnly
    ? mockDocuments.filter((d) => favorites.has(d.id))
    : mockDocuments;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Documents' }]} />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary m-0">Documents</h2>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors',
              showFavoritesOnly
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-secondary bg-primary text-secondary hover:bg-secondary_alt'
            )}
          >
            <Heart size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            Favorites
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-secondary bg-primary shadow-xs cursor-pointer hover:bg-secondary_alt transition-colors"
              onClick={() => router.push(`/documents/${doc.id}`)}
            >
              <div className="flex items-center gap-5 px-6 py-5">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                  <Folder size={22} className="text-yellow-600" />
                </div>
                <div className="grow">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-primary text-sm">{doc.name}</span>
                    {favorites.has(doc.id) && (
                      <Heart size={14} fill="currentColor" className="text-pink-500" />
                    )}
                    {doc.isDefault && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-tertiary text-xs">
                    Updated{' '}
                    {new Date(doc.updatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    · {doc.fields.length} fields
                  </span>
                </div>
                <button
                  title={favorites.has(doc.id) ? 'Unfavorite' : 'Favorite'}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(doc.id);
                  }}
                  className="p-1.5 rounded-lg text-tertiary hover:bg-secondary transition-colors"
                >
                  {favorites.has(doc.id) ? (
                    <Heart size={16} fill="currentColor" className="text-pink-500" />
                  ) : (
                    <Heart size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
