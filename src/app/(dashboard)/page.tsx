'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import TopBar from '@/components/layout/TopBar';
import AddPatientDialog from '@/components/patients/AddPatientDialog';
import { mockPatients, mockNotifications, mockPhysio, mockChartSessions } from '@/lib/mock-data';

function getNextAppointmentDate(patientId: string, sessionsPerWeek: number): number {
  const sessions = mockChartSessions[patientId] ?? [];
  const nonIntake = sessions.filter((s) => !s.isIntakeSession);
  const lastSession = nonIntake.length > 0
    ? nonIntake.reduce((latest, s) => s.date > latest.date ? s : latest)
    : sessions[0];
  if (!lastSession) return Infinity;
  const daysBetween = 7 / sessionsPerWeek;
  return new Date(lastSession.date).getTime() + daysBetween * 86400000;
}

const recentPatients = [...mockPatients]
  .filter((p) => !p.archived)
  .sort((a, b) => getNextAppointmentDate(a.id, a.sessionsPerWeek) - getNextAppointmentDate(b.id, b.sessionsPerWeek))
  .slice(0, 5);

const recentActivity = mockNotifications.slice(0, 5);

function formatRelativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [addPatientOpen, setAddPatientOpen] = useState(false);

  const activeCount = mockPatients.filter((p) => p.status === 'active').length;
  const newCount = mockPatients.filter((p) => p.status === 'new').length;
  const pendingDocs = mockNotifications.filter((n) => !n.read).length;

  const stats = [
    { label: 'Active Patients', value: activeCount, icon: PeopleAltRoundedIcon, color: '#6750A4' },
    { label: 'New This Week', value: newCount, icon: CalendarTodayRoundedIcon, color: '#0288D1' },
    { label: 'Pending Documents', value: pendingDocs, icon: FolderRoundedIcon, color: '#F57C00' },
  ];

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Home' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={0.5}>
          Good morning, {mockPhysio.firstName}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>

        {/* Stats Row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} sx={{ flex: 1 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon sx={{ color, fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} lineHeight={1}>{value}</Typography>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Recent Patients */}
          <Box sx={{ flex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Recent Patients</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setAddPatientOpen(true)}
                disableElevation
              >
                Add New Patient
              </Button>
            </Box>
            <Card>
              {recentPatients.map((patient, i) => (
                <Box key={patient.id}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2, cursor: 'pointer', '&:hover': { bgcolor: '#F9F9FB' }, transition: 'background 0.1s' }}
                    onClick={() => router.push(`/patients/${patient.id}/overview`)}
                  >
                    <Avatar sx={{ bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 600, fontSize: 14, width: 40, height: 40 }}>
                      {patient.avatarInitials}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{patient.firstName} {patient.lastName}</Typography>
                      <Typography variant="caption" color="text.secondary">{patient.location}</Typography>
                    </Box>
                    <Chip
                      label={patient.status}
                      size="small"
                      sx={{
                        bgcolor: patient.status === 'active' ? '#E8F5E9' : patient.status === 'new' ? '#E3F2FD' : '#F5F5F5',
                        color: patient.status === 'active' ? '#2E7D32' : patient.status === 'new' ? '#0277BD' : '#757575',
                        fontWeight: 500, fontSize: 11,
                      }}
                    />
                    <Box sx={{ textAlign: 'right', minWidth: 70 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 }}>Next appt</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(() => {
                          const ts = getNextAppointmentDate(patient.id, patient.sessionsPerWeek);
                          return ts === Infinity ? '—' : new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                  {i < recentPatients.length - 1 && <Divider />}
                </Box>
              ))}
            </Card>
          </Box>

          {/* Recent Activity */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Recent Activity</Typography>
              <Button size="small" onClick={() => router.push('/notifications')} sx={{ color: 'primary.main' }}>
                View all
              </Button>
            </Box>
            <Card>
              {recentActivity.map((notif, i) => (
                <Box key={notif.id}>
                  <Box
                    sx={{ px: 2.5, py: 1.75, display: 'flex', gap: 1.5, alignItems: 'flex-start', cursor: 'pointer', '&:hover': { bgcolor: '#F9F9FB' }, bgcolor: !notif.read ? '#FAFAFA' : 'transparent' }}
                    onClick={() => notif.patientId && router.push(`/patients/${notif.patientId}/documents`)}
                  >
                    <Box sx={{ mt: 0.25, width: 28, height: 28, borderRadius: '50%', bgcolor: '#E8E0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <NotificationsOutlinedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ lineHeight: 1.4 }}>{notif.message}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" mt={0.25}>
                        {formatRelativeTime(notif.timestamp)}
                      </Typography>
                    </Box>
                    {!notif.read && (
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.75, flexShrink: 0 }} />
                    )}
                  </Box>
                  {i < recentActivity.length - 1 && <Divider />}
                </Box>
              ))}
            </Card>
          </Box>
        </Box>
      </Box>

      <AddPatientDialog open={addPatientOpen} onClose={() => setAddPatientOpen(false)} />
    </>
  );
}
