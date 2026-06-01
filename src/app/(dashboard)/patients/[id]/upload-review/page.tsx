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
import TopBar from '@/components/layout/TopBar';
import { mockPatients } from '@/lib/mock-data';
import { saveUploadedData } from '@/lib/uploadStore';

const FAKE_FILENAME = 'Patient_Intake_Form.pdf';

const FAKE_EXTRACTED = {
  firstName: 'Isabelle',
  lastName: 'Martin',
  dateOfBirth: '1990-03-22',
  chiefComplaint: 'Stress urinary incontinence and pelvic heaviness following second vaginal delivery, 8 weeks postpartum',
  symptomDuration: '8 weeks (onset February 2026)',
  medicalHistory: 'Iron deficiency anemia during pregnancy (resolved). Mild diastasis recti (2 cm gap at navel).',
  medications: 'Postnatal vitamins, Ferrous gluconate 300mg daily',
  treatmentGoals: 'Return to running and high-impact exercise without leakage; resolve pelvic heaviness',
  phone: '(604) 555-0190',
  address: '88 Westbrook Ave, Vancouver, BC V6K 2G4',
  emergencyFirstName: 'David',
  emergencyLastName: 'Martin',
  emergencyPhone: '(604) 555-0191',
  emergencyRelationship: 'Spouse',
};

const CLINICAL_FIELDS: { key: keyof typeof FAKE_EXTRACTED; label: string; multiline?: boolean; rows?: number }[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'chiefComplaint', label: 'Chief Complaint', multiline: true, rows: 2 },
  { key: 'symptomDuration', label: 'Symptom Duration / Date of Onset' },
  { key: 'medicalHistory', label: 'Medical History', multiline: true, rows: 3 },
  { key: 'medications', label: 'Current Medications', multiline: true, rows: 2 },
  { key: 'treatmentGoals', label: 'Treatment Goals', multiline: true, rows: 2 },
];

const CONTACT_FIELDS: { key: keyof typeof FAKE_EXTRACTED; label: string }[] = [
  { key: 'phone', label: 'Phone Number' },
  { key: 'address', label: 'Home Address' },
  { key: 'emergencyFirstName', label: 'Emergency Contact First Name' },
  { key: 'emergencyLastName', label: 'Emergency Contact Last Name' },
  { key: 'emergencyPhone', label: 'Emergency Contact Phone' },
  { key: 'emergencyRelationship', label: 'Emergency Contact Relationship' },
];

