'use client';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card } from 'antd';
import TopBar from '@/components/layout/TopBar';

const { Title } = Typography;

export default function PasswordResetPage() {
  const router = useRouter();
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Password Reset' }]} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 500 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 24 }}>Reset Password</Title>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ marginBottom: 4, fontSize: 13 }}>Current Password</div>
              <Input.Password />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontSize: 13 }}>New Password</div>
              <Input.Password />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontSize: 13 }}>Confirm New Password</div>
              <Input.Password />
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
