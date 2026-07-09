'use client';
import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockPatients, mockChartSessions } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import { Button } from '@/components/base/buttons/button';
import { History, Mic, MicOff, Star, User } from 'lucide-react';
import { cx } from '@/utils/cx';

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

  const [notes, setNotes] = useState('');
  const [soapie, setSoapie] = useState<Record<string, string>>({});
  const [populated, setPopulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const viewMode = useViewMode();
  const [dictating, setDictating] = useState(false);
  const [dictSecs, setDictSecs] = useState(0);
  const dictTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const DICTATION_STUB = id === 'pat1'
    ? "Patient reports SUI down to zero to one episode per day, improved from daily at intake. HEP adherence seven out of seven days for the past two weeks. Perineal discomfort one out of ten at rest, zero with activity. No urgency. Patient is querying return to running and starting yoga this week. Confidence with pelvic floor activation is much improved."
    : "Patient reports [describe symptoms]. HEP adherence [X] out of seven days. Pain level [X] out of ten. No significant changes since last session.";

  const startDictation = () => {
    setDictating(true);
    setDictSecs(0);
    dictTimer.current = setInterval(() => setDictSecs((s) => s + 1), 1000);
  };

  const stopDictation = () => {
    if (dictTimer.current) clearInterval(dictTimer.current);
    setDictating(false);
    setNotes((prev) => (prev ? prev + ' ' + DICTATION_STUB : DICTATION_STUB));
  };

  useEffect(() => () => { if (dictTimer.current) clearInterval(dictTimer.current); }, []);

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
    toast.success('Chart saved successfully.');
  };

  if (!patient) return null;

  const sessionDate = new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  const ageLabel = patient.metrics?.age ? `${patient.metrics.age} y.o.` : '';
  const sexLabel = patient.metrics?.sexAssignedAtBirth ?? '';

  return (
    <div className="max-w-[820px]">
      {/* Session header bar */}
      <div className="bg-black/4 border border-secondary rounded-lg px-5 py-3 mb-6 flex flex-wrap gap-4 items-center">
        <span className="font-semibold text-sm text-primary">{patient.firstName} {patient.lastName}</span>
        {ageLabel && (
          <span className="text-secondary text-sm">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</span>
        )}
        <span className="text-secondary text-sm">{sessionDate}</span>
        <div className="ml-auto">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-brand-600 text-white">
            {`Session ${sessionNumber}`}
          </span>
        </div>
      </div>

      {/* Dictation + notes */}
      <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-sm text-primary">Session Notes</span>
          {viewMode === 'full' && (
            <Button
              size="xs"
              color={dictating ? 'primary-destructive' : 'secondary'}
              iconLeading={dictating ? MicOff : Mic}
              onPress={dictating ? stopDictation : startDictation}
            >
              {dictating
                ? `Stop  ${Math.floor(dictSecs / 60)}:${String(dictSecs % 60).padStart(2, '0')}`
                : 'Dictate'}
            </Button>
          )}
        </div>
        <textarea
          rows={4}
          placeholder={dictating ? 'Listening…' : 'Type or dictate session notes…'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={cx(
            'w-full resize-none rounded-lg border px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 min-h-[96px]',
            dictating ? 'border-red-400 bg-red-50' : 'border-secondary bg-primary',
          )}
        />
        <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
          <div className="flex gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full border border-secondary bg-secondary_alt px-2 py-0.5 text-[0.72rem] text-secondary">
              <User size={11} /> Patient profile
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-secondary bg-secondary_alt px-2 py-0.5 text-[0.72rem] text-secondary">
              <History size={11} /> {`${sessions.length} previous session${sessions.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          <Button
            size="xs"
            color="secondary"
            iconLeading={Star}
            onPress={handlePopulate}
            isDisabled={!notes.trim() || loading}
            isLoading={loading}
          >
            {loading ? `Reading ${sessions.length} sessions…` : 'Add to Chart'}
          </Button>
        </div>
      </div>

      {/* H-SOAPIER sections */}
      <p className="font-semibold text-sm text-primary mb-4">H-SOAPIER Chart</p>
      <div className="flex flex-col gap-4">
        {SOAPIER_SECTIONS.map(({ key, letter, label, placeholder, rows }) => {
          const isEmpty = populated && !soapie[key];
          return (
            <div
              key={key}
              className={cx(
                'rounded-xl border bg-primary shadow-xs p-5',
                isEmpty ? 'border-2 border-orange-400' : 'border-secondary',
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[30px] h-[30px] rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-[0.8rem] leading-none">{letter}</span>
                </div>
                <span className="font-semibold text-sm text-primary">{label}</span>
              </div>
              <textarea
                rows={rows}
                placeholder={placeholder}
                value={soapie[key] || ''}
                onChange={(e) => setSoapie((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full resize-none rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 min-h-[120px] bg-primary"
              />
              {isEmpty && (
                <span className="text-orange-500 mt-1 block text-xs">This section may be important to fill in</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/chart`)}>
          Cancel
        </Button>
        <Button color="primary" size="sm" onPress={handleSave}>
          Save New Chart
        </Button>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
