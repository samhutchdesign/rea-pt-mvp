'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import { mockPatients, mockChartSessions } from '@/lib/mock-data';

const soapieSections = [
  { key: 'subjective', label: 'Subjective' },
  { key: 'objective', label: 'Objective' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'plan', label: 'Plan' },
  { key: 'intervention', label: 'Intervention' },
  { key: 'evaluation', label: 'Evaluation' },
];

export default function EditChartPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = mockChartSessions[id] ?? [];
  const session = sessions.find((s) => s.id === sessionId);
  const [dictating, setDictating] = useState(false);
  const [soapie, setSoapie] = useState(session?.soapie ?? {});

  if (!patient || !session) return <Typography sx={{ p: 4 }}>Session not found.</Typography>;

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h6" fontWeight={600} mb={0.5}>
        {session.isIntakeSession ? 'Intake Session' : 'Session'} – {new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>{patient.firstName} {patient.lastName}</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>Session Notes</Typography>
            <Button
              variant={dictating ? 'contained' : 'outlined'}
              color={dictating ? 'error' : 'primary'}
              startIcon={dictating ? <StopRoundedIcon /> : <MicRoundedIcon />}
              onClick={() => setDictating(!dictating)}
              size="small"
              disableElevation
            >
              {dictating ? 'Stop Dictating' : 'Dictate'}
            </Button>
          </Box>
          <TextField multiline rows={3} fullWidth defaultValue={session.summary} size="small" />
        </CardContent>
      </Card>

      <Typography variant="subtitle1" fontWeight={600} mb={2}>SOAPIE Chart</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {soapieSections.map(({ key, label }) => (
          <Box key={key}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5} fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {label}
            </Typography>
            <TextField
              multiline rows={3} fullWidth size="small"
              value={(soapie as Record<string, string>)[key] || ''}
              onChange={(e) => setSoapie((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Button variant="text" size="small" sx={{ color: 'text.secondary' }}>View Version History</Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={() => router.push(`/patients/${id}/chart`)}>Cancel</Button>
          <Button variant="contained" onClick={() => router.push(`/patients/${id}/chart`)} disableElevation>Save Updates</Button>
        </Box>
      </Box>
    </Box>
  );
}
