'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockPhysio, mockClinicLocations, mockNotifications, mockEmployees } from '@/lib/mock-data';
import { roleLabel } from '@/lib/permissions';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';
import { useViewMode } from '@/lib/viewModeStore';
import { useLocationId, setLocationId } from '@/lib/locationStore';
import { useStaffPersona } from '@/lib/staffPersonaStore';
import { useOrgId } from '@/lib/orgStore';
import { Bell, ChevronRight, ChevronDown, MapPin } from 'lucide-react';
import { cx } from '@/utils/cx';

interface TopBarProps {
  breadcrumbs: { label: string; href?: string }[];
}

export default function TopBar({ breadcrumbs }: TopBarProps) {
  const router = useRouter();
  const can = usePermissions();
  const role = useRole();
  const persona = useStaffPersona();
  const activeOrgId = useOrgId();
  const viewMode = useViewMode();
  const selectedLocId = useLocationId();

  const [menuOpen, setMenuOpen] = useState(false);
  const [locMenuOpen, setLocMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const locMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (locMenuRef.current && !locMenuRef.current.contains(e.target as Node)) setLocMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const availableLocations = useMemo(() => {
    if (role === 'owner') return mockClinicLocations.filter((l) => l.orgId === activeOrgId);
    const empId = role === 'admin' ? 'emp1' : persona;
    const locIds = new Set(mockEmployees.find((e) => e.id === empId)?.locationIds ?? []);
    return mockClinicLocations.filter((l) => locIds.has(l.id) && l.orgId === activeOrgId);
  }, [role, persona, activeOrgId]);

  const currentLoc = availableLocations.find((l) => l.id === selectedLocId);
  const locLabel = currentLoc?.city ?? (availableLocations.length === 1 ? availableLocations[0].city : 'All Locations');
  const hasMultiple = availableLocations.length > 1;

  const menuItems = [
    ...(can.canManageClinic ? [{ key: 'org', label: 'Organization Profile', href: '/clinic' }] : []),
    ...(can.canManageLocation ? [{ key: 'clinic', label: 'Clinic Profile', href: `/clinic/${mockPhysio.locationId}` }] : []),
    ...(can.canManageBilling ? [{ key: 'billing', label: 'Billing', href: '/billing' }] : []),
    { key: 'profile', label: 'Your Profile', href: '/account/profile' },
    { key: 'settings', label: 'Settings', href: '/account/settings' },
    { key: 'email', label: 'Email Change', href: '/account/email' },
    { key: 'password', label: 'Password Reset', href: '/account/password' },
  ];

  return (
    <div className="fixed top-10 left-20 z-[99] flex h-14 w-[calc(100%-80px)] items-center border-b border-secondary bg-primary px-6">
      {viewMode === 'mvp' && (
        <span className="mr-3 shrink-0 rounded-full bg-[#1E4D2B] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#A8D5A2]">
          MVP
        </span>
      )}

      {/* Breadcrumbs */}
      <nav className="flex flex-1 items-center gap-1 min-w-0">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight size={10} className="shrink-0 text-quaternary" />}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="truncate text-sm text-tertiary underline hover:text-secondary">
                  {crumb.label}
                </Link>
              ) : (
                <span className={cx('truncate text-sm', isLast ? 'font-medium text-primary' : 'text-tertiary')}>
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      {/* Location pill */}
      <div className="relative shrink-0 mr-3" ref={locMenuRef}>
        <button
          onClick={() => hasMultiple && setLocMenuOpen((v) => !v)}
          className={cx(
            'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            hasMultiple
              ? 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 cursor-pointer'
              : 'border-secondary bg-secondary text-secondary cursor-default'
          )}
        >
          <MapPin size={11} className="shrink-0" />
          <span>{locLabel}</span>
          {hasMultiple && <ChevronDown size={11} className="shrink-0" />}
        </button>

        {locMenuOpen && hasMultiple && (
          <div className="absolute right-0 top-9 z-50 w-52 rounded-xl border border-secondary bg-primary shadow-lg py-1">
            <button
              onClick={() => { setLocationId('all'); setLocMenuOpen(false); }}
              className={cx(
                'w-full px-4 py-2 text-left text-sm transition-colors',
                selectedLocId === 'all'
                  ? 'font-semibold text-brand-700 bg-brand-50'
                  : 'text-secondary hover:bg-secondary'
              )}
            >
              All Locations
            </button>
            {availableLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => { setLocationId(loc.id); setLocMenuOpen(false); }}
                className={cx(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  selectedLocId === loc.id
                    ? 'font-semibold text-brand-700 bg-brand-50'
                    : 'text-secondary hover:bg-secondary'
                )}
              >
                {loc.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Avatar + dropdown */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors cursor-pointer"
        >
          {mockPhysio.avatarInitials}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-secondary bg-primary shadow-lg py-1">
            <div className="px-4 py-3 border-b border-secondary">
              <p className="text-sm font-semibold text-primary">{mockPhysio.firstName} {mockPhysio.lastName}</p>
              <p className="text-xs font-medium text-brand-600 mt-0.5">{roleLabel(role)}</p>
              <p className="text-xs text-tertiary mt-0.5">{mockPhysio.email}</p>
            </div>
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setMenuOpen(false); router.push(item.href); }}
                  className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-secondary transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="border-t border-secondary py-1">
              <button
                onClick={() => { setMenuOpen(false); router.push('/login'); }}
                className="w-full px-4 py-2 text-left text-sm text-tertiary hover:bg-secondary transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification bell */}
      {viewMode === 'full' && (
        <div className="relative shrink-0 ml-1">
          <button
            onClick={() => router.push('/notifications')}
            className="relative flex size-9 items-center justify-center rounded-full text-quaternary hover:bg-secondary hover:text-secondary transition-colors"
          >
            <Bell size={18} />
            {mockNotifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-600" />
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
