'use client';
import { Typography } from 'antd';
import { useRole } from '@/lib/roleStore';
import { setRole } from '@/lib/roleStore';
import type { UserRole } from '@/lib/types';

const { Text } = Typography;

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

export default function DemoRoleBar() {
  const current = useRole();

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
    </div>
  );
}
