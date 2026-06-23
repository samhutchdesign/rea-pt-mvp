'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Select, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import TopBar from '@/components/layout/TopBar';

const { Title, Text } = Typography;

interface Field { id: string; label: string; type: string; }

const typeOptions = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'dropdown', label: 'Dropdown' },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<Field[]>([{ id: '1', label: '', type: 'text' }]);

  const addField = () => setFields((prev) => [...prev, { id: Date.now().toString(), label: '', type: 'text' }]);
  const removeField = (id: string) => setFields((prev) => prev.filter((f) => f.id !== id));
  const updateField = (id: string, key: keyof Field, value: string) =>
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, [key]: value } : f));

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Documents', href: '/documents' }, { label: 'New Form' }]} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 700 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 24 }}>Create New Form</Title>

        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 4, fontSize: 13 }}>Form Name</div>
          <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
        </div>

        <Text strong style={{ display: 'block', marginBottom: 16 }}>Fields</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {fields.map((field, i) => (
            <Card key={field.id} styles={{ body: { padding: 12, display: 'flex', gap: 16, alignItems: 'center' } }}>
              <Text type="secondary" style={{ minWidth: 24 }}>{i + 1}.</Text>
              <Input
                placeholder="Field Label"
                style={{ flexGrow: 1 }}
                value={field.label}
                onChange={(e) => updateField(field.id, 'label', e.target.value)}
              />
              <Select
                style={{ minWidth: 140 }}
                value={field.type}
                onChange={(val) => updateField(field.id, 'type', val)}
                options={typeOptions}
              />
              <Button
                type="text"
                size="small"
                onClick={() => removeField(field.id)}
                disabled={fields.length === 1}
                icon={<DeleteOutlined />}
                style={{ color: '#9E9E9E' }}
              />
            </Card>
          ))}
        </div>

        <Button type="text" icon={<PlusOutlined />} onClick={addField} style={{ marginBottom: 32 }}>Add Field</Button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <Button onClick={() => router.push('/documents')}>Cancel</Button>
          <Button type="primary" onClick={() => router.push('/documents')}>Save Form</Button>
        </div>
      </div>
    </>
  );
}
