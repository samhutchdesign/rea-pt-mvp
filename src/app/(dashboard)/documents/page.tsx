'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Card, Tag, Button, Tooltip } from 'antd';
import { HeartFilled, HeartOutlined, FolderOutlined } from '@ant-design/icons';
import TopBar from '@/components/layout/TopBar';
import { mockDocuments } from '@/lib/mock-data';

const { Title, Text } = Typography;

export default function DocumentsPage() {
  const router = useRouter();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockDocuments.filter((d) => d.isFavorite).map((d) => d.id)));

  const toggleFavorite = (id: string) => setFavorites((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const filtered = showFavoritesOnly ? mockDocuments.filter((d) => favorites.has(d.id)) : mockDocuments;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Documents' }]} />
      <div style={{ paddingTop: 56, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Documents</Title>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Tag.CheckableTag
            checked={showFavoritesOnly}
            onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{ border: '1px solid #E0E0E0', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <HeartFilled style={{ fontSize: 14 }} /> Favorites
          </Tag.CheckableTag>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((doc) => (
            <Card
              key={doc.id}
              hoverable
              styles={{ body: { padding: 0 } }}
              onClick={() => router.push(`/documents/${doc.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FolderOutlined style={{ color: '#F57C00', fontSize: 22 }} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text strong>{doc.name}</Text>
                    {favorites.has(doc.id) && <HeartFilled style={{ fontSize: 14, color: '#E91E63' }} />}
                    {doc.isDefault && <Tag style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontSize: 10 }}>Default</Tag>}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Updated {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {doc.fields.length} fields
                  </Text>
                </div>
                <Tooltip title={favorites.has(doc.id) ? 'Unfavorite' : 'Favorite'}>
                  <Button
                    type="text"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}
                    icon={favorites.has(doc.id) ? <HeartFilled style={{ color: '#E91E63' }} /> : <HeartOutlined />}
                  />
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
