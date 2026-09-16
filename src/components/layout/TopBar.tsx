'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mockClinicLocations, mockNotifications, mockEmployees } from '@/lib/mock-data';
import { roleLabel } from '@/lib/permissions';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { useViewMode } from '@/lib/viewModeStore';
import { useLocationId, setLocationId } from '@/lib/locationStore';
import { useStaffPersona } from '@/lib/staffPersonaStore';
import { useOrgId } from '@/lib/orgStore';
import { Avatar } from '@/components/base/avatar/avatar';
import { Bell, Building2, ChevronDown, CircleUserRound, Hospital, LogOut, MapPin, Settings } from 'lucide-react';
import { cx } from '@/utils/cx';

interface TopBarProps {
  breadcrumbs: { label: string; href?: string }[];
}

export default function TopBar({}: TopBarProps) {
  const router = useRouter();
  const can = usePermissions();
  const role = useRole();
  const persona = useStaffPersona();
  const activeOrgId = useOrgId();
  const viewMode = useViewMode();
  const selectedLocId = useLocationId();
  const identity = useCurrentIdentity();

  const [menuOpen, setMenuOpen] = useState(false);
  const [locMenuOpen, setLocMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const locMenuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (locMenuRef.current && !locMenuRef.current.contains(e.target as Node)) setLocMenuOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
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
    ...(can.canManageClinic ? [{ key: 'org', label: 'Organization Profile', href: '/clinic', icon: Building2 }] : []),
    ...(can.canManageLocation ? [{ key: 'clinic', label: 'Clinic Profile', href: `/clinic/${identity.locationIds[0] ?? 'loc1'}`, icon: Hospital }] : []),
    { key: 'profile', label: 'Your Profile', href: '/account/profile', icon: CircleUserRound },
    { key: 'settings', label: 'Settings', href: '/account/settings', icon: Settings },
  ];

  return (
    <div className="relative z-[60] flex h-20 w-full items-center gap-6 bg-transparent px-6">
      {/* Breadcrumbs hidden for now */}
      <nav className="flex flex-1 items-center gap-1 min-w-0" />

      {/* Location dropdown */}
      <div className="relative shrink-0" ref={locMenuRef}>
        <button
          onClick={() => hasMultiple && setLocMenuOpen((v) => !v)}
          className={cx(
            'flex h-12 items-center gap-1 rounded-lg border border-primary bg-primary px-3 text-base text-primary transition-colors',
            hasMultiple ? 'hover:bg-secondary cursor-pointer' : 'cursor-default'
          )}
        >
          <MapPin size={24} className="shrink-0" strokeWidth={1.25} />
          <span>{locLabel}</span>
          {hasMultiple && <ChevronDown size={24} className="shrink-0" strokeWidth={1.25} />}
        </button>

        {locMenuOpen && hasMultiple && (
          <div className="absolute right-0 top-14 z-50 w-52 rounded-xl border border-secondary bg-primary py-1">
            <button
              onClick={() => { setLocationId('all'); setLocMenuOpen(false); }}
              className={cx(
                'w-full px-4 py-2 text-left text-base transition-colors',
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
                  'w-full px-4 py-2 text-left text-base transition-colors',
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
          className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
        >
          <Avatar
            size="lg"
            src={identity.avatarUrl}
            alt={`${identity.firstName} ${identity.lastName}`}
            initials={identity.avatarInitials}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 z-50 flex w-[260px] flex-col gap-1 rounded-lg border border-secondary bg-primary p-2 shadow-[0px_0px_5px_rgba(0,0,0,0.07)]">
            <div className="flex flex-col gap-3 px-2 py-4">
              <p className="font-display m-0 text-[18px] leading-5 font-medium tracking-[0.1px] text-primary">{identity.firstName} {identity.lastName}</p>
              <div className="flex flex-col gap-2">
                <p className="m-0 text-xs leading-4 text-secondary">{roleLabel(role)}</p>
                <p className="m-0 text-xs leading-4 text-secondary">{identity.email}</p>
              </div>
            </div>
            <div className="w-full border-t border-secondary" />
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setMenuOpen(false); router.push(item.href); }}
                className="flex h-12 w-full items-center gap-2 rounded-lg px-2 py-3 text-left text-base text-secondary transition-colors hover:bg-secondary"
              >
                <item.icon size={24} strokeWidth={1.25} className="shrink-0" />
                {item.label}
              </button>
            ))}
            <div className="w-full border-t border-secondary" />
            <button
              onClick={() => { setMenuOpen(false); router.push('/login'); }}
              className="flex h-12 w-full items-center gap-2 rounded-lg px-2 py-3 text-left text-base text-secondary transition-colors hover:bg-secondary"
            >
              <LogOut size={24} strokeWidth={1.25} className="shrink-0" />
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Notification bell */}
      {viewMode === 'full' && (
        <div className="relative shrink-0" ref={bellRef}>
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative flex size-9 items-center justify-center rounded-full text-quaternary hover:bg-secondary hover:text-secondary transition-colors"
          >
            <Bell size={18} strokeWidth={1.25} />
            {mockNotifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-600" />
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-secondary bg-primary overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-secondary">
                <p className="text-base font-semibold text-primary">Notifications</p>
                {mockNotifications.filter((n) => !n.read).length > 0 && (
                  <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {mockNotifications.filter((n) => !n.read).length} new
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.slice(0, 5).map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => { setBellOpen(false); router.push(notif.patientId ? `/patients/${notif.patientId}/documents` : '/notifications'); }}
                    className={cx(
                      'w-full flex items-start gap-3 px-4 py-3 text-left border-b border-secondary last:border-0 transition-colors',
                      !notif.read ? 'bg-secondary_alt hover:bg-secondary' : 'hover:bg-secondary_alt'
                    )}
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell size={13} className="text-brand-600" strokeWidth={1.25} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cx('text-xs leading-snug', !notif.read ? 'font-semibold text-primary' : 'text-secondary')}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-tertiary mt-0.5">
                        {new Date(notif.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-1.5" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-secondary px-4 py-2.5">
                <button
                  onClick={() => { setBellOpen(false); router.push('/notifications'); }}
                  className="text-xs font-medium text-brand-700 hover:text-brand-600 transition-colors"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
