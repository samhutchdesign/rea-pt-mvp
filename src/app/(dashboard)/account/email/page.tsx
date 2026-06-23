'use client';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card } from 'antd';
import TopBar from '@/components/layout/TopBar';
import { mockPhysio } from '@/lib/mock-data';

const { Title } = Typography;

export default function EmailChangePage() {
  const router = useRouter();
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Email Change' }]} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 500 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 24 }}>Change Email</Title>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ marginBottom: 4, fontSize: 13 }}>Current Email</div>
              <Input defaultValue={mockPhysio.email} readOnly style={{ background: 'rgba(0,0,0,0.04)' }} />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontSize: 13 }}>New Email</div>
              <Input type="email" />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontSize: 13 }}>Confirm New Email</div>
              <Input type="email" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <Button onClick={() => router.back()}>Cancel</Button>
              <Button type="primary">Save</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
