'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { ComponentType } from 'react';
import { usePermissions } from '@/lib/permissionsHook';
import { useViewMode } from '@/lib/viewModeStore';
import { List, Users, Zap } from 'lucide-react';
import { cx } from '@/utils/cx';

type NavItem = { label: string; href: string; mvpHref?: string; icon: ComponentType<{ className?: string }> };

const baseNavItems: NavItem[] = [
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Exercises', href: '/exercises', mvpHref: '/exercises-mvp', icon: Zap },
  { label: 'Programs', href: '/programs', icon: List },
];

const ownerNavItems: NavItem[] = [
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Exercises', href: '/exercises', mvpHref: '/exercises-mvp', icon: Zap },
  { label: 'Programs', href: '/programs', icon: List },
];

export default function Sidebar() {
  const pathname = usePathname();
  const can = usePermissions();
  const viewMode = useViewMode();
  const navItems = can.canManageStaff ? ownerNavItems : baseNavItems;

  return (
    <nav className="fixed top-10 left-0 z-[100] flex h-[calc(100vh-40px)] w-20 shrink-0 flex-col items-center border-r border-secondary bg-primary py-4">
      {/* Logo */}
      <div className="mb-6 mt-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white" style={{ letterSpacing: '-0.5px' }}>
          R
        </div>
      </div>

      {navItems.map(({ label, href, mvpHref, icon: Icon }) => {
        const resolvedHref = viewMode === 'mvp' && mvpHref ? mvpHref : href;
        const isActive = resolvedHref === '/' ? pathname === '/' : pathname.startsWith(resolvedHref);
        return (
          <Link key={href} href={resolvedHref} title={label} className="mb-1 w-full px-2">
            <div className={cx(
              'flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 transition-colors duration-150 cursor-pointer',
              isActive ? 'bg-brand-50' : 'hover:bg-secondary'
            )}>
              <Icon className={cx('size-5', isActive ? 'text-brand-600' : 'text-quaternary')} />
              <span className={cx('text-[10px] font-medium leading-none text-center', isActive ? 'text-brand-700 font-semibold' : 'text-quaternary')}>
                {label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
