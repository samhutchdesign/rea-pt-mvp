'use client';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Avatar, Card, Tag, Divider } from 'antd';
import TopBar from '@/components/layout/TopBar';
import { ShopOutlined } from '@ant-design/icons';
import { mockPhysio, mockClinic } from '@/lib/mock-data';
import { roleLabel } from '@/lib/permissions';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';

const { Title, Text } = Typography;

const fieldLabel = (label: string) => (
  <div style={{ marginBottom: 4, fontSize: 13 }}>{label}</div>
);

export default function ProfilePage() {
  const router = useRouter();
  const can = usePermissions();
  const role = useRole();

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Your Profile' }]} />
      <div style={{ padding: '32px', maxWidth: 640 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 24 }}>Your Profile</Title>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <Avatar style={{ width: 64, height: 64, background: '#EDE7F6', color: '#6750A4', fontWeight: 700, fontSize: 22 }}>
              {mockPhysio.avatarInitials}
            </Avatar>
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <Text strong>{mockPhysio.firstName} {mockPhysio.lastName}</Text>
                <Tag color="purple" style={{ fontSize: 11, fontWeight: 600 }}>{roleLabel(role)}</Tag>
              </div>
              <Text type="secondary">{mockPhysio.title}</Text>
            </div>
            <Button size="small">Change Photo</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>{fieldLabel('First Name')}<Input defaultValue={mockPhysio.firstName} /></div>
              <div style={{ flex: 1 }}>{fieldLabel('Last Name')}<Input defaultValue={mockPhysio.lastName} /></div>
            </div>
            <div>{fieldLabel('Title')}<Input defaultValue={mockPhysio.title} /></div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>{fieldLabel('Email')}<Input defaultValue={mockPhysio.email} /></div>
              <div style={{ flex: 1 }}>{fieldLabel('Phone')}<Input defaultValue={mockPhysio.phone} /></div>
            </div>
            <div>{fieldLabel('Credentials')}<Input defaultValue={mockPhysio.credentials} /></div>
            <div>{fieldLabel('Bio')}<Input.TextArea rows={3} defaultValue={mockPhysio.bio} /></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button type="primary">Save Changes</Button>
          </div>
        </Card>

        {can.canManageClinic && (
          <Card>
            <Text strong style={{ display: 'block', marginBottom: 16 }}>Organization</Text>
            <Divider style={{ marginBottom: 16 }} />
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: 12, border: '1px solid #E0E0E0', borderRadius: 8, transition: 'all 0.15s' }}
              onClick={() => router.push('/clinic')}
            >
              <Avatar style={{ width: 44, height: 44, background: '#6750A4', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                {mockClinic.logoInitials}
              </Avatar>
              <div style={{ flexGrow: 1 }}>
                <Text strong style={{ display: 'block' }}>{mockClinic.name}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{mockClinic.address}</Text>
              </div>
              <ShopOutlined style={{ color: '#49454F', fontSize: 18 }} />
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
