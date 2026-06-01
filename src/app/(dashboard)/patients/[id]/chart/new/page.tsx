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
  subjective: 'Pt (Margaret Chen, 34 y.o. F, ~6/52 p/o SVD) c/o ↓ SUI — 0–1 episode/day (↓ from daily at intake 6/52 ago). HEP adherence: 7/7 days × past 2/52. Perineal discomfort: NPRS 1/10 at rest, 0/10 c/ activity. No urgency. ↑ confidence c/ PF activation. Querying RTS running — returning to yoga this week.',
  objective: 'PFMT: levator ani 4/5 B/L (↑ from 2/5 at intake). Endurance hold: 8 sec × 10 reps (↑ from 3 sec). Quick flicks: 10/10 B/L. TA activation: moderate (4/5). AROM: hip flex 120° B/L, hip abd WNL. Diastasis recti: N/T this session.',
  assessment: 'ICF Problem List:\n  · Body function: ↓ PF hypotonicity — levator ani 4/5 B/L (↑ from 2/5)\n  · Activity & participation: SUI resolving ↓; return to yoga initiated; ↑ impact loading (running) still restricted\n  · Environment: supportive home environment; spouse involvement → ↑ HEP adherence\n\nPT Dx: 34 y.o. postpartum F s/p SVD c/ resolving SUI + residual PF hypotonicity → ↓ RTS ↑ impact activity.\nSTG (session 5): 0 SUI episodes c/ cough/sneeze challenge.\nLTG (8/52): full RTS — yoga + low-impact running; NPRS 0/10.',
  plan: '1. ↑ PFMT → eccentric loading phase (↑ load, ↓ reps).\n2. Initiate impact training protocol: walk → jog progression.\n3. ↑ HEP → 3×/day.\n\nExpected Rx: 2 sessions × 1×/wk → D/C.\nReassessment: session 5.\nD/C criteria: 0 SUI episodes; full RTS yoga + running.\nPt consent: ✓ verbal.',
  intervention: 'PFMT c/ biofeedback: 3×10 reps, 5 sec hold, 10 sec rest (↑ from 3 sec).\nHip bridge c/ load: 3×12 reps.\nTA coordination drill: 3×10 B/L.\n\nHEP ↑: added eccentric Kegel holds (5 sec concentric + 5 sec eccentric).\nPt ed: ↑ IAP management; impact loading progression (walk → jog → run). Handout provided.',
  evaluation: "Pt tolerated ↑ load well — no ↑ Sx post-session. NPRS: 1/10 pre → 0/10 post. Pt reports ↑ confidence c/ PF activation. Technique ✓ all new exercises. Pt verbalized understanding of impact progression protocol. Target: RTS yoga next week.",
  recommendations: 'To pt: ↑ HEP → 3×/day; progress yoga per handout; avoid running × 2/52.\nTo GP (Dr. Patel): pt progressing well — anticipate D/C in 2 sessions; no further referral required at this time.',
};

const GENERIC_STUB = {
  subjective: 'Pt c/o [describe Sx, location, NPRS __/10, ↑ aggravating factors, ↓ relieving factors].',
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
        ? 'Pt c/o ↓ SUI — 0–1 episode today, ↓ from daily at intake. HEP adherence 7/7 this week. NPRS 1/10 at rest, ↓ from 2/10 last visit. No urgency. Querying RTS running — discussed ↑ impact loading protocol.'
        : 'Pt reports ↓ Sx since last visit. HEP adherence ↑ — completing most days. NPRS ↓ from [x] → [x]/10. Functional mobility ↑. No adverse reactions to HEP.'));
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
