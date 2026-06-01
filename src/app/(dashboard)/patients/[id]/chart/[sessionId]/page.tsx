'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { mockPatients, mockChartSessions } from '@/lib/mock-data';

const SOAPIER_SECTIONS = [
  {
    key: 'subjective', letter: 'S', label: 'Subjective', rows: 5,
    placeholder: 'Chief complaint, pain location, NPRS __/10, constant vs. intermittent, ↑P1 aggravating factors, ↓P1 relieving factors, temporal pattern (AM / PM / night), outcome scores…',
  },
  {
    key: 'objective', letter: 'O', label: 'Objective', rows: 4,
    placeholder: 'AROM / PROM (°), MMT (0–5), special tests, functional outcome measures, WNL / N/T…',
  },
  {
    key: 'assessment', letter: 'A', label: 'Analysis', rows: 6,
    placeholder: 'ICF Problem List:\n  · Body function impairments\n  · Activity & participation limitations\n  · Environment barriers\n\nPT Diagnosis: [age] y.o. [sex] presenting with [impairments] affecting [activity limitations].\n\nShort-term goals / Long-term goals…',
  },
  {
    key: 'plan', letter: 'P', label: 'Plan', rows: 4,
    placeholder: 'Numbered items per problem.\nExpected Rx: N sessions × frequency/week.\nReassessment at session #.\nDischarge criteria.\nClient consent: Yes / No.',
  },
  {
    key: 'intervention', letter: 'I', label: 'Intervention', rows: 4,
    placeholder: 'Techniques & parameters, HEP prescribed, patient education, phone / email contact log…',
  },
  {
    key: 'evaluation', letter: 'E', label: 'Evaluation', rows: 3,
    placeholder: "Patient's reaction to treatment. NPRS change (pre → post). Subjective response…",
  },
  {
    key: 'recommendations', letter: 'R', label: 'Recommendations', rows: 3,
    placeholder: 'To client / family / caregivers / other health professionals (physician, OT, etc.)…',
  },
];

export default function EditChartPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = mockChartSessions[id] ?? [];
  const session = sessions.find((s) => s.id === sessionId);
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

  const [dictating, setDictating] = useState(false);
  const [soapie, setSoapie] = useState<Record<string, string>>(session?.soapie ?? {});
  const [snackOpen, setSnackOpen] = useState(false);

  if (!patient || !session) return <Typography sx={{ p: 4 }}>Session not found.</Typography>;

  const sessionDate = new Date(session.date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  const ageLabel = patient.metrics?.age ? `${patient.metrics.age} y.o.` : '';
  const sexLabel = patient.metrics?.sexAssignedAtBirth ?? '';
  const sessionLabel = session.isIntakeSession ? 'Intake Session' : `Session ${sessionIndex + 1} of ${sessions.length}`;

  return (
    <Box sx={{ maxWidth: 820 }}>
      {/* Session header bar */}
      <Box sx={{ bgcolor: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 1, px: 2.5, py: 1.5, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" fontWeight={600}>{patient.firstName} {patient.lastName}</Typography>
        {ageLabel && <Typography variant="body2" color="text.secondary">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</Typography>}
        <Typography variant="body2" color="text.secondary">{sessionDate}</Typography>
        <Box sx={{ ml: 'auto' }}>
          <Chip label={sessionLabel} size="small" sx={{ bgcolor: session.isIntakeSession ? '#EDE7F6' : 'primary.main', color: session.isIntakeSession ? 'primary.main' : 'white', fontWeight: 600 }} />
        </Box>
      </Box>

      {/* Summary / dictation */}
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
          {dictating && (
            <Box sx={{ bgcolor: '#FFF3E0', border: '1px solid #FFB300', borderRadius: 1, px: 2, py: 1, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F44336', animation: 'pulse 1s infinite' }} />
              <Typography variant="caption" color="#E65100">Listening…</Typography>
            </Box>
          )}
          <TextField multiline rows={3} fullWidth defaultValue={session.summary} size="small" />
        </CardContent>
      </Card>

      {/* H-SOAPIER sections */}
      <Typography variant="subtitle1" fontWeight={600} mb={2}>H-SOAPIER Chart</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SOAPIER_SECTIONS.map(({ key, letter, label, placeholder, rows }) => (
          <Card key={key}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', lineHeight: 1 }}>{letter}</Typography>
                </Box>
                <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
              </Box>
              <TextField
                multiline rows={rows} fullWidth size="small"
                placeholder={placeholder}
                value={soapie[key] || ''}
                onChange={(e) => setSoapie((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Button variant="text" size="small" sx={{ color: 'text.secondary' }}>View Version History</Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={() => router.push(`/patients/${id}/chart`)}>Cancel</Button>
          <Button variant="contained" onClick={() => { router.push(`/patients/${id}/chart`); setSnackOpen(true); }} disableElevation>Save Updates</Button>
        </Box>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)}>Chart updated successfully.</Alert>
      </Snackbar>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </Box>
  );
}
