'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tooltip } from 'antd';
import type { ComponentType } from 'react';
import { usePermissions } from '@/lib/permissionsHook';
import { List, Users, Zap } from 'lucide-react';

type NavItem = { label: string; href: string; icon: ComponentType<{ style?: React.CSSProperties }> };

const baseNavItems: NavItem[] = [
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Exercises', href: '/exercises', icon: Zap },
  { label: 'Programs', href: '/programs', icon: List },
];

const ownerNavItems: NavItem[] = [
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Exercises', href: '/exercises', icon: Zap },
  { label: 'Programs', href: '/programs', icon: List },
];

export default function Sidebar() {
  const pathname = usePathname();
  const can = usePermissions();
  const navItems = can.canManageStaff ? ownerNavItems : baseNavItems;

  return (
    <nav
      style={{
        width: 80,
        flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid #E0E0E0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        position: 'fixed',
        top: 40,
        left: 0,
        height: 'calc(100vh - 40px)',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 24, marginTop: 8 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#6750A4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '-0.5px',
          }}
        >
          R
        </div>
      </div>

      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Tooltip key={href} title={label} placement="right">
            <Link href={href} style={{ textDecoration: 'none', width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px',
                  margin: '0 8px 4px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: isActive ? '#EDE7F6' : 'transparent',
                  transition: 'background-color 0.15s',
                }}
              >
                <Icon style={{ fontSize: 22, color: isActive ? '#6750A4' : '#49454F' }} />
                <span
                  style={{
                    fontSize: 10,
                    marginTop: 3,
                    color: isActive ? '#6750A4' : '#49454F',
                    fontWeight: isActive ? 600 : 400,
                    lineHeight: 1,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </span>
              </div>
            </Link>
          </Tooltip>
        );
      })}
    </nav>
  );
}
