'use client';

import { AlertTriangle } from 'lucide-react';

export function ModalWarningMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-start gap-3 rounded-lg border border-[#993335] bg-[#f7eded] p-5">
      <AlertTriangle size={24} className="shrink-0 text-[#993335]" />
      <p className="m-0 text-base font-medium text-[#993335]">{children}</p>
    </div>
  );
}
