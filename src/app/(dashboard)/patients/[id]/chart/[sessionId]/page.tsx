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
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { mockPatients, mockChartSessions } from '@/lib/mock-data';

const SOAPIER_SECTIONS = [
  { key: 'subjective', letter: 'S', label: 'Subjective', rows: 5 },
  { key: 'objective', letter: 'O', label: 'Objective', rows: 4 },
  { key: 'assessment', letter: 'A', label: 'Analysis', rows: 6 },
  { key: 'plan', letter: 'P', label: 'Plan', rows: 4 },
  { key: 'intervention', letter: 'I', label: 'Intervention', rows: 4 },
  { key: 'evaluation', letter: 'E', label: 'Evaluation', rows: 3 },
  { key: 'recommendations', letter: 'R', label: 'Recommendations', rows: 3 },
];

export default function ChartDetailPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = mockChartSessions[id] ?? [];
  const session = sessions.find((s) => s.id === sessionId);
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

  const [editing, setEditing] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [soapie, setSoapie] = useState<Record<string, string>>(session?.soapie ?? {});
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveSnack, setSaveSnack] = useState(false);
  const [deleteSnack, setDeleteSnack] = useState(false);

  if (!patient || !session) return <Typography sx={{ p: 4 }}>Session not found.</Typography>;

  const sessionDate = new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const ageLabel = patient.metrics?.age ? `${patient.metrics.age} y.o.` : '';
  const sexLabel = patient.metrics?.sexAssignedAtBirth ?? '';
  const sessionLabel = session.isIntakeSession ? 'Intake Session' : `Session ${sessionIndex + 1} of ${sessions.length}`;

  const handleCopy = async () => {
    const lines = [`${sessionLabel} — ${patient.firstName} ${patient.lastName}`, sessionDate, ''];
    for (const { letter, label, key } of SOAPIER_SECTIONS) {
      lines.push(`${letter} — ${label}`);
      lines.push((soapie as Record<string, string>)[key] || '—');
      lines.push('');
    }
    await navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    setDeleteSnack(true);
    setTimeout(() => router.push(`/patients/${id}/chart`), 1500);
  };

  const letterBadge = (letter: string) => (
    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', lineHeight: 1 }}>{letter}</Typography>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 820 }}>
      {/* Session header bar */}
      <Box sx={{ bgcolor: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 1, px: 2.5, py: 1.5, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" fontWeight={600}>{patient.firstName} {patient.lastName}</Typography>
        {ageLabel && <Typography variant="body2" color="text.secondary">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</Typography>}
        <Typography variant="body2" color="text.secondary">{sessionDate}</Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label={sessionLabel} size="small" sx={{ bgcolor: session.isIntakeSession ? '#EDE7F6' : 'primary.main', color: session.isIntakeSession ? 'primary.main' : 'white', fontWeight: 600 }} />
          {!editing && (
            <>
              <Tooltip title={copySuccess ? 'Copied!' : 'Copy chart notes'}>
                <IconButton size="small" onClick={handleCopy} sx={{ color: copySuccess ? '#2E7D32' : 'text.secondary' }}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => setEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Session summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: editing ? 2 : 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>Session Notes</Typography>
            {editing && (
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
            )}
          </Box>
          {editing ? (
            <>
              {dictating && (
                <Box sx={{ bgcolor: '#FFF3E0', border: '1px solid #FFB300', borderRadius: 1, px: 2, py: 1, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F44336', animation: 'pulse 1s infinite' }} />
                  <Typography variant="caption" color="#E65100">Listening…</Typography>
                </Box>
              )}
              <TextField multiline rows={3} fullWidth defaultValue={session.summary} size="small" />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{session.summary}</Typography>
          )}
        </CardContent>
      </Card>

      {/* H-SOAPIER sections */}
      <Typography variant="subtitle1" fontWeight={600} mb={2}>H-SOAPIER Chart</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SOAPIER_SECTIONS.map(({ key, letter, label, rows }) => {
          const value = (soapie as Record<string, string>)[key] || '';
          return (
            <Card key={key}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  {letterBadge(letter)}
                  <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
                </Box>
                {editing ? (
                  <TextField
                    multiline rows={rows} fullWidth size="small"
                    value={value}
                    onChange={(e) => setSoapie((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                ) : value ? (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{value}</Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">Not recorded</Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {editing ? (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="text" size="small" sx={{ color: 'text.secondary' }}>View Version History</Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="contained" disableElevation onClick={() => { setEditing(false); setSaveSnack(true); }}>
                Save Updates
              </Button>
            </Box>
          </Box>
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #F0F0F0' }}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete Session
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={() => router.push(`/patients/${id}/chart`)}>Back to Chart</Button>
        </Box>
      )}

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Session?</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete <strong>{sessionLabel}</strong> for {patient.firstName} {patient.lastName}. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" disableElevation onClick={handleDelete}>
            Delete Session
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={saveSnack} autoHideDuration={3000} onClose={() => setSaveSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSaveSnack(false)}>Chart updated successfully.</Alert>
      </Snackbar>
      <Snackbar open={deleteSnack} autoHideDuration={3000} onClose={() => setDeleteSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setDeleteSnack(false)}>Session deleted.</Alert>
      </Snackbar>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </Box>
  );
}
