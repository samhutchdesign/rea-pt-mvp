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
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
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

const MARGARET_STUB = {
  subjective: 'Patient (Margaret Chen, 34 y.o. F, postpartum 6 wks) reports urinary leakage has further improved — now 0–1 episodes/day (down from daily at intake). Reports completing pelvic floor exercises daily since last session. Mild perineal discomfort 1/10 at rest. No urgency. Resuming yoga this week.',
  objective: 'PFMT assessment: pelvic floor contraction 4/5 bilaterally (↑ from 2/5 at intake). AROM: hip flexion 120° B/L, hip abduction WNL. Transverse abdominis activation — moderate. Scar healing N/A. Diastasis recti: not assessed this session.',
  assessment: 'ICF Problem List:\n  · Body function: mild residual pelvic floor hypotonicity — improving\n  · Activity & participation: return to yoga in progress, SUI with high-impact activity resolving\n  · Environment: supportive home environment, spouse involved\n\nPT Diagnosis: 34 y.o. postpartum F presenting with resolving SUI and pelvic floor hypotonicity affecting return to exercise.\n\nSTG: 0 leakage episodes with sneezing/coughing by session 5.\nLTG: Full return to yoga and high-impact activity by 8 weeks.',
  plan: '1. Progress PFMT to eccentric loading phase.\n2. Introduce impact training protocol (walk-jog progression).\n\nExpected Rx: 2 more sessions × 1×/wk.\nReassessment at session 5.\nDischarge criteria: 0 SUI episodes, full yoga return.\nClient consent: Yes.',
  intervention: 'PFMT with biofeedback — 3×10 reps, 5 sec hold, 10 sec rest.\nHip bridge with load — 3×12.\nTransverse abdominis coordination drill.\n\nHEP updated: added eccentric holds.\nPatient education: impact loading progression, intra-abdominal pressure management.',
  evaluation: "Patient tolerated all exercises well. No increase in symptoms post-session. Reported feeling 'much stronger.' NPRS: 0/10 post-session (↓ from 1/10 pre). Ready to progress to home yoga practice.",
  recommendations: 'To patient: continue daily HEP, progress yoga per provided handout. Avoid high-impact running for 2 more weeks.\n\nTo GP (Dr. Patel): patient progressing well, anticipate discharge in 2 sessions. No referrals required at this time.',
};

const GENERIC_STUB = {
  subjective: 'Patient reports [describe symptoms, NPRS rating, functional impact].',
  objective: '',
  assessment: '',
  plan: '',
  intervention: '',
  evaluation: '',
  recommendations: '',
};

export default function NewChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = mockChartSessions[id] ?? [];
  const sessionNumber = sessions.length + 1;

  const [dictating, setDictating] = useState(false);
  const [notes, setNotes] = useState('');
  const [soapie, setSoapie] = useState<Record<string, string>>({});
  const [populated, setPopulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  const handleDictate = () => {
    if (dictating) {
      setDictating(false);
      setNotes((prev) => prev + (prev ? ' ' : '') + (id === 'pat1'
        ? 'Patient says leakage is almost gone, only happened once this week. She\'s been doing her exercises every day. Perineal area feels much better. Wants to know when she can start running again.'
        : 'Patient reports improvement since last visit. Adherence good. Pain level lower. Wants to discuss return to activity.'));
    } else {
      setDictating(true);
    }
  };

  const handlePopulate = () => {
    setLoading(true);
    setTimeout(() => {
      setSoapie(id === 'pat1' ? MARGARET_STUB : GENERIC_STUB);
      setPopulated(true);
      setLoading(false);
    }, 1600);
  };

  const handleSave = () => {
    router.push(`/patients/${id}/chart`);
    setSnackOpen(true);
  };

  if (!patient) return null;

  const sessionDate = new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  const ageLabel = patient.metrics?.age ? `${patient.metrics.age} y.o.` : '';
  const sexLabel = patient.metrics?.sexAssignedAtBirth ?? '';

  return (
    <Box sx={{ maxWidth: 820 }}>
      {/* Session header bar */}
      <Box sx={{ bgcolor: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 1, px: 2.5, py: 1.5, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" fontWeight={600}>{patient.firstName} {patient.lastName}</Typography>
        {ageLabel && <Typography variant="body2" color="text.secondary">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</Typography>}
        <Typography variant="body2" color="text.secondary">{sessionDate}</Typography>
        <Box sx={{ ml: 'auto' }}>
          <Chip label={`Session ${sessionNumber}`} size="small" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }} />
        </Box>
      </Box>

      {/* Dictation + notes */}
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
            multiline rows={4} fullWidth size="small"
            placeholder="Type session notes or use Dictate above…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip icon={<PersonRoundedIcon sx={{ fontSize: '0.85rem !important' }} />} label="Patient profile" size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 24, color: 'text.secondary' }} />
              <Chip icon={<HistoryRoundedIcon sx={{ fontSize: '0.85rem !important' }} />} label={`${sessions.length} previous session${sessions.length !== 1 ? 's' : ''}`} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 24, color: 'text.secondary' }} />
            </Box>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
              onClick={handlePopulate}
              size="small"
              disabled={!notes.trim() || loading}
            >
              {loading ? `Reading ${sessions.length} sessions…` : 'Add to Chart'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* H-SOAPIER sections */}
      <Typography variant="subtitle1" fontWeight={600} mb={2}>H-SOAPIER Chart</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SOAPIER_SECTIONS.map(({ key, letter, label, placeholder, rows }) => {
          const isEmpty = populated && !soapie[key];
          return (
            <Card key={key} sx={isEmpty ? { border: '2px solid #FB8C00' } : {}}>
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
                {isEmpty && (
                  <Typography variant="caption" sx={{ color: '#FB8C00', mt: 0.5, display: 'block' }}>This section may be important to fill in</Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button onClick={() => router.push(`/patients/${id}/chart`)}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disableElevation>Save New Chart</Button>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)}>Chart saved successfully.</Alert>
      </Snackbar>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </Box>
  );
}
