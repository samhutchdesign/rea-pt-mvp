import type { ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs text-secondary">{label}</span>
      {children}
    </div>
  );
}
