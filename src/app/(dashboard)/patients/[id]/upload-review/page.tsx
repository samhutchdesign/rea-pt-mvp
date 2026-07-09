'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Alert } from '@/components/ui/alert';
import { Divider } from '@/components/ui/divider';
import { mockPatients } from '@/lib/mock-data';
import { saveUploadedData } from '@/lib/uploadStore';
import { useViewMode } from '@/lib/viewModeStore';
import { ArrowLeft, FileText, Languages, Star } from 'lucide-react';

const FAKE_FILENAME = 'Patient_Intake_Form.pdf';

// Original patient-voice text as written on the form (shown in PDF panel)
const FAKE_RAW = {
  fullName: 'Isabelle Martin',
  dateOfBirth: '1990-03-22',
  phone: '(604) 555-0190',
  email: 'isabelle.martin@email.com',
  address: '88 Westbrook Ave, Vancouver, BC V6K 2G4',
  occupation: "I'm a nurse but I'm on maternity leave right now",
  chiefComplaint: "I've been leaking when I cough, sneeze, or laugh, and I feel a heavy pressure low in my pelvis. It started after having my baby about 8 weeks ago.",
  symptomDuration: 'About 8 weeks ago — started 2 weeks after giving birth',
  symptomEvolution: 'At first just a little leak when I sneezed. Then when I started walking more at 6 weeks it got worse. The heavy feeling is there most of the day.',
  painLevel: '3 out of 10',
  functionalMobility: 'I can do everything at home fine, I just avoid anything high impact like running or jumping',
  medicalHistory: "I had low iron during my pregnancy but that cleared up. My doctor said my stomach muscles have a small separation (about 2 cm).",
  previousPhysio: 'I did some physio for my knee in 2019. Never had pelvic floor physio before.',
  obstetricsHistory: '2 pregnancies, 2 births. First was a normal vaginal delivery in 2023. Second was an emergency C-section in January 2026.',
  bladderBowelSymptoms: "I leak when I cough, sneeze or laugh. Sometimes I also leak when I'm rushing to the bathroom. No problems with my bowels.",
  medications: 'Prenatal vitamins and iron pills',
  allergies: 'Penicillin — I get a rash',
  treatmentGoals: 'I want to run again without leaking. I also want to get rid of the heavy feeling down there.',
  additionalNotes: "I'm breastfeeding so I'd love exercises I can do at home during nap time.",
  referringPhysician: "Dr. Amara Osei at BC Women's",
  referralReason: 'She referred me for pelvic floor physio after my 6-week check-up',
  diet: "Eating healthy and a bit more since I'm breastfeeding",
  exercise: 'Just 20–30 min walks most days and some gentle stretching',
  smoker: 'No',
  alcohol: "No, I'm breastfeeding",
  socialEnvironment: "I live with my partner and our baby. My partner works from home which is a huge help.",
  emergencyFirstName: 'David',
  emergencyLastName: 'Martin',
  emergencyPhone: '(604) 555-0191',
  emergencyRelationship: 'My husband',
};

