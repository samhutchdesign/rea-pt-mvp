'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Card, Divider } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import TopBar from '@/components/layout/TopBar';
import { mockNotifications } from '@/lib/mock-data';

const { Title, Text } = Typography;

function formatTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Notifications' }]} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Title level={2} style={{ margin: 0 }}>Notifications</Title>
            {unreadCount > 0 && (
              <div style={{ padding: '2px 8px', background: '#6750A4', borderRadius: 10, minWidth: 22, textAlign: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 11 }}>{unreadCount}</span>
              </div>
            )}
          </div>
          {unreadCount > 0 && <Button size="small" type="text" onClick={markAllRead}>Mark all as read</Button>}
        </div>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <BellOutlined style={{ fontSize: 48, color: '#BDBDBD', marginBottom: 8 }} />
            <div><Text type="secondary">No notifications</Text></div>
          </div>
        ) : (
          <Card styles={{ body: { padding: 0 } }}>
            {notifications.map((notif, i) => (
              <div key={notif.id}>
                <div
                  style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer', background: !notif.read ? '#FAFAFA' : 'transparent', transition: 'background 0.1s' }}
                  onClick={() => notif.patientId && router.push(`/patients/${notif.patientId}/documents`)}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BellOutlined style={{ fontSize: 18, color: '#6750A4' }} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div><Text style={{ fontWeight: !notif.read ? 600 : 400 }}>{notif.message}</Text></div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatTime(notif.timestamp)}</Text>
                  </div>
                  {!notif.read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6750A4', marginTop: 8, flexShrink: 0 }} />
                  )}
                </div>
                {i < notifications.length - 1 && <Divider style={{ margin: 0 }} />}
              </div>
            ))}
          </Card>
        )}
      </div>
    </>
  );
}
