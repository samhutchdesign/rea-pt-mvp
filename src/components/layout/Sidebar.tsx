'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { ComponentType } from 'react';
import { usePermissions } from '@/lib/permissionsHook';
import { useViewMode } from '@/lib/viewModeStore';
import { useRole } from '@/lib/roleStore';
import { useStaffPersona } from '@/lib/staffPersonaStore';
import { useOrgId, setOrgId } from '@/lib/orgStore';
import { setLocationId } from '@/lib/locationStore';
import { mockEmployees, mockClinicLocations, mockClinics } from '@/lib/mock-data';
import { LayoutDashboard, List, Users, Zap, ChevronDown } from 'lucide-react';
import { cx } from '@/utils/cx';

type NavItem = { label: string; href: string; mvpHref?: string; mvpHide?: boolean; icon: ComponentType<{ className?: string }> };

const baseNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', mvpHide: true, icon: LayoutDashboard },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Exercises', href: '/exercises', mvpHref: '/exercises-mvp', icon: Zap },
  { label: 'Programs', href: '/programs', icon: List },
];

const ownerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', mvpHide: true, icon: LayoutDashboard },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Exercises', href: '/exercises', mvpHref: '/exercises-mvp', icon: Zap },
  { label: 'Programs', href: '/programs', icon: List },
];

const ORG_COLORS: Record<string, string> = {
  clinic1: 'bg-brand-600',
  clinic2: 'bg-teal-600',
};

export default function Sidebar() {
  const pathname = usePathname();
  const can = usePermissions();
  const viewMode = useViewMode();
  const role = useRole();
  const persona = useStaffPersona();
  const activeOrgId = useOrgId();

  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const orgMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (orgMenuRef.current && !orgMenuRef.current.contains(e.target as Node)) {
        setOrgMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Compute available orgs for this user
  const availableClinics = useMemo(() => {
    const empId = role === 'staff' ? persona : role === 'admin' ? 'emp1' : null;
    const emp = empId ? mockEmployees.find((e) => e.id === empId) : null;
    const orgIds = new Set(
      (emp?.locationIds ?? [])
        .map((locId) => mockClinicLocations.find((l) => l.id === locId)?.orgId)
        .filter(Boolean) as string[]
    );
    if (orgIds.size === 0) return [mockClinics[0]];
    return mockClinics.filter((c) => orgIds.has(c.id));
  }, [role, persona]);

  const activeClinic = mockClinics.find((c) => c.id === activeOrgId) ?? mockClinics[0];
  const hasMultipleOrgs = availableClinics.length > 1 && viewMode === 'full';

  const navItems = can.canManageStaff ? ownerNavItems : baseNavItems;

  return (
    <nav className="fixed top-10 left-0 z-[100] flex h-[calc(100vh-40px)] w-20 shrink-0 flex-col items-center border-r border-secondary bg-primary py-4">
      {/* Org logo / switcher */}
      <div ref={orgMenuRef} className="relative mb-6 mt-2">
        <button
          onClick={() => hasMultipleOrgs && setOrgMenuOpen((v) => !v)}
          className={cx('flex flex-col items-center gap-0.5', hasMultipleOrgs && 'cursor-pointer')}
        >
          <div className={cx(
            'flex size-9 items-center justify-center rounded-full text-sm font-bold text-white',
            ORG_COLORS[activeOrgId] ?? 'bg-brand-600'
          )}>
            {activeClinic.logoInitials}
          </div>
          {hasMultipleOrgs && <ChevronDown size={10} className="text-quaternary" />}
        </button>

        {orgMenuOpen && (
          <div className="absolute left-full top-0 ml-3 z-[200] w-52 rounded-xl border border-secondary bg-primary shadow-lg py-1">
            <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
              Switch Organization
            </p>
            {availableClinics.map((clinic) => (
              <button
                key={clinic.id}
                onClick={() => { setOrgId(clinic.id); setLocationId('all'); setOrgMenuOpen(false); }}
                className={cx(
                  'w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors',
                  activeOrgId === clinic.id ? 'bg-brand-50' : 'hover:bg-secondary'
                )}
              >
                <div className={cx(
                  'size-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0',
                  ORG_COLORS[clinic.id] ?? 'bg-brand-600'
                )}>
                  {clinic.logoInitials}
                </div>
                <span className={cx(
                  'text-sm font-medium leading-tight',
                  activeOrgId === clinic.id ? 'text-brand-700' : 'text-primary'
                )}>
                  {clinic.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {navItems.filter((item) => !(viewMode === 'mvp' && item.mvpHide)).map(({ label, href, mvpHref, icon: Icon }) => {
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
