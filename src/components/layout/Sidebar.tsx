'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { ComponentType } from 'react';
import { usePermissions } from '@/lib/permissionsHook';
import { useViewMode } from '@/lib/viewModeStore';
import { LayoutDashboard, Contact, ClipboardList, PersonStanding, Users } from 'lucide-react';
import { cx } from '@/utils/cx';

type NavItem = { label: string; href: string; mvpHide?: boolean; icon: ComponentType<{ className?: string }> };

const baseNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', mvpHide: true, icon: LayoutDashboard },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Programs', href: '/programs', icon: ClipboardList },
  { label: 'Exercises', href: '/exercises', icon: PersonStanding },
];

const ownerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', mvpHide: true, icon: LayoutDashboard },
  { label: 'Employees', href: '/employees', icon: Contact },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Programs', href: '/programs', icon: ClipboardList },
  { label: 'Exercises', href: '/exercises', icon: PersonStanding },
];

export default function Sidebar() {
  const pathname = usePathname();
  const can = usePermissions();
  const viewMode = useViewMode();

  const navItems = can.canViewEmployeesTab ? ownerNavItems : baseNavItems;

  return (
    <nav className="fixed top-10 left-0 z-[100] flex h-[calc(100vh-40px)] w-60 shrink-0 flex-col bg-secondary_alt px-4 py-6">
      {/* Wordmark */}
      <Link href="/" className="mb-6 block">
        <span className="font-display text-2xl font-bold text-primary">Rea</span>
      </Link>

      <div className="flex flex-col gap-1">
        {navItems.filter((item) => !(viewMode === 'mvp' && item.mvpHide)).map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} title={label}>
              <div className={cx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 cursor-pointer',
                isActive ? 'bg-quaternary' : 'hover:bg-secondary'
              )}>
                <Icon className={cx('size-5 shrink-0', isActive ? 'text-primary' : 'text-quaternary')} />
                <span className={cx('text-sm', isActive ? 'font-medium text-primary' : 'font-medium text-secondary')}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
