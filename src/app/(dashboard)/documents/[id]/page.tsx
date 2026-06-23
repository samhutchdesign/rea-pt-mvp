'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Input, Tag, Divider } from 'antd';
import TopBar from '@/components/layout/TopBar';
import { EditOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { mockDocuments } from '@/lib/mock-data';

const { Title, Text } = Typography;

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const doc = mockDocuments.find((d) => d.id === id);
  const [isFavorite, setIsFavorite] = useState(doc?.isFavorite ?? false);

  if (!doc) return <div style={{ padding: 32 }}><Text>Document not found.</Text></div>;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Documents', href: '/documents' }, { label: doc.name }]} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Title level={2} style={{ margin: 0 }}>{doc.name}</Title>
              {doc.isDefault && <Tag style={{ background: '#EDE7F6', color: '#6750A4', border: 'none' }}>Default</Tag>}
              <Button
                type="text"
                shape="circle"
                onClick={() => setIsFavorite(!isFavorite)}
                icon={isFavorite ? <HeartFilled style={{ color: '#E91E63' }} /> : <HeartOutlined />}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Updated {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {doc.fields.length} fields
            </Text>
          </div>
          <Button icon={<EditOutlined />} onClick={() => router.push('/documents/new')}>Edit</Button>
        </div>

        <Divider style={{ marginBottom: 24 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {doc.fields.map((field) => (
            <div key={field.id}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>{field.label}</Text>
              {field.type === 'dropdown' ? (
                <div style={{ border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.04)' }}>
                  <Text type="secondary">Options: {field.options?.join(', ')}</Text>
                </div>
              ) : field.type === 'checkbox' ? (
                <div style={{ border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: '1.5px solid #9E9E9E', borderRadius: 4 }} />
                  <Text type="secondary">{field.label}</Text>
                </div>
              ) : field.type === 'textarea' ? (
                <Input.TextArea
                  rows={3}
                  readOnly
                  placeholder={`Enter ${field.label.toLowerCase()}…`}
                  style={{ background: 'rgba(0,0,0,0.04)', color: '#49454F' }}
                />
              ) : (
                <Input
                  readOnly
                  placeholder={field.type === 'date' ? 'MM/DD/YYYY' : `Enter ${field.label.toLowerCase()}…`}
                  style={{ background: 'rgba(0,0,0,0.04)', color: '#49454F' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