// AI-translated clinical version — editable, saved to profile on confirm
const FAKE_EXTRACTED = {
  firstName: 'Isabelle',
  lastName: 'Martin',
  dateOfBirth: '1990-03-22',
  occupation: 'Registered Nurse (currently on maternity leave)',
  chiefComplaint: 'Stress urinary incontinence (SUI) with concurrent pelvic organ prolapse symptoms (pelvic heaviness/pressure). Onset 8 weeks postpartum following second delivery (emergency LSCS).',
  symptomDuration: 'Symptom onset approximately 2 weeks postpartum; progressive over 8-week course.',
  symptomEvolution: 'Initial SUI on Valsalva (cough/sneeze) at 2 weeks postpartum. Exacerbation with low-impact ambulation at 6 weeks. Persistent pelvic heaviness throughout the day consistent with pelvic floor laxity.',
  painLevel: '3/10 (VAS)',
  functionalMobility: 'Independent with all ADLs. Avoiding high-impact loading (running, jumping). Ambulatory 20–30 min/day.',
  medicalHistory: 'Iron deficiency anaemia during pregnancy — resolved. Diastasis recti: 2 cm inter-recti distance at umbilical level (patient-reported).',
  previousPhysio: 'No prior pelvic floor physiotherapy. Orthopaedic physiotherapy for knee injury, 2019.',
  obstetricsHistory: 'G2P2: SVD 2023; emergency LSCS January 14, 2026. Postpartum presentation from second delivery.',
  bladderBowelSymptoms: 'SUI: leakage with cough, sneeze, laughter. UUI: urgency-preceded leakage episodes. No bowel dysfunction reported.',
  medications: 'Postnatal vitamins; ferrous gluconate 300 mg daily',
  allergies: 'Penicillin — cutaneous adverse reaction (rash)',
  treatmentGoals: 'Return to high-impact exercise (running) without stress urinary leakage; resolution of pelvic heaviness and pressure symptoms.',
  additionalNotes: 'Currently breastfeeding; patient requests home exercise programme suitable for neonatal care schedule (nap-time accessible).',
  referringPhysician: "Dr. Amara Osei, BC Women's Health Centre",
  referralReason: 'Postpartum pelvic floor rehabilitation — SUI and diastasis recti (6-week postnatal review)',
  diet: 'Hypercaloric balanced diet; breastfeeding supplementation',
  exercise: 'Ambulatory activity: 20–30 min/day. No structured exercise. Avoiding high-impact loading.',
  smoker: 'Non-smoker',
  alcohol: 'Nil — breastfeeding',
  socialEnvironment: 'Cohabitates with partner and 5-month-old infant; partner works from home. Adequate social support.',
  phone: '(604) 555-0190',
  address: '88 Westbrook Ave, Vancouver, BC V6K 2G4',
  emergencyFirstName: 'David',
  emergencyLastName: 'Martin',
  emergencyPhone: '(604) 555-0191',
  emergencyRelationship: 'Spouse',
};

type FieldKey = keyof typeof FAKE_EXTRACTED;

interface FormField { key: FieldKey; label: string; multiline?: boolean; rows?: number }
interface FormSection { title: string; fields: FormField[] }

const FORM_SECTIONS: FormSection[] = [
  {
    title: 'Patient Information',
    fields: [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'dateOfBirth', label: 'Date of Birth' },
      { key: 'occupation', label: 'Occupation' },
    ],
  },
  {
    title: 'Chief Complaint & Symptom History',
    fields: [
      { key: 'chiefComplaint', label: 'Chief Complaint', multiline: true, rows: 3 },
      { key: 'symptomDuration', label: 'Date of Onset / Duration' },
      { key: 'symptomEvolution', label: 'Symptom Evolution', multiline: true, rows: 3 },
      { key: 'painLevel', label: 'Pain Level (0–10)' },
      { key: 'functionalMobility', label: 'Functional Mobility', multiline: true, rows: 2 },
    ],
  },
  {
    title: 'Medical & Obstetric History',
    fields: [
      { key: 'medicalHistory', label: 'Relevant Medical History', multiline: true, rows: 3 },
      { key: 'previousPhysio', label: 'Previous Physiotherapy', multiline: true, rows: 2 },
      { key: 'obstetricsHistory', label: 'Obstetric History', multiline: true, rows: 2 },
      { key: 'bladderBowelSymptoms', label: 'Bladder & Bowel Symptoms', multiline: true, rows: 2 },
    ],
  },
  {
    title: 'Medications, Allergies & Goals',
    fields: [
      { key: 'medications', label: 'Current Medications', multiline: true, rows: 2 },
      { key: 'allergies', label: 'Known Allergies' },
      { key: 'treatmentGoals', label: 'Treatment Goals', multiline: true, rows: 2 },
      { key: 'additionalNotes', label: 'Additional Notes', multiline: true, rows: 2 },
    ],
  },
  {
    title: 'Referral',
    fields: [
      { key: 'referringPhysician', label: 'Referring Physician' },
      { key: 'referralReason', label: 'Referral Reason' },
    ],
  },
  {
    title: 'Lifestyle',
    fields: [
      { key: 'diet', label: 'Diet' },
      { key: 'exercise', label: 'Current Exercise' },
      { key: 'smoker', label: 'Smoker' },
      { key: 'alcohol', label: 'Alcohol' },
      { key: 'socialEnvironment', label: 'Social Environment', multiline: true, rows: 2 },
    ],
  },
  {
    title: 'Contact Information',
    fields: [
      { key: 'phone', label: 'Phone Number' },
      { key: 'address', label: 'Home Address' },
      { key: 'emergencyFirstName', label: 'Emergency Contact First Name' },
      { key: 'emergencyLastName', label: 'Emergency Contact Last Name' },
      { key: 'emergencyPhone', label: 'Emergency Contact Phone' },
      { key: 'emergencyRelationship', label: 'Emergency Contact Relationship' },
    ],
  },
];

