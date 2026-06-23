'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Dropdown, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { mockPhysio } from '@/lib/mock-data';
import { roleLabel } from '@/lib/permissions';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';
import { useYourEmpId } from '@/lib/locationScope';

interface TopBarProps {
  breadcrumbs: { label: string; href?: string }[];
}

export default function TopBar({ breadcrumbs }: TopBarProps) {
  const router = useRouter();
  const can = usePermissions();
  const role = useRole();
  const yourEmpId = useYourEmpId();
  void yourEmpId;

  const menuItems: MenuProps['items'] = [
    {
      key: 'header',
      disabled: true,
      label: (
        <div style={{ paddingTop: 4, paddingBottom: 4 }}>
          <div style={{ fontWeight: 600, color: '#1C1B1F' }}>
            {mockPhysio.firstName} {mockPhysio.lastName}
          </div>
          <div style={{ fontSize: 12, color: '#6750A4', fontWeight: 500 }}>{roleLabel(role)}</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{mockPhysio.email}</div>
        </div>
      ),
    },
    { type: 'divider' },
    ...(can.canManageClinic
      ? [{ key: 'org', label: 'Organization Profile', onClick: () => router.push('/clinic') }]
      : []),
    ...(can.canManageLocation
      ? [{ key: 'clinic', label: 'Clinic Profile', onClick: () => router.push(`/clinic/${mockPhysio.locationId}`) }]
      : []),
    ...(can.canManageBilling
      ? [{ key: 'billing', label: 'Billing', onClick: () => router.push('/billing') }]
      : []),
    { key: 'profile', label: 'Your Profile', onClick: () => router.push('/account/profile') },
    { key: 'settings', label: 'Settings', onClick: () => router.push('/account/settings') },
    { key: 'email', label: 'Email Change', onClick: () => router.push('/account/email') },
    { key: 'password', label: 'Password Reset', onClick: () => router.push('/account/password') },
    { type: 'divider' },
    { key: 'logout', label: <span style={{ color: '#49454F' }}>Log Out</span> },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 40,
        left: 80,
        width: 'calc(100% - 80px)',
        background: '#FFFFFF',
        borderBottom: '1px solid #E0E0E0',
        color: '#1C1B1F',
        zIndex: 99,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
      }}
    >
      <Breadcrumb
        style={{ flexGrow: 1 }}
        separator={<RightOutlined style={{ fontSize: 10, color: '#9E9E9E' }} />}
        items={breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          if (crumb.href && !isLast) {
            return {
              title: (
                <Link href={crumb.href}>
                  <span style={{ color: '#49454F', textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}>
                    {crumb.label}
                  </span>
                </Link>
              ),
            };
          }
          return {
            title: (
              <span style={{ color: isLast ? '#1C1B1F' : '#49454F', fontWeight: isLast ? 500 : 400, fontSize: 14 }}>
                {crumb.label}
              </span>
            ),
          };
        })}
      />

      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <Avatar
          style={{
            width: 36,
            height: 36,
            background: '#EDE7F6',
            color: '#6750A4',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {mockPhysio.avatarInitials}
        </Avatar>
      </Dropdown>
    </div>
  );
}
