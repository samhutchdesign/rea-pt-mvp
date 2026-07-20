'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Plus, Trash2 } from 'lucide-react';

interface Field {
  id: string;
  label: string;
  type: string;
}

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

  const addField = () =>
    setFields((prev) => [...prev, { id: Date.now().toString(), label: '', type: 'text' }]);

  const removeField = (id: string) =>
    setFields((prev) => prev.filter((f) => f.id !== id));

  const updateField = (id: string, key: keyof Field, value: string) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));

  return (
    <>
      <TopBar
        breadcrumbs={[{ label: 'All Documents', href: '/documents' }, { label: 'New Form' }]}
      />
      <div className="p-8 max-w-[700px]">
        <h2 className="text-xl font-semibold text-primary mt-0 mb-6">Create New Form</h2>

        <div className="mb-6">
          <div className="mb-1 text-sm text-secondary">Form Name</div>
          <Input value={formName} onChange={(v) => setFormName(v)} />
        </div>

        <span className="block font-semibold text-primary mb-4">Fields</span>
        <div className="flex flex-col gap-3 mb-4">
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="rounded-xl border border-secondary bg-primary shadow-xs px-3 py-3 flex gap-4 items-center"
            >
              <span className="text-tertiary text-sm min-w-[24px]">{i + 1}.</span>
              <div className="grow">
                <Input
                  placeholder="Field Label"
                  value={field.label}
                  onChange={(v) => updateField(field.id, 'label', v)}
                />
              </div>
              <NativeSelect
                wrapperClassName="w-36 shrink-0"
                value={field.type}
                onChange={(e) => updateField(field.id, 'type', e.target.value)}
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
              <button
                onClick={() => removeField(field.id)}
                disabled={fields.length === 1}
                className="text-tertiary hover:text-secondary transition-colors disabled:opacity-40 p-1 shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <Button color="tertiary" size="sm" iconLeading={Plus} onPress={addField} className="mb-8">
          Add Field
        </Button>

        <div className="flex justify-end gap-4">
          <Button color="secondary" size="sm" onPress={() => router.push('/documents')}>
            Cancel
          </Button>
          <Button color="primary" size="sm" onPress={() => router.push('/documents')}>
            Save Form
          </Button>
        </div>
      </div>
    </>
  );
}
