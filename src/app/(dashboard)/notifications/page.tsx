'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { Divider } from '@/components/ui/divider';
import { mockNotifications } from '@/lib/mock-data';
import { Bell } from 'lucide-react';
import { cx } from '@/utils/cx';

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
      <div className="p-8 max-w-[720px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-primary m-0">Notifications</h2>
            {unreadCount > 0 && (
              <div className="px-2 py-0.5 bg-brand-600 rounded-full min-w-[22px] text-center">
                <span className="text-white font-semibold text-xs">{unreadCount}</span>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <Button color="tertiary" size="xs" onPress={markAllRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-quaternary mb-3" />
            <span className="text-secondary text-sm">No notifications</span>
          </div>
        ) : (
          <div className="rounded-xl border border-secondary bg-primary shadow-xs overflow-hidden">
            {notifications.map((notif, i) => (
              <div key={notif.id}>
                <div
                  className={cx(
                    'px-6 py-5 flex gap-4 items-start cursor-pointer transition-colors',
                    !notif.read ? 'bg-secondary_alt hover:bg-secondary' : 'hover:bg-secondary_alt',
                  )}
                  onClick={() => notif.patientId && router.push(`/patients/${notif.patientId}/documents`)}
                >
                  <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <Bell size={18} className="text-brand-700" />
                  </div>
                  <div className="flex-1">
                    <div>
                      <span className={cx('text-sm', !notif.read ? 'font-semibold text-primary' : 'text-primary')}>
                        {notif.message}
                      </span>
                    </div>
                    <span className="text-secondary text-xs">{formatTime(notif.timestamp)}</span>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-brand-600 mt-2 shrink-0" />
                  )}
                </div>
                {i < notifications.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
