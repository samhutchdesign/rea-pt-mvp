'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import TopBar from '@/components/layout/TopBar';
import { mockPatients } from '@/lib/mock-data';
import { saveUploadedData } from '@/lib/uploadStore';

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
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#666', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 12, borderBottom: '1px solid #BDBDBD', pb: 0.5, minHeight: 20, lineHeight: 1.5, color: '#1a1a1a' }}>
        {value || ' '}
      </Typography>
    </Box>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#333', borderBottom: '1.5px solid #333', pb: 0.5, mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function UploadReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
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

      <Box sx={{ pt: '56px', display: 'flex', gap: 4, alignItems: 'flex-start', px: 4, py: 4 }}>

        {/* ── Left: editable clinical form ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => router.back()}
            sx={{ mb: 2, color: 'text.secondary', fontSize: 13 }}
          >
            Back to Documents
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <AutoAwesomeRoundedIcon sx={{ color: '#F57C00', fontSize: 22 }} />
            <Typography variant="h5" fontWeight={700}>Review Extracted Information</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={0.75}>
            AI extracted and translated responses from <strong>{FAKE_FILENAME}</strong>. Compare against the original on the right, edit if needed, then confirm.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Chip
              label={`${TOTAL_FIELDS} fields extracted`}
              size="small"
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ bgcolor: '#FFF8E1', color: '#F57F17', fontWeight: 500 }}
            />
            <Chip
              label="Patient language → clinical notes"
              size="small"
              icon={<TranslateRoundedIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ bgcolor: '#F3E5F5', color: '#6A1B9A', fontWeight: 500 }}
            />
            {editCount > 0 && (
              <Chip
                label={`${editCount} field${editCount > 1 ? 's' : ''} edited`}
                size="small"
                sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 500 }}
              />
            )}
          </Box>

          <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
            Patient responses have been translated to clinical terminology. The original patient-filled form is shown on the right. Fields highlighted in yellow have been edited from the AI translation.
          </Alert>

          {FORM_SECTIONS.map((section, si) => (
            <Box key={section.title}>
              {si > 0 && <Divider sx={{ my: 3 }} />}
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {section.fields.map(({ key, label, multiline, rows }) => (
                  <TextField
                    key={key}
                    label={label}
                    value={fields[key]}
                    onChange={(e) => set(key, e.target.value)}
                    multiline={multiline}
                    rows={multiline ? rows : undefined}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={isEdited(key) ? { '& .MuiInputBase-root': { bgcolor: '#FFFDE7' } } : {}}
                  />
                ))}
              </Box>
            </Box>
          ))}

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={() => router.back()}>Cancel</Button>
            <Button variant="contained" disableElevation onClick={handleConfirm} sx={{ px: 3 }}>
              Confirm New Information
            </Button>
          </Box>
        </Box>

        {/* ── Right: sticky PDF (original patient voice) ── */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            position: 'sticky',
            top: 72,
            maxHeight: 'calc(100vh - 88px)',
            overflowY: 'auto',
            borderRadius: 2,
            bgcolor: '#EEEEEE',
            p: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
            <ArticleRoundedIcon sx={{ fontSize: 16, color: '#C62828' }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: 11 }}>
              {FAKE_FILENAME}
            </Typography>
            <Chip label="Original (patient voice)" size="small" sx={{ ml: 'auto', height: 18, fontSize: 10, bgcolor: '#FFEBEE', color: '#C62828' }} />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* ── Page 1: Demographics & Referral ── */}
            <Box sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.14)', p: 3, fontFamily: '"Times New Roman", Times, serif' }}>
              <Box sx={{ textAlign: 'center', mb: 2.5, pb: 2, borderBottom: '2px solid #1a1a1a' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'inherit' }}>Rea Pelvic Health</Typography>
                <Typography sx={{ fontSize: 8.5, color: '#555', mt: 0.25, fontFamily: 'inherit' }}>1420 Health Sciences Drive, Suite 300, Vancouver, BC · (604) 555-0100</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, mt: 1.5, letterSpacing: 0.5, fontFamily: 'inherit' }}>PATIENT INTAKE FORM</Typography>
              </Box>

              <DocSection title="Patient Information">
                <DocField label="Full Name" value={FAKE_RAW.fullName} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Date of Birth" value={FAKE_RAW.dateOfBirth} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Sex Assigned at Birth" value="Female" /></Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Phone" value={FAKE_RAW.phone} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Email" value={FAKE_RAW.email} /></Box>
                </Box>
                <DocField label="Home Address" value={FAKE_RAW.address} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="What is your occupation?" value={FAKE_RAW.occupation} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Preferred Language" value="English" /></Box>
                </Box>
              </DocSection>

              <DocSection title="Referring Physician">
                <DocField label="Who referred you to us?" value={FAKE_RAW.referringPhysician} />
                <DocField label="Reason for referral" value={FAKE_RAW.referralReason} />
              </DocSection>

              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #DDD', display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 8, color: '#999', fontFamily: 'inherit' }}>Rea Pelvic Health — Confidential Patient Record</Typography>
                <Typography sx={{ fontSize: 8, color: '#999', fontFamily: 'inherit' }}>Page 1 of 3</Typography>
              </Box>
            </Box>

            {/* ── Page 2: Clinical History ── */}
            <Box sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.14)', p: 3, fontFamily: '"Times New Roman", Times, serif' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1.5, borderBottom: '1px solid #1a1a1a' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>PATIENT INTAKE FORM — Clinical History</Typography>
                <Typography sx={{ fontSize: 10, color: '#555', fontFamily: 'inherit' }}>Isabelle Martin · DOB 1990-03-22</Typography>
              </Box>

              <DocSection title="What brings you in today?">
                <DocField label="Describe your main concern" value={FAKE_RAW.chiefComplaint} />
                <DocField label="When did this start?" value={FAKE_RAW.symptomDuration} />
                <DocField label="How have your symptoms changed over time?" value={FAKE_RAW.symptomEvolution} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Pain level right now (0 = none, 10 = worst)" value={FAKE_RAW.painLevel} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="How does this affect your daily life?" value={FAKE_RAW.functionalMobility} /></Box>
                </Box>
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

              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #DDD', display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 8, color: '#999', fontFamily: 'inherit' }}>Rea Pelvic Health — Confidential Patient Record</Typography>
                <Typography sx={{ fontSize: 8, color: '#999', fontFamily: 'inherit' }}>Page 2 of 3</Typography>
              </Box>
            </Box>

            {/* ── Page 3: Lifestyle, Emergency Contact & Consent ── */}
            <Box sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.14)', p: 3, fontFamily: '"Times New Roman", Times, serif' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1.5, borderBottom: '1px solid #1a1a1a' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>PATIENT INTAKE FORM — Lifestyle & Consent</Typography>
                <Typography sx={{ fontSize: 10, color: '#555', fontFamily: 'inherit' }}>Isabelle Martin · DOB 1990-03-22</Typography>
              </Box>

              <DocSection title="Lifestyle & Habits">
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="How would you describe your diet?" value={FAKE_RAW.diet} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="What exercise do you currently do?" value={FAKE_RAW.exercise} /></Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Do you smoke?" value={FAKE_RAW.smoker} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Do you drink alcohol?" value={FAKE_RAW.alcohol} /></Box>
                </Box>
                <DocField label="Who do you live with? What is your home situation like?" value={FAKE_RAW.socialEnvironment} />
              </DocSection>

              <DocSection title="Emergency Contact">
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="First Name" value={FAKE_RAW.emergencyFirstName} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Last Name" value={FAKE_RAW.emergencyLastName} /></Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Phone" value={FAKE_RAW.emergencyPhone} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Relationship to you" value={FAKE_RAW.emergencyRelationship} /></Box>
                </Box>
              </DocSection>

              <DocSection title="Consent & Declaration">
                <Typography sx={{ fontSize: 10, color: '#333', lineHeight: 1.6, mb: 1.5, fontFamily: 'inherit' }}>
                  I consent to physiotherapy assessment and treatment at Rea Pelvic Health. I understand that I may withdraw consent at any time and that my information will be kept strictly confidential in accordance with applicable privacy legislation.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                  {['I consent to treatment', 'I consent to information sharing with my referring physician', 'I have read and understood the privacy policy'].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mr: 1 }}>
                      <Box sx={{ width: 10, height: 10, border: '1px solid #333', mt: 0.15, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: 8, lineHeight: 1, fontFamily: 'inherit' }}>✓</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 9, color: '#333', fontFamily: 'inherit' }}>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </DocSection>

              <Box sx={{ mt: 3, pt: 2, borderTop: '1.5px solid #333' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 9, color: '#555', mb: 1.5, fontFamily: 'inherit' }}>Patient Signature</Typography>
                    <Typography sx={{ fontSize: 13, fontStyle: 'italic', borderBottom: '1px solid #333', pb: 0.5, color: '#333', fontFamily: '"Dancing Script", cursive, serif' }}>Isabelle Martin</Typography>
                  </Box>
                  <Box sx={{ width: 120 }}>
                    <Typography sx={{ fontSize: 9, color: '#555', mb: 1.5, fontFamily: 'inherit' }}>Date</Typography>
                    <Typography sx={{ fontSize: 11, borderBottom: '1px solid #333', pb: 0.5, color: '#333', fontFamily: 'inherit' }}>June 1, 2026</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #DDD', display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 8, color: '#999', fontFamily: 'inherit' }}>Rea Pelvic Health — Confidential Patient Record</Typography>
                <Typography sx={{ fontSize: 8, color: '#999', fontFamily: 'inherit' }}>Page 3 of 3</Typography>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>
    </>
  );
}
