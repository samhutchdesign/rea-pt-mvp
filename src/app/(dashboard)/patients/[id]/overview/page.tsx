'use client';
import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import { mockPatients, mockChartSessions, mockPrograms, mockExercises } from '@/lib/mock-data';

export default function PatientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('welcome') === '1') setSnackOpen(true);
  }, [searchParams]);

  const patient = mockPatients.find((p) => p.id === id);
  const sessions = mockChartSessions[id] ?? [];
  const latestSession = sessions.filter((s) => !s.isIntakeSession)[0];
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;

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
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => router.push(`/patients/${id}/chart/new`)}>
                Add to Chart
              </Button>
            </Box>
            {latestSession ? (
              <>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {new Date(latestSession.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Typography>
                <Typography variant="body2" mb={2}>{latestSession.summary}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {latestSession.painLevel && <Chip label={latestSession.painLevel} size="small" variant="outlined" />}
                  {latestSession.adherenceLevel && <Chip label={latestSession.adherenceLevel} size="small" variant="outlined" />}
                  {latestSession.improvementLevel && <Chip label={latestSession.improvementLevel} size="small" variant="outlined" />}
                </Box>
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
                {program.exercises.slice(0, 3).map((pe) => {
                  const ex = mockExercises.find((e) => e.id === pe.exerciseId);
                  if (!ex) return null;
                  return (
                    <Box key={pe.exerciseId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: '1px solid #F0F0F0' }}>
                      <Typography variant="caption">{ex.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{pe.adherence}% adherence</Typography>
                    </Box>
                  );
                })}
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

      <Snackbar open={snackOpen} autoHideDuration={5000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>
          Success! The patient has received their documents.
        </Alert>
      </Snackbar>
    </>
  );
}
