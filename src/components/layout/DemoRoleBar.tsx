'use client';
import { Typography } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useRole, setRole } from '@/lib/roleStore';
import { useViewMode, setViewMode, type ViewMode } from '@/lib/viewModeStore';
import type { UserRole } from '@/lib/types';

const { Text } = Typography;

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

const VIEW_MODES = [
  { value: 'full' as const, label: 'Full' },
  { value: 'mvp' as const, label: 'MVP' },
];

// full path → mvp path
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

export default function DemoRoleBar() {
  const current = useRole();
  const viewMode = useViewMode();
  const router = useRouter();
  const pathname = usePathname();

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
      <Text style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, marginRight: 4, whiteSpace: 'nowrap', fontSize: 12 }}>
        Viewing as:
      </Text>
      {ROLES.map(({ value, label }) => {
        const active = current === value;
        return (
          <button
            key={value}
            onClick={() => setRole(value)}
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

      <Text style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, marginRight: 4, whiteSpace: 'nowrap', fontSize: 12 }}>
        Version:
      </Text>
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
    </div>
  );
}
