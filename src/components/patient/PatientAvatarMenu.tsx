'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/base/avatar/avatar';
import { ArrowLeft, Building2, CircleUserRound, ExternalLink, LogOut } from 'lucide-react';
import { cx } from '@/utils/cx';

interface PatientAvatarMenuProps {
  name: string;
  email: string;
  initials: string;
}

const NAV_ITEMS = [
  { key: 'practitioner', label: 'Your Practitioner', icon: Building2, href: '/practitioner' },
  { key: 'profile', label: 'Your Profile', icon: CircleUserRound, href: '/profile' },
] as const;

const LEGAL_ITEMS = ['About Rea', 'Terms & Conditions', 'Privacy Policy'];

export default function PatientAvatarMenu({ name, email, initials }: PatientAvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      // On mobile the panel is a full-screen takeover with its own back
      // button, so only the desktop anchored panel needs click-outside.
      if (window.innerWidth < 640) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
        aria-label="Open account menu"
      >
        <Avatar size="lg" initials={initials} />
      </button>

      {open && (
        <div
          className={cx(
            'z-50 flex flex-col gap-2 bg-primary p-4',
            'fixed inset-x-0 top-10 bottom-0 w-screen overflow-y-auto',
            'sm:absolute sm:inset-auto sm:top-14 sm:right-0 sm:bottom-auto sm:h-auto sm:w-[360px] sm:rounded-lg sm:border sm:border-primary sm:shadow-[0px_0px_5px_rgba(0,0,0,0.07)]'
          )}
        >
          <button
            onClick={() => setOpen(false)}
            className="flex size-12 items-center justify-center rounded-full border border-tertiary bg-primary text-primary hover:bg-secondary sm:hidden"
            aria-label="Close menu"
          >
            <ArrowLeft size={24} strokeWidth={1.25} />
          </button>

          <div className="flex flex-col gap-3 px-2 py-4">
            <p className="font-display text-[18px] leading-5 font-medium tracking-[0.1px] text-primary">{name}</p>
            <p className="text-xs leading-4 text-secondary">{email}</p>
          </div>
          <div className="border-t border-secondary" />

          <div className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setOpen(false);
                  if (item.href) router.push(item.href);
                }}
                className="flex h-12 w-full items-center gap-2 rounded-lg px-2 py-3 text-left text-base text-secondary transition-colors hover:bg-secondary"
              >
                <item.icon size={24} strokeWidth={1.25} className="shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
          <div className="border-t border-secondary" />

          <div className="flex flex-col">
            {LEGAL_ITEMS.map((label) => (
              <a
                key={label}
                href="#"
                onClick={() => setOpen(false)}
                className="flex h-12 w-full items-center justify-between gap-2 rounded-lg px-2 py-3 text-left text-base text-secondary transition-colors hover:bg-secondary"
              >
                {label}
                <ExternalLink size={24} strokeWidth={1.25} className="shrink-0" />
              </a>
            ))}
          </div>
          <div className="border-t border-secondary" />

          <button
            onClick={() => {
              setOpen(false);
              router.push('/login');
            }}
            className="flex h-12 w-full items-center gap-2 rounded-lg px-2 py-3 text-left text-base text-secondary transition-colors hover:bg-secondary"
          >
            <LogOut size={24} strokeWidth={1.25} className="shrink-0" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