const TOTAL_FIELDS = FORM_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);

function DocField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#666', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, borderBottom: '1px solid #BDBDBD', paddingBottom: 4, minHeight: 20, lineHeight: 1.5, color: '#1a1a1a' }}>
        {value || ' '}
      </div>
    </div>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#333', borderBottom: '1.5px solid #333', paddingBottom: 4, marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

const pageStyle: React.CSSProperties = { background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.14)', padding: 24, fontFamily: '"Times New Roman", Times, serif' };
const footerRow: React.CSSProperties = { marginTop: 16, paddingTop: 12, borderTop: '1px solid #DDD', display: 'flex', justifyContent: 'space-between' };
const footerTxt: React.CSSProperties = { fontSize: 8, color: '#999', fontFamily: 'inherit' };

export default function UploadReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const viewMode = useViewMode();
  const patient = mockPatients.find((p) => p.id === id);
  const [fields, setFields] = useState<typeof FAKE_EXTRACTED>({ ...FAKE_EXTRACTED });

  if (!patient) return null;

  const set = (key: FieldKey, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const isEdited = (key: FieldKey) => fields[key] !== FAKE_EXTRACTED[key];
  const editCount = (Object.keys(FAKE_EXTRACTED) as FieldKey[]).filter(isEdited).length;

  const handleConfirm = () => {
    saveUploadedData(id, fields);
    router.push(`/patients/${id}/overview?uploaded=true`);
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'All Patients', href: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${id}/documents` },
          { label: 'Review Uploaded PDF' },
        ]}
      />

      <div className="flex gap-8 items-start p-8">

        {/* ── Left: editable clinical form (full mode only) ── */}
        {viewMode === 'full' && (
          <div className="flex-1 min-w-0">
            <Button
              color="tertiary"
              size="sm"
              iconLeading={ArrowLeft}
              onPress={() => router.back()}
              className="mb-4"
            >
              Back to Documents
            </Button>

            <div className="mb-2 flex items-center gap-3">
              <Star size={22} className="text-primary" />
              <h2 className="m-0 text-2xl font-bold text-primary">Review Extracted Information</h2>
            </div>
            <p className="mb-1.5 text-sm text-secondary">
              AI extracted and translated responses from <strong>{FAKE_FILENAME}</strong>. Compare against the original on the right, edit if needed, then confirm.
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF8E1] px-2.5 py-1 text-xs font-medium text-[#F57F17]">
                <Star size={12} /> {`${TOTAL_FIELDS} fields extracted`}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#F3E5F5] px-2.5 py-1 text-xs font-medium text-[#6A1B9A]">
                <Languages size={12} /> Patient language → clinical notes
              </span>
              {editCount > 0 && (
                <span className="inline-flex items-center rounded-md bg-[#E8F5E9] px-2.5 py-1 text-xs font-medium text-[#2E7D32]">
                  {`${editCount} field${editCount > 1 ? 's' : ''} edited`}
                </span>
              )}
            </div>

            <Alert type="info" className="mb-6 text-sm">
              Patient responses have been translated to clinical terminology. The original patient-filled form is shown on the right. Fields highlighted in yellow have been edited from the AI translation.
            </Alert>

            {FORM_SECTIONS.map((section, si) => (
              <div key={section.title}>
                {si > 0 && <Divider className="my-6" />}
                <p className="mb-4 block text-xs font-semibold uppercase tracking-wide text-secondary">
                  {section.title}
                </p>
                <div className="flex flex-col gap-5">
                  {section.fields.map(({ key, label, multiline, rows }) => (
                    <div key={key}>
                      <div className="mb-1 text-xs text-secondary">{label}</div>
                      {multiline ? (
                        <textarea
                          rows={rows}
                          value={fields[key]}
                          onChange={(e) => set(key, e.target.value)}
                          className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                          style={isEdited(key) ? { background: '#FFFDE7' } : undefined}
                        />
                      ) : (
                        <Input
                          value={fields[key]}
                          onChange={(val) => set(key, val)}
                          inputClassName={isEdited(key) ? '!bg-[#FFFDE7]' : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Divider className="my-8" />

            <div className="flex justify-end gap-3">
              <Button color="secondary" size="sm" onPress={() => router.back()}>Cancel</Button>
              <Button color="primary" size="sm" onPress={handleConfirm} className="px-6">
                Confirm New Information
              </Button>
            </div>
          </div>
        )}

        {/* ── Right: sticky PDF (original patient voice) ── */}
        <div
          className="flex-1 min-w-0 overflow-y-auto rounded-lg bg-[#EEEEEE] p-3"
          style={{
            position: 'sticky',
            top: 72,
            maxHeight: 'calc(100vh - 88px)',
          }}
        >
          <div className="mb-3 flex items-center gap-2 pl-1">
            <FileText size={16} className="text-secondary" />
            <span className="text-xs font-semibold text-secondary">{FAKE_FILENAME}</span>
            <span className="ml-auto inline-flex items-center rounded bg-[#FFEBEE] px-2 py-0.5 text-[10px] text-[#C62828]">Original (patient voice)</span>
          </div>

          <div className="flex flex-col gap-4">

            {/* ── Page 1: Demographics & Referral ── */}
            <div style={pageStyle}>
              <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid #1a1a1a' }}>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'inherit' }}>Rea Pelvic Health</div>
                <div style={{ fontSize: 8.5, color: '#555', marginTop: 2, fontFamily: 'inherit' }}>1420 Health Sciences Drive, Suite 300, Vancouver, BC · (604) 555-0100</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 12, letterSpacing: 0.5, fontFamily: 'inherit' }}>PATIENT INTAKE FORM</div>
              </div>

              <DocSection title="Patient Information">
                <DocField label="Full Name" value={FAKE_RAW.fullName} />
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}><DocField label="Date of Birth" value={FAKE_RAW.dateOfBirth} /></div>
                  <div style={{ flex: 1 }}><DocField label="Sex Assigned at Birth" value="Female" /></div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}><DocField label="Phone" value={FAKE_RAW.phone} /></div>
                  <div style={{ flex: 1 }}><DocField label="Email" value={FAKE_RAW.email} /></div>
                </div>
                <DocField label="Home Address" value={FAKE_RAW.address} />
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}><DocField label="What is your occupation?" value={FAKE_RAW.occupation} /></div>
                  <div style={{ flex: 1 }}><DocField label="Preferred Language" value="English" /></div>
                </div>
              </DocSection>

              <DocSection title="Referring Physician">
                <DocField label="Who referred you to us?" value={FAKE_RAW.referringPhysician} />
                <DocField label="Reason for referral" value={FAKE_RAW.referralReason} />
              </DocSection>

              <div style={footerRow}>
                <div style={footerTxt}>Rea Pelvic Health — Confidential Patient Record</div>
                <div style={footerTxt}>Page 1 of 3</div>
              </div>
            </div>

            {/* ── Page 2: Clinical History ── */}
            <div style={pageStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>PATIENT INTAKE FORM — Clinical History</div>
                <div style={{ fontSize: 10, color: '#555', fontFamily: 'inherit' }}>Isabelle Martin · DOB 1990-03-22</div>
              </div>

              <DocSection title="What brings you in today?">
                <DocField label="Describe your main concern" value={FAKE_RAW.chiefComplaint} />
                <DocField label="When did this start?" value={FAKE_RAW.symptomDuration} />
                <DocField label="How have your symptoms changed over time?" value={FAKE_RAW.symptomEvolution} />
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}><DocField label="Pain level right now (0 = none, 10 = worst)" value={FAKE_RAW.painLevel} /></div>
                  <div style={{ flex: 1 }}><DocField label="How does this affect your daily life?" value={FAKE_RAW.functionalMobility} /></div>
                </div>
              </DocSection>

              <DocSection title="Your Health History">
                <DocField label="Any medical conditions, past surgeries, or diagnoses?" value={FAKE_RAW.medicalHistory} />
                <DocField label="Have you seen a physiotherapist before?" value={FAKE_RAW.previousPhysio} />
                <DocField label="How many pregnancies and births have you had? What type?" value={FAKE_RAW.obstetricsHistory} />
                <DocField label="Describe any bladder or bowel symptoms" value={FAKE_RAW.bladderBowelSymptoms} />
              </DocSection>

              <DocSection title="Medications & Allergies">
                <DocField label="What medications are you currently taking?" value={FAKE_RAW.medications} />
                <DocField label="Do you have any known allergies?" value={FAKE_RAW.allergies} />
              </DocSection>

              <DocSection title="Your Goals">
                <DocField label="What would you like to achieve from physiotherapy?" value={FAKE_RAW.treatmentGoals} />
                <DocField label="Anything else you'd like us to know?" value={FAKE_RAW.additionalNotes} />
              </DocSection>

              <div style={footerRow}>
                <div style={footerTxt}>Rea Pelvic Health — Confidential Patient Record</div>
                <div style={footerTxt}>Page 2 of 3</div>
              </div>
            </div>

            {/* ── Page 3: Lifestyle, Emergency Contact & Consent ── */}
            <div style={pageStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>PATIENT INTAKE FORM — Lifestyle & Consent</div>
                <div style={{ fontSize: 10, color: '#555', fontFamily: 'inherit' }}>Isabelle Martin · DOB 1990-03-22</div>
              </div>

              <DocSection title="Lifestyle & Habits">
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}><DocField label="How would you describe your diet?" value={FAKE_RAW.diet} /></div>
                  <div style={{ flex: 1 }}><DocField label="What exercise do you currently do?" value={FAKE_RAW.exercise} /></div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}><DocField label="Do you smoke?" value={FAKE_RAW.smoker} /></div>
                  <div style={{ flex: 1 }}><DocField label="Do you drink alcohol?" value={FAKE_RAW.alcohol} /></div>
                </div>
                <DocField label="Who do you live with? What is your home situation like?" value={FAKE_RAW.socialEnvironment} />
              </DocSection>

              <DocSection title="Emergency Contact">
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}><DocField label="First Name" value={FAKE_RAW.emergencyFirstName} /></div>
                  <div style={{ flex: 1 }}><DocField label="Last Name" value={FAKE_RAW.emergencyLastName} /></div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}><DocField label="Phone" value={FAKE_RAW.emergencyPhone} /></div>
                  <div style={{ flex: 1 }}><DocField label="Relationship to you" value={FAKE_RAW.emergencyRelationship} /></div>
                </div>
              </DocSection>

              <DocSection title="Consent & Declaration">
                <div style={{ fontSize: 10, color: '#333', lineHeight: 1.6, marginBottom: 12, fontFamily: 'inherit' }}>
                  I consent to physiotherapy assessment and treatment at Rea Pelvic Health. I understand that I may withdraw consent at any time and that my information will be kept strictly confidential in accordance with applicable privacy legislation.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {['I consent to treatment', 'I consent to information sharing with my referring physician', 'I have read and understood the privacy policy'].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginRight: 8 }}>
                      <div style={{ width: 10, height: 10, border: '1px solid #333', marginTop: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 8, lineHeight: 1, fontFamily: 'inherit' }}>✓</span>
                      </div>
                      <span style={{ fontSize: 9, color: '#333', fontFamily: 'inherit' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </DocSection>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1.5px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#555', marginBottom: 12, fontFamily: 'inherit' }}>Patient Signature</div>
                    <div style={{ fontSize: 13, fontStyle: 'italic', borderBottom: '1px solid #333', paddingBottom: 4, color: '#333', fontFamily: '"Dancing Script", cursive, serif' }}>Isabelle Martin</div>
                  </div>
                  <div style={{ width: 120 }}>
                    <div style={{ fontSize: 9, color: '#555', marginBottom: 12, fontFamily: 'inherit' }}>Date</div>
                    <div style={{ fontSize: 11, borderBottom: '1px solid #333', paddingBottom: 4, color: '#333', fontFamily: 'inherit' }}>June 1, 2026</div>
                  </div>
                </div>
              </div>

              <div style={footerRow}>
                <div style={footerTxt}>Rea Pelvic Health — Confidential Patient Record</div>
                <div style={footerTxt}>Page 3 of 3</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
