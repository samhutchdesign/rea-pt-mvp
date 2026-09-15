'use client';
import { Toaster } from 'sonner';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        icons={{
          success: <CheckCircle size={24} />,
          error: <AlertTriangle size={24} />,
          warning: <AlertTriangle size={24} />,
          info: <Info size={24} />,
        }}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'flex items-start gap-3 w-[400px] max-w-[550px] rounded-lg border p-5 shadow-[0px_0px_5px_rgba(0,0,0,0.07)] [font-family:var(--font-body)]',
            title: 'm-0 text-base font-medium leading-5',
            icon: 'shrink-0 m-0',
            default: 'bg-primary border-secondary text-primary',
            success: 'bg-[#edf7ed] border-[#206020] text-[#206020]',
            error: 'bg-[#f7eded] border-[#993335] text-[#993335]',
            warning: 'bg-[#f7f4ed] border-[#bf9540] text-[#8e6616]',
            info: 'bg-secondary_alt border-secondary text-primary',
          },
        }}
      />
    </>
  );
}
