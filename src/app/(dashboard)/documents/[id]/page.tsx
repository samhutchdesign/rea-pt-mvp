'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { mockDocuments } from '@/lib/mock-data';
import { Button } from '@/components/base/buttons/button';
import { Divider } from '@/components/ui/divider';
import { Heart, Pencil } from 'lucide-react';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const doc = mockDocuments.find((d) => d.id === id);
  const [isFavorite, setIsFavorite] = useState(doc?.isFavorite ?? false);

  if (!doc)
    return (
      <div className="p-8">
        <span className="text-tertiary text-sm">Document not found.</span>
      </div>
    );

  return (
    <>
      <TopBar
        breadcrumbs={[{ label: 'All Documents', href: '/documents' }, { label: doc.name }]}
      />
      <div className="p-8 max-w-[700px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-xl font-semibold text-primary m-0">{doc.name}</h2>
              {doc.isDefault && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                  Default
                </span>
              )}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-1.5 rounded-full text-tertiary hover:bg-secondary_alt transition-colors"
              >
                {isFavorite ? (
                  <Heart size={16} fill="currentColor" className="text-pink-500" />
                ) : (
                  <Heart size={16} />
                )}
              </button>
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
          <Button
            color="secondary"
            size="sm"
            iconLeading={Pencil}
            onPress={() => router.push('/documents/new')}
          >
            Edit
          </Button>
        </div>

        <Divider className="mb-6" />

        <div className="flex flex-col gap-5">
          {doc.fields.map((field) => (
            <div key={field.id}>
              <span className="block text-tertiary text-xs mb-1">{field.label}</span>
              {field.type === 'dropdown' ? (
                <div className="border border-secondary rounded-lg px-3 py-2 bg-secondary text-tertiary text-sm">
                  Options: {field.options?.join(', ')}
                </div>
              ) : field.type === 'checkbox' ? (
                <div className="border border-secondary rounded-lg px-3 py-2 bg-secondary flex items-center gap-2">
                  <div className="w-4 h-4 border border-secondary rounded shrink-0" />
                  <span className="text-tertiary text-sm">{field.label}</span>
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  readOnly
                  placeholder={`Enter ${field.label.toLowerCase()}…`}
                  className="w-full rounded-lg border border-secondary bg-secondary px-3 py-2 text-sm text-tertiary placeholder:text-placeholder outline-none resize-none"
                />
              ) : (
                <input
                  readOnly
                  placeholder={
                    field.type === 'date' ? 'MM/DD/YYYY' : `Enter ${field.label.toLowerCase()}…`
                  }
                  className="w-full rounded-lg border border-secondary bg-secondary px-3 py-2 text-sm text-tertiary placeholder:text-placeholder outline-none"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
