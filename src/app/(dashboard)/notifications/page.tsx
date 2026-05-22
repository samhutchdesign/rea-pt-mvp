'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import TopBar from '@/components/layout/TopBar';
import { mockNotifications } from '@/lib/mock-data';

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
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 720 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight={600}>Notifications</Typography>
            {unreadCount > 0 && (
              <Box sx={{ px: 1, py: 0.25, bgcolor: 'primary.main', borderRadius: 10, minWidth: 22, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, fontSize: 11 }}>{unreadCount}</Typography>
              </Box>
            )}
          </Box>
          {unreadCount > 0 && <Button size="small" onClick={markAllRead}>Mark all as read</Button>}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <NotificationsOutlinedIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 1 }} />
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <Card>
            {notifications.map((notif, i) => (
              <Box key={notif.id}>
                <Box
                  sx={{ px: 3, py: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start', cursor: 'pointer', bgcolor: !notif.read ? '#FAFAFA' : 'transparent', '&:hover': { bgcolor: '#F5F5F5' }, transition: 'background 0.1s' }}
                  onClick={() => notif.patientId && router.push(`/patients/${notif.patientId}/documents`)}
                >
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#E8E0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <NotificationsOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight={!notif.read ? 600 : 400}>{notif.message}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatTime(notif.timestamp)}</Typography>
                  </Box>
                  {!notif.read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, flexShrink: 0 }} />
                  )}
                </Box>
                {i < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </Card>
        )}
      </Box>
    </>
  );
}