// Renders a single field row in the fake PDF document
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

  const set = (key: keyof typeof FAKE_EXTRACTED, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  // Track which fields have been edited vs the original
  const isEdited = (key: keyof typeof FAKE_EXTRACTED) => fields[key] !== FAKE_EXTRACTED[key];

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

      {/* Full-width two-column layout */}
      <Box sx={{ pt: '56px', display: 'flex', gap: 4, alignItems: 'flex-start', px: 4, py: 4 }}>

        {/* ── Left: editable form ── */}
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
            Our AI extracted the following from <strong>{FAKE_FILENAME}</strong>. Compare against the original on the right, then edit and confirm.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Chip
              label="14 fields extracted"
              size="small"
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ bgcolor: '#FFF8E1', color: '#F57F17', fontWeight: 500 }}
            />
            {Object.keys(FAKE_EXTRACTED).some((k) => isEdited(k as keyof typeof FAKE_EXTRACTED)) && (
              <Chip
                label={`${Object.keys(FAKE_EXTRACTED).filter((k) => isEdited(k as keyof typeof FAKE_EXTRACTED)).length} field${Object.keys(FAKE_EXTRACTED).filter((k) => isEdited(k as keyof typeof FAKE_EXTRACTED)).length > 1 ? 's' : ''} edited`}
                size="small"
                sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 500 }}
              />
            )}
          </Box>

          <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
            Fields highlighted in yellow have been edited from the original. The original document is shown on the right for reference.
          </Alert>

          {/* Clinical section */}
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
            Clinical Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
            {CLINICAL_FIELDS.map(({ key, label, multiline, rows }) => (
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

          <Divider sx={{ mb: 3 }} />

          {/* Contact section */}
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 2 }}>
            Contact Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {CONTACT_FIELDS.map(({ key, label }) => (
              <TextField
                key={key}
                label={label}
                value={fields[key]}
                onChange={(e) => set(key, e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={isEdited(key) ? { '& .MuiInputBase-root': { bgcolor: '#FFFDE7' } } : {}}
              />
            ))}
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={() => router.back()}>Cancel</Button>
            <Button variant="contained" disableElevation onClick={handleConfirm} sx={{ px: 3 }}>
              Confirm New Information
            </Button>
          </Box>
        </Box>

        {/* ── Right: sticky PDF viewer ── */}
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
          {/* Panel header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
            <ArticleRoundedIcon sx={{ fontSize: 16, color: '#C62828' }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: 11 }}>
              {FAKE_FILENAME}
            </Typography>
            <Chip label="Original" size="small" sx={{ ml: 'auto', height: 18, fontSize: 10, bgcolor: '#FFEBEE', color: '#C62828' }} />
          </Box>

          {/* Pages */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* ── Page 1: Demographics ── */}
            <Box sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.14)', p: 3, fontFamily: '"Times New Roman", Times, serif' }}>
              <Box sx={{ textAlign: 'center', mb: 2.5, pb: 2, borderBottom: '2px solid #1a1a1a' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'inherit' }}>Rea Pelvic Health</Typography>
                <Typography sx={{ fontSize: 8.5, color: '#555', mt: 0.25, fontFamily: 'inherit' }}>1420 Health Sciences Drive, Suite 300, Vancouver, BC · (604) 555-0100</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, mt: 1.5, letterSpacing: 0.5, fontFamily: 'inherit' }}>PATIENT INTAKE FORM</Typography>
              </Box>

              <DocSection title="Patient Information">
                <DocField label="Full Name" value={`${FAKE_EXTRACTED.firstName} ${FAKE_EXTRACTED.lastName}`} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Date of Birth" value={FAKE_EXTRACTED.dateOfBirth} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Sex Assigned at Birth" value="Female" /></Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Phone" value={FAKE_EXTRACTED.phone} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Email" value="isabelle.martin@email.com" /></Box>
                </Box>
                <DocField label="Home Address" value={FAKE_EXTRACTED.address} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Occupation" value="Registered Nurse (maternity leave)" /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Preferred Language" value="English" /></Box>
                </Box>
              </DocSection>

              <DocSection title="Referring Physician">
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Physician Name" value="Dr. Amara Osei" /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Clinic / Hospital" value="BC Women's Health Centre" /></Box>
                </Box>
                <DocField label="Referral Reason" value="Postpartum pelvic floor rehabilitation — SUI and diastasis recti" />
              </DocSection>

              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #DDD', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Typography sx={{ fontSize: 8, color: '#999', fontFamily: 'inherit' }}>Rea Pelvic Health — Confidential Patient Record</Typography>
                <Typography sx={{ fontSize: 8, color: '#999', fontFamily: 'inherit' }}>Page 1 of 3</Typography>
              </Box>
            </Box>

            {/* ── Page 2: Clinical ── */}
            <Box sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.14)', p: 3, fontFamily: '"Times New Roman", Times, serif' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1.5, borderBottom: '1px solid #1a1a1a' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>PATIENT INTAKE FORM — Clinical History</Typography>
                <Typography sx={{ fontSize: 10, color: '#555', fontFamily: 'inherit' }}>Isabelle Martin · DOB 1990-03-22</Typography>
              </Box>

              <DocSection title="Chief Complaint & Symptom History">
                <DocField label="Chief Complaint" value={FAKE_EXTRACTED.chiefComplaint} />
                <DocField label="Symptom Duration / Date of Onset" value={FAKE_EXTRACTED.symptomDuration} />
                <DocField label="Symptom Evolution" value="Initially mild leakage on coughing/sneezing at 2 weeks postpartum. Worsening with return to light exercise at 6 weeks. Pelvic heaviness constant throughout the day." />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Pain Level (0–10)" value="3 / 10" /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Functional Mobility" value="Independent with all ADLs" /></Box>
                </Box>
              </DocSection>

              <DocSection title="Medical & Surgical History">
                <DocField label="Relevant Medical History" value={FAKE_EXTRACTED.medicalHistory} />
                <DocField label="Previous Physiotherapy" value="No prior pelvic floor physiotherapy. General physio for knee sprain (2019)." />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Surgeries" value="Emergency C-section (Jan 2026) — current pregnancy only" /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Surgery Date" value="January 14, 2026" /></Box>
                </Box>
              </DocSection>

              <DocSection title="Medications & Diagnostics">
                <DocField label="Current Medications" value={FAKE_EXTRACTED.medications} />
                <DocField label="Known Allergies" value="Penicillin (rash)" />
                <DocField label="Recent Exams / Diagnostics" value="OB clearance for physiotherapy — March 2026. No imaging ordered." />
              </DocSection>

              <DocSection title="Treatment Goals">
                <DocField label="Patient-Stated Goals" value={FAKE_EXTRACTED.treatmentGoals} />
                <DocField label="Additional Notes" value="Patient is motivated and breastfeeding. Requests exercises that can be done at home during nap times." />
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
                  <Box sx={{ flex: 1 }}><DocField label="Diet" value="Balanced — breastfeeding diet, increased calories" /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Current Exercise" value="Walking 20–30 min/day, light stretching" /></Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Smoker" value="Non-smoker" /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Alcohol" value="None (breastfeeding)" /></Box>
                </Box>
                <DocField label="Social Environment" value="Lives with partner and 5-month-old infant. Partner works from home." />
              </DocSection>

              <DocSection title="Emergency Contact">
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="First Name" value={FAKE_EXTRACTED.emergencyFirstName} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Last Name" value={FAKE_EXTRACTED.emergencyLastName} /></Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}><DocField label="Phone" value={FAKE_EXTRACTED.emergencyPhone} /></Box>
                  <Box sx={{ flex: 1 }}><DocField label="Relationship" value={FAKE_EXTRACTED.emergencyRelationship} /></Box>
                </Box>
              </DocSection>

              <DocSection title="Consent & Declaration">
                <Typography sx={{ fontSize: 10, color: '#333', lineHeight: 1.6, mb: 1.5, fontFamily: 'inherit' }}>
                  I consent to physiotherapy assessment and treatment at Rea Pelvic Health. I understand that I may withdraw consent at any time and that my information will be kept strictly confidential in accordance with applicable privacy legislation.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
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
