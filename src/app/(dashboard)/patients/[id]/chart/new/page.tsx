'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Spin, App } from 'antd';
import { mockPatients, mockChartSessions } from '@/lib/mock-data';
import { History, Star, User } from 'lucide-react';

const { Text } = Typography;

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
  const { message: messageApi } = App.useApp();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = mockChartSessions[id] ?? [];
  const sessionNumber = sessions.length + 1;

  const [notes, setNotes] = useState('');
  const [soapie, setSoapie] = useState<Record<string, string>>({});
  const [populated, setPopulated] = useState(false);
  const [loading, setLoading] = useState(false);

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
    messageApi.success('Chart saved successfully.');
  };

  if (!patient) return null;

  const sessionDate = new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  const ageLabel = patient.metrics?.age ? `${patient.metrics.age} y.o.` : '';
  const sexLabel = patient.metrics?.sexAssignedAtBirth ?? '';

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Session header bar */}
      <div style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #E0E0E0', borderRadius: 8, padding: '12px 20px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <Text strong>{patient.firstName} {patient.lastName}</Text>
        {ageLabel && <Text type="secondary">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</Text>}
        <Text type="secondary">{sessionDate}</Text>
        <div style={{ marginLeft: 'auto' }}>
          <Tag style={{ background: '#6750A4', color: 'white', border: 'none', fontWeight: 600 }}>{`Session ${sessionNumber}`}</Tag>
        </div>
      </div>

      {/* Dictation + notes */}
      <Card style={{ marginBottom: 24 }}>
        <Text strong style={{ display: 'block', marginBottom: 16 }}>Session Notes</Text>
        <Input.TextArea
          rows={4}
          placeholder="Type session notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Tag icon={<User />} style={{ fontSize: '0.72rem', color: '#49454F' }}>Patient profile</Tag>
            <Tag icon={<History />} style={{ fontSize: '0.72rem', color: '#49454F' }}>{`${sessions.length} previous session${sessions.length !== 1 ? 's' : ''}`}</Tag>
          </div>
          <Button
            size="small"
            icon={loading ? <Spin size="small" /> : <Star />}
            onClick={handlePopulate}
            disabled={!notes.trim() || loading}
          >
            {loading ? `Reading ${sessions.length} sessions…` : 'Add to Chart'}
          </Button>
        </div>
      </Card>

      {/* H-SOAPIER sections */}
      <Text strong style={{ display: 'block', marginBottom: 16 }}>H-SOAPIER Chart</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SOAPIER_SECTIONS.map(({ key, letter, label, placeholder, rows }) => {
          const isEmpty = populated && !soapie[key];
          return (
            <Card key={key} style={isEmpty ? { border: '2px solid #FB8C00' } : undefined}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#6750A4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', lineHeight: 1 }}>{letter}</span>
                </div>
                <Text strong>{label}</Text>
              </div>
              <Input.TextArea
                rows={rows}
                placeholder={placeholder}
                value={soapie[key] || ''}
                onChange={(e) => setSoapie((prev) => ({ ...prev, [key]: e.target.value }))}
              />
              {isEmpty && (
                <Text style={{ color: '#FB8C00', marginTop: 4, display: 'block', fontSize: 12 }}>This section may be important to fill in</Text>
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 32 }}>
        <Button onClick={() => router.push(`/patients/${id}/chart`)}>Cancel</Button>
        <Button type="primary" onClick={handleSave}>Save New Chart</Button>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
