'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { mockChartSessions, mockPatients } from '@/lib/mock-data';

const chipColors: Record<string, { bg: string; color: string }> = {
  'No Pain': { bg: '#E8F5E9', color: '#2E7D32' },
  'Low Pain': { bg: '#FFF8E1', color: '#F57F17' },
  'Moderate Pain': { bg: '#FFF3E0', color: '#E65100' },
  'High Pain': { bg: '#FFEBEE', color: '#C62828' },
  'High Adherence': { bg: '#E8F5E9', color: '#2E7D32' },
  'Moderate Adherence': { bg: '#FFF8E1', color: '#F57F17' },
  'Low Adherence': { bg: '#FFEBEE', color: '#C62828' },
  'Significant Improvement': { bg: '#E8F5E9', color: '#2E7D32' },
  'Some Improvement': { bg: '#E3F2FD', color: '#0277BD' },
  'No Improvement': { bg: '#F5F5F5', color: '#757575' },
  Worsening: { bg: '#FFEBEE', color: '#C62828' },
};

function freqLabel(n: number) {
  if (n === 1) return 'Once a week';
  if (n === 2) return 'Twice a week';
  return `${n}× a week`;
}

export default function PatientChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = (mockChartSessions[id] ?? []).slice().reverse();
  const completedSessions = sessions.filter((s) => !s.isIntakeSession).length;

  const [totalSessions, setTotalSessions] = useState(patient?.totalSessions ?? 8);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(patient?.sessionsPerWeek ?? 1);
  const [editOpen, setEditOpen] = useState(false);
  const [draftTotal, setDraftTotal] = useState(totalSessions);
  const [draftFreq, setDraftFreq] = useState(sessionsPerWeek);

  const openEdit = () => { setDraftTotal(totalSessions); setDraftFreq(sessionsPerWeek); setEditOpen(true); };
  const saveEdit = () => { setTotalSessions(draftTotal); setSessionsPerWeek(draftFreq); setEditOpen(false); };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {completedSessions} out of {totalSessions} Total Sessions
            </Typography>
            <IconButton size="small" onClick={openEdit}><EditOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">{freqLabel(sessionsPerWeek)}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push(`/patients/${id}/chart/new`)} disableElevation>
          Add to Chart
        </Button>
      </Box>

      {sessions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No sessions recorded yet.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sessions.map((session) => (
            <Card key={session.id}>
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                      {session.isIntakeSession
                        ? `Intake Session – ${new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                        : `Session – ${new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1.5}>{session.summary}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {session.adherenceLevel && (
                        <Chip label={session.adherenceLevel} size="small" sx={{ ...chipColors[session.adherenceLevel], fontWeight: 500 }} />
                      )}
                      <Chip label={session.painLevel} size="small" sx={{ ...chipColors[session.painLevel], fontWeight: 500 }} />
                      {session.improvementLevel && (
                        <Chip label={session.improvementLevel} size="small" sx={{ ...chipColors[session.improvementLevel], fontWeight: 500 }} />
                      )}
                      <Chip label={`${session.exercisesPerDay} Exercises / Daily`} size="small" variant="outlined" />
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => router.push(`/patients/${id}/chart/${session.id}`)} sx={{ ml: 1 }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Edit session plan modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Session Plan</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Total Sessions"
            type="number"
            size="small"
            value={draftTotal}
            onChange={(e) => setDraftTotal(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
            fullWidth
            helperText={`${completedSessions} completed so far`}
          />
          <TextField
            label="Sessions per Week"
            type="number"
            size="small"
            value={draftFreq}
            onChange={(e) => setDraftFreq(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1, max: 7 }}
            fullWidth
            helperText={freqLabel(draftFreq)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
