'use client';
import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cx } from '@/utils/cx';

interface ProgramImageUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export function ProgramImageUpload({ value, onChange }: ProgramImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  if (value) {
    return (
      <div className="group relative h-48 w-full overflow-hidden rounded-xl border border-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Program cover" className="size-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Remove image"
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-tertiary transition-colors hover:bg-white"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cx(
        'flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors',
        isDragging ? 'border-brand-500 bg-brand-50' : 'border-secondary bg-secondary_alt hover:bg-secondary'
      )}
    >
      <Upload size={22} className="text-quaternary" />
      <span className="text-sm text-tertiary">Choose an image or drag and drop it here</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
