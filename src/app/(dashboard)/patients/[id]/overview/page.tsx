'use client';
import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { mockPatients, mockChartSessions, mockPrograms, mockExercises, mockEmployees, mockClinic } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import { usePermissions } from '@/lib/permissionsHook';
import type { Employee } from '@/lib/types';

export default function PatientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snackOpen, setSnackOpen] = useState(false);
  const [uploadBannerDismissed, setUploadBannerDismissed] = useState(false);

  useEffect(() => {
    if (searchParams.get('welcome') === '1') setSnackOpen(true);
  }, [searchParams]);

  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const patient = mockPatients.find((p) => p.id === id);
  const showUploadBanner = searchParams.get('uploaded') === 'true' && !uploadBannerDismissed;
  const uploadedData = getUploadedData(id);
  const sessions = mockChartSessions[id] ?? [];
  const latestSession = sessions.filter((s) => !s.isIntakeSession)[0];
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;
  const assignedEmployees = patient ? mockEmployees.filter((e) => patient.assignedEmployeeIds.includes(e.id)) : [];
  const can = usePermissions();

  const overallAdherence = program
    ? Math.round(program.exercises.reduce((sum, e) => sum + e.adherence, 0) / program.exercises.length)
    : null;

  const stats = [
    {
      label: 'Program Adherence',
      value: overallAdherence != null ? `${overallAdherence}%` : '—',
      icon: TrendingUpRoundedIcon,
      color: '#6750A4',
    },
    {
      label: 'Total Sessions',
      value: sessions.length,
      icon: CalendarTodayRoundedIcon,
      color: '#0288D1',
    },
    {
      label: 'Exercises in Program',
      value: program ? program.exercises.length : '—',
      icon: FitnessCenterRoundedIcon,
      color: '#F57C00',
    },
  ];

  if (!patient) return null;

  return (
    <>
      {showUploadBanner && (
        <Alert
          severity="success"
          icon={false}
          onClose={() => setUploadBannerDismissed(true)}
          sx={{ mb: 3, alignItems: 'center' }}
        >
          <Typography variant="body2" fontWeight={600}>Profile updated from PDF</Typography>
          <Typography variant="caption" color="text.secondary">
            {uploadedData
              ? `${Object.keys(uploadedData).length} fields confirmed — ${uploadedData.firstName} ${uploadedData.lastName}'s profile has been updated. Review the details in the Details tab.`
              : '7 fields pre-filled from uploaded document. Review the updated information in the Details tab.'}
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} sx={{ flex: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon sx={{ color, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} lineHeight={1}>{value}</Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Recent Session */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Latest Session</Typography>
              <Button size="small" variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => router.push(`/patients/${id}/chart/new`)}>
                Add to Chart
              </Button>
            </Box>
            {latestSession ? (
              <>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {new Date(latestSession.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Typography>
                <Typography variant="body2" mb={2}>{latestSession.summary}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {latestSession.painLevel && <Chip label={latestSession.painLevel} size="small" variant="outlined" />}
                  {latestSession.adherenceLevel && <Chip label={latestSession.adherenceLevel} size="small" variant="outlined" />}
                  {latestSession.improvementLevel && <Chip label={latestSession.improvementLevel} size="small" variant="outlined" />}
                </Box>
                <Button size="small" sx={{ p: 0, fontSize: '0.75rem' }} onClick={() => router.push(`/patients/${id}/chart`)}>
                  See all sessions →
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">No sessions recorded yet.</Typography>
            )}
          </CardContent>
        </Card>

        {/* Current Program */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Current Program</Typography>
              <Button size="small" onClick={() => router.push(`/patients/${id}/program`)}>View Program</Button>
            </Box>
            {program ? (
              <>
                <Typography variant="body2" fontWeight={600} mb={0.5}>{program.name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>{program.exercises.length} exercises</Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {program.exercises.map((pe) => {
                    const ex = mockExercises.find((e) => e.id === pe.exerciseId);
                    if (!ex) return null;
                    return (
                      <Box key={pe.exerciseId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: '1px solid #F0F0F0' }}>
                        <Typography variant="caption">{ex.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{pe.adherence}% adherence</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" mb={2}>No program assigned yet.</Typography>
                <Button variant="outlined" size="small" onClick={() => router.push(`/patients/${id}/program`)}>
                  Assign Program
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Care Team */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Care Team</Typography>
            {can.canTransferPatient && (
              <Button size="small" variant="outlined" startIcon={<SwapHorizRoundedIcon />} onClick={() => setTransferOpen(true)}>
                Transfer Patient
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            {assignedEmployees.map((emp) => (
              <Box
                key={emp.id}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: '1px solid #E0E0E0', borderRadius: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }, transition: 'all 0.15s', minWidth: 220 }}
                onClick={() => router.push(`/employees/${emp.id}`)}
              >
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700, fontSize: 14 }}>
                  {emp.avatarInitials}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{emp.firstName} {emp.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{emp.credentials} · {emp.title}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => router.push('/clinic')}>
            <BusinessOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="primary.main" sx={{ textDecoration: 'underline' }}>{mockClinic.name}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snackOpen} autoHideDuration={5000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>
          Success! The patient has received their documents.
        </Alert>
      </Snackbar>

      {/* Transfer Patient Dialog */}
      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Transfer Patient</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Reassign <strong>{patient?.firstName} {patient?.lastName}</strong> to another physiotherapist.
          </Typography>
          <Autocomplete
            options={mockEmployees.filter((e) => !patient?.assignedEmployeeIds.includes(e.id))}
            getOptionLabel={(e) => `${e.firstName} ${e.lastName} — ${e.credentials}`}
            renderOption={(props, e) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{e.firstName} {e.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{e.title} · {e.credentials}</Typography>
                </Box>
              </Box>
            )}
            value={selectedEmployee}
            onChange={(_, val) => setSelectedEmployee(val)}
            renderInput={(params) => <TextField {...params} label="Select physiotherapist" size="small" autoFocus />}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setTransferOpen(false); setSelectedEmployee(null); }}>Cancel</Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!selectedEmployee}
            onClick={() => { setTransferOpen(false); setSelectedEmployee(null); setSnackOpen(true); }}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
