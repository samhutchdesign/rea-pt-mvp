'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useRole, setRole } from '@/lib/roleStore';
import { useViewMode, setViewMode, type ViewMode } from '@/lib/viewModeStore';
import { useDataState, setDataState, type DataState } from '@/lib/dataStateStore';
import { useStaffPersona, setStaffPersona } from '@/lib/staffPersonaStore';
import { setLocationId } from '@/lib/locationStore';
import { setOrgId } from '@/lib/orgStore';
import type { UserRole } from '@/lib/types';

type ViewingAs = UserRole | 'staff2' | 'staff3' | 'staff4';

const VIEWING_AS: { value: ViewingAs; label: string; fullOnly?: boolean; hidden?: boolean }[] = [
  { value: 'owner', label: 'Owner: Org' },
  { value: 'admin', label: 'Admin: Clinic' },
  { value: 'staff', label: 'User: PT' },
  { value: 'staff2', label: 'User: PT Multi Locations' },
  { value: 'staff3', label: 'User: PT Multi Org', fullOnly: true },
  { value: 'staff4', label: 'User: Staff' },
];

const VIEW_MODES = [
  { value: 'full' as const, label: 'Full', disabled: true },
  { value: 'mvp' as const, label: 'MVP' },
];

const DATA_STATES: { value: DataState; label: string }[] = [
  { value: 'filled', label: 'Filled' },
  { value: 'empty', label: 'Empty' },
];

const ROUTE_MAP: Record<string, string> = {
  '/exercises': '/exercises-mvp',
};

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(route + '/');
}

function switchVersion(mode: ViewMode, pathname: string, router: ReturnType<typeof useRouter>) {
  setViewMode(mode);
  if (mode === 'mvp') {
    const mvp = Object.entries(ROUTE_MAP).find(([full]) => matchesRoute(pathname, full));
    if (mvp) router.push(pathname.replace(mvp[0], mvp[1]));
  } else {
    const full = Object.entries(ROUTE_MAP).find(([, mvp]) => matchesRoute(pathname, mvp));
    if (full) router.push(pathname.replace(full[1], full[0]));
  }
}

function switchViewingAs(value: ViewingAs) {
  if (value === 'staff2') {
    setRole('staff');
    setStaffPersona('emp_user2');
  } else if (value === 'staff3') {
    setRole('staff');
    setStaffPersona('emp_user3');
  } else if (value === 'staff4') {
    setRole('staff');
    setStaffPersona('emp_staff');
  } else {
    setRole(value as UserRole);
    setStaffPersona('emp2');
  }
  setOrgId('clinic1');
  setLocationId('all');
}

export default function DemoRoleBar() {
  const currentRole = useRole();
  const persona = useStaffPersona();
  const viewMode = useViewMode();
  const dataState = useDataState();
  const router = useRouter();
  const pathname = usePathname();

  const currentViewingAs: ViewingAs =
    currentRole === 'staff' && persona === 'emp_user2' ? 'staff2' :
    currentRole === 'staff' && persona === 'emp_user3' ? 'staff3' :
    currentRole === 'staff' && persona === 'emp_staff' ? 'staff4' :
    currentRole;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 24px',
        height: 40,
        background: '#1C1B1F',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, marginRight: 4, whiteSpace: 'nowrap', fontSize: 12 }}>
        Viewing as:
      </span>
      <select
        value={currentViewingAs}
        onChange={(e) => switchViewingAs(e.target.value as ViewingAs)}
        style={{
          cursor: 'pointer',
          border: '1px solid #D0BCFF',
          borderRadius: 6,
          padding: '3px 10px',
          background: '#3A2E5C',
          color: '#D0BCFF',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          lineHeight: '18px',
          outline: 'none',
        }}
      >
        {VIEWING_AS.filter((item) => !item.hidden && (!item.fullOnly || viewMode === 'full')).map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

      <span style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, marginRight: 4, whiteSpace: 'nowrap', fontSize: 12 }}>
        Version:
      </span>
      <select
        value={viewMode}
        onChange={(e) => {
          const mode = e.target.value as ViewMode;
          if (mode === 'full') return;
          switchVersion(mode, pathname, router);
        }}
        style={{
          cursor: 'pointer',
          border: '1px solid #A8D5A2',
          borderRadius: 6,
          padding: '3px 10px',
          background: '#1E4D2B',
          color: '#A8D5A2',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          lineHeight: '18px',
          outline: 'none',
        }}
      >
        {VIEW_MODES.map(({ value, label, disabled }) => (
          <option key={value} value={value} disabled={disabled}>
            {label}{disabled ? ' (disabled)' : ''}
          </option>
        ))}
      </select>

      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

      <span style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, marginRight: 4, whiteSpace: 'nowrap', fontSize: 12 }}>
        Data:
      </span>
      <select
        value={dataState}
        onChange={(e) => setDataState(e.target.value as DataState)}
        style={{
          cursor: 'pointer',
          border: '1px solid #93C5FD',
          borderRadius: 6,
          padding: '3px 10px',
          background: '#1E3A5F',
          color: '#93C5FD',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          lineHeight: '18px',
          outline: 'none',
        }}
      >
        {DATA_STATES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}
