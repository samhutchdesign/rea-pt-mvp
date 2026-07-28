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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {SIGNATURE_FONTS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cx(
            'rounded-lg border px-4 py-4 text-center transition-colors',
            value === f.id ? 'border-brand-600 ring-2 ring-brand-300 bg-brand-50' : 'border-secondary bg-secondary_alt hover:bg-secondary_alt/80',
          )}
        >
          <span style={{ fontFamily: f.variable }} className="block text-3xl text-primary truncate">
            {name}
          </span>
        </button>
      ))}
    </div>
  );
}
