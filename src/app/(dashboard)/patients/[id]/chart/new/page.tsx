'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { mockPatients } from '@/lib/mock-data';

const soapieSections = [
  { key: 'subjective', label: 'Subjective', placeholder: 'Patient-reported symptoms, history, and concerns…' },
  { key: 'objective', label: 'Objective', placeholder: 'Measurable findings, assessment results, observations…' },
  { key: 'assessment', label: 'Assessment', placeholder: 'Clinical impression, diagnosis, and analysis…' },
  { key: 'plan', label: 'Plan', placeholder: 'Treatment plan, goals, and next steps…' },
  { key: 'intervention', label: 'Intervention', placeholder: 'Treatments performed, exercises prescribed…' },
  { key: 'evaluation', label: 'Evaluation', placeholder: 'Response to treatment, outcomes, and progress notes…' },
];

export default function NewChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);

  const [dictating, setDictating] = useState(false);
  const [notes, setNotes] = useState('');
  const [soapie, setSoapie] = useState<Record<string, string>>({});
  const [populated, setPopulated] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  const handleDictate = () => {
    if (dictating) {
      setDictating(false);
      setNotes((prev) => prev + (prev ? ' ' : '') + 'Patient reports significant improvement in symptoms since last visit. Adherence has been high — completing exercises daily. Pain level now 2/10 at rest.');
    } else {
      setDictating(true);
    }
  };

  const handlePopulate = () => {
    setSoapie({
      subjective: 'Patient reports significant improvement in symptoms since last visit. Adherence has been high — completing exercises daily. Pain level now 2/10 at rest.',
      objective: '',
      assessment: '',
      plan: '',
      intervention: '',
      evaluation: '',
    });
    setPopulated(true);
  };

  const handleSave = () => {
    router.push(`/patients/${id}/chart`);
    setSnackOpen(true);
  };

  if (!patient) return null;

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h6" fontWeight={600} mb={0.5}>New Chart Entry</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {patient.firstName} {patient.lastName} · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>Session Notes</Typography>
            <Button
              variant={dictating ? 'contained' : 'outlined'}
              color={dictating ? 'error' : 'primary'}
              startIcon={dictating ? <StopRoundedIcon /> : <MicRoundedIcon />}
              onClick={handleDictate}
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
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Type session notes or use Dictate above…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="small"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={handlePopulate}
              size="small"
              disabled={!notes.trim()}
            >
              Add to Chart
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" fontWeight={600} mb={2}>SOAPIE Chart</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {soapieSections.map(({ key, label, placeholder }) => {
          const isEmpty = populated && !soapie[key];
          return (
            <Box key={key}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5} fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder={placeholder}
                value={soapie[key] || ''}
                onChange={(e) => setSoapie((prev) => ({ ...prev, [key]: e.target.value }))}
                size="small"
                sx={isEmpty ? { '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#FB8C00' } } : {}}
              />
              {isEmpty && (
                <Typography variant="caption" sx={{ color: '#FB8C00', mt: 0.3 }}>This section may be important to fill in</Typography>
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button onClick={() => router.push(`/patients/${id}/chart`)}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disableElevation>Save New Chart</Button>
      </Box>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </Box>
  );
}
