'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useRole, setRole } from '@/lib/roleStore';
import { useViewMode, setViewMode, type ViewMode } from '@/lib/viewModeStore';
import { useDataState, setDataState, type DataState } from '@/lib/dataStateStore';
import { useStaffPersona, setStaffPersona } from '@/lib/staffPersonaStore';
import { setLocationId } from '@/lib/locationStore';
import { setOrgId } from '@/lib/orgStore';
import type { UserRole } from '@/lib/types';

type ViewingAs = UserRole | 'staff2' | 'staff3';

const VIEWING_AS: { value: ViewingAs; label: string; fullOnly?: boolean }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'User' },
  { value: 'staff2', label: 'User 2' },
  { value: 'staff3', label: 'User 3', fullOnly: true },
];

const VIEW_MODES = [
  { value: 'full' as const, label: 'Full' },
  { value: 'mvp' as const, label: 'MVP' },
];

const DATA_STATES: { value: DataState; label: string }[] = [
  { value: 'filled', label: 'Filled' },
  { value: 'empty', label: 'Empty' },
];

const ROUTE_MAP: Record<string, string> = {
  '/exercises': '/exercises-mvp',
};

function switchVersion(mode: ViewMode, pathname: string, router: ReturnType<typeof useRouter>) {
  setViewMode(mode);
  if (mode === 'mvp') {
    const mvp = Object.entries(ROUTE_MAP).find(([full]) => pathname.startsWith(full));
    if (mvp) router.push(pathname.replace(mvp[0], mvp[1]));
  } else {
    const full = Object.entries(ROUTE_MAP).find(([, mvp]) => pathname.startsWith(mvp));
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
      {VIEWING_AS.filter((item) => !item.fullOnly || viewMode === 'full').map(({ value, label }) => {
        const active = currentViewingAs === value;
        return (
          <button
            key={value}
            onClick={() => switchViewingAs(value)}
            style={{
              cursor: 'pointer',
              border: active ? '1px solid #D0BCFF' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: 999,
              padding: '2px 12px',
              background: active ? '#4A3780' : 'transparent',
              color: active ? '#D0BCFF' : 'rgba(255,255,255,0.55)',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              fontFamily: 'inherit',
              lineHeight: '20px',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}

      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

      <span style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, marginRight: 4, whiteSpace: 'nowrap', fontSize: 12 }}>
        Version:
      </span>
      {VIEW_MODES.map(({ value, label }) => {
        const active = viewMode === value;
        return (
          <button
            key={value}
            onClick={() => switchVersion(value, pathname, router)}
            style={{
              cursor: 'pointer',
              border: active ? '1px solid #A8D5A2' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: 999,
              padding: '2px 12px',
              background: active ? '#1E4D2B' : 'transparent',
              color: active ? '#A8D5A2' : 'rgba(255,255,255,0.55)',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              fontFamily: 'inherit',
              lineHeight: '20px',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}

      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

      <span style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, marginRight: 4, whiteSpace: 'nowrap', fontSize: 12 }}>
        Data:
      </span>
      {DATA_STATES.map(({ value, label }) => {
        const active = dataState === value;
        return (
          <button
            key={value}
            onClick={() => setDataState(value)}
            style={{
              cursor: 'pointer',
              border: active ? '1px solid #93C5FD' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: 999,
              padding: '2px 12px',
              background: active ? '#1E3A5F' : 'transparent',
              color: active ? '#93C5FD' : 'rgba(255,255,255,0.55)',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              fontFamily: 'inherit',
              lineHeight: '20px',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
