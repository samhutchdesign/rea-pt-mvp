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
import TopBar from '@/components/layout/TopBar';
import AddPatientDialog from '@/components/patients/AddPatientDialog';
import { mockPhysio, mockChartSessions } from '@/lib/mock-data';
import { useLocationScope, useYourEmpId } from '@/lib/locationScope';

function computeEstimatedNext(patientId: string): number {
  const sessions = mockChartSessions[patientId] ?? [];
  if (sessions.length === 0) return Infinity;

  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const lastTs = new Date(sorted[sorted.length - 1].date + 'T12:00:00').getTime();

  let avgGapDays: number;
  if (sorted.length === 1) {
    avgGapDays = 14;
  } else {
    let total = 0;
    for (let i = 1; i < sorted.length; i++) {
      total += (new Date(sorted[i].date + 'T12:00:00').getTime() - new Date(sorted[i - 1].date + 'T12:00:00').getTime()) / 86400000;
    }
    avgGapDays = total / (sorted.length - 1);
  }

  return lastTs + avgGapDays * 86400000;
}



export default function DashboardPage() {
  const router = useRouter();
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const { patients: scopedPatients } = useLocationScope();
  const yourEmpId = useYourEmpId();

  const dashboardPatients = yourEmpId
    ? scopedPatients.filter((p) => p.assignedEmployeeIds.includes(yourEmpId))
    : scopedPatients;

  const recentPatients = [...dashboardPatients]
    .filter((p) => !p.archived && (p.status === 'active' || p.status === 'new'))
    .sort((a, b) => computeEstimatedNext(a.id) - computeEstimatedNext(b.id))
    .slice(0, 6);

  const activeCount = dashboardPatients.filter((p) => p.status === 'active').length;
  const newCount = dashboardPatients.filter((p) => p.status === 'new').length;

  const stats = [
    { label: 'Active Patients', value: activeCount, icon: PeopleAltRoundedIcon, color: '#6750A4' },
    { label: 'New This Week', value: newCount, icon: CalendarTodayRoundedIcon, color: '#0288D1' },
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

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Upcoming Patients</Typography>
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
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.1s' }}
                  onClick={() => router.push(`/patients/${patient.id}/overview`)}
                >
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: 14, width: 40, height: 40 }}>
                    {patient.avatarInitials}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{patient.firstName} {patient.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{patient.location}</Typography>
                  </Box>
                  {patient.status === 'new' && (
                    <Chip
                      label="new"
                      size="small"
                      sx={{ bgcolor: '#E3F2FD', color: '#0277BD', fontWeight: 500, fontSize: 11 }}
                    />
                  )}
                </Box>
                {i < recentPatients.length - 1 && <Divider />}
              </Box>
            ))}
          </Card>
        </Box>
      </Box>

      <AddPatientDialog open={addPatientOpen} onClose={() => setAddPatientOpen(false)} />
    </>
  );
}
