'use client';
import { SIGNATURE_FONTS } from '@/lib/employeeSignatureStore';
import { cx } from '@/utils/cx';

interface SignatureFontPickerProps {
  name: string;
  value: string;
  onChange: (fontId: string) => void;
}

export function SignatureFontPicker({ name, value, onChange }: SignatureFontPickerProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {SIGNATURE_FONTS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cx(
            'w-full rounded-lg border p-5 text-left transition-colors',
            value === f.id ? 'border-brand-200 bg-brand-50' : 'border-secondary bg-secondary_alt hover:bg-secondary_alt/80',
          )}
        >
          <span style={{ fontFamily: f.variable }} className="block text-2xl leading-5 text-primary truncate">
            {name}
          </span>
        </button>
      ))}
    </div>
  );
}
