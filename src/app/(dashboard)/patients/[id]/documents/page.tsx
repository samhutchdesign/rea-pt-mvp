'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import { mockPatients, mockDocuments } from '@/lib/mock-data';

type UploadPhase = 'idle' | 'uploading' | 'processing' | 'done';

const FAKE_FILENAME = 'Patient_Intake_Margaret_Chen.pdf';
const ISABELLE_ID = 'pat8';

// ── Mock PDF data (Isabelle Martin's intake form) ──────────────────────────
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

function PdfViewer() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Page 1 */}
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

      {/* Page 2 */}
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

      {/* Page 3 */}
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
  );
}

export default function PatientDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const [pdfOpen, setPdfOpen] = useState(false);

  if (!patient) return null;

  const isIsabelle = id === ISABELLE_ID;

  const submittedDocs = patient.documents
    .map((pd) => ({ ...pd, template: mockDocuments.find((d) => d.id === pd.documentId) }))
    .filter((d) => d.template);

  const docCards = isIsabelle
    ? [{ id: 'isabelle-intake', name: 'Intake Form', date: '2026-06-01', linkable: true }]
    : submittedDocs.length > 0
    ? submittedDocs.map((d) => ({ id: d.documentId, name: d.template!.name, date: d.submittedAt, linkable: false }))
    : [{ id: 'placeholder', name: 'Intake Form', date: '—', linkable: false }];

  const openUpload = () => { setUploadPhase('idle'); setUploadOpen(true); };

  const handleBrowseClick = () => {
    setUploadPhase('uploading');
    setTimeout(() => { setUploadPhase('processing'); setTimeout(() => setUploadPhase('done'), 2000); }, 1500);
  };

  const handleReview = () => {
    setUploadOpen(false);
    setUploadPhase('idle');
    router.push(`/patients/${id}/upload-review`);
  };

  const closeUpload = () => {
    if (uploadPhase === 'processing') return;
    setUploadOpen(false);
    setUploadPhase('idle');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>Documents</Typography>
        <Button variant="contained" startIcon={<UploadFileRoundedIcon />} onClick={openUpload} disableElevation>
          Upload Patient PDF
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {docCards.map((doc) => (
          <Card
            key={doc.id}
            sx={{
              cursor: doc.linkable ? 'pointer' : 'default',
              '&:hover': doc.linkable ? { borderColor: 'primary.main' } : {},
              transition: 'border-color 0.15s',
            }}
            onClick={doc.linkable ? () => setPdfOpen(true) : undefined}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2 }}>
              <Box sx={{ width: 44, height: 44, bgcolor: '#FFF3E0', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PictureAsPdfRoundedIcon sx={{ color: '#E65100', fontSize: 24 }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight={600}>{doc.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {doc.date !== '—'
                    ? `Submitted ${new Date(doc.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : 'Not yet submitted'}
                </Typography>
              </Box>
              <Chip label="PDF" size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 600, fontSize: '0.72rem' }} />
            </Box>
          </Card>
        ))}
      </Box>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onClose={closeUpload} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Upload Patient PDF</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {uploadPhase === 'idle' && (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Upload a patient intake form, referral letter, or medical history PDF. Our AI will extract the information and let you review it before saving.
              </Typography>
              <Box
                onClick={handleBrowseClick}
                sx={{ border: '2px dashed #E0E0E0', borderRadius: 2, p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, cursor: 'pointer', transition: 'border-color 0.15s', '&:hover': { borderColor: 'primary.main', bgcolor: '#FAFAFA' } }}
              >
                <UploadFileRoundedIcon sx={{ fontSize: 40, color: '#BDBDBD' }} />
                <Typography variant="body2" fontWeight={500}>Drag & drop a PDF here</Typography>
                <Typography variant="caption" color="text.secondary">or click to browse</Typography>
              </Box>
            </>
          )}
          {(uploadPhase === 'uploading' || uploadPhase === 'processing') && (
            <Box sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                {uploadPhase === 'uploading' ? <UploadFileRoundedIcon sx={{ color: 'primary.main' }} /> : <AutoAwesomeRoundedIcon sx={{ color: '#F57C00' }} />}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={500} mb={0.25}>{uploadPhase === 'uploading' ? `Uploading ${FAKE_FILENAME}…` : 'AI is reading your document…'}</Typography>
                  <Typography variant="caption" color="text.secondary">{uploadPhase === 'uploading' ? 'Uploading file' : 'Extracting patient information'}</Typography>
                </Box>
              </Box>
              <LinearProgress variant={uploadPhase === 'processing' ? 'indeterminate' : 'determinate'} value={60} sx={{ borderRadius: 1 }} />
            </Box>
          )}
          {uploadPhase === 'done' && (
            <Box sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 2, bgcolor: '#F1F8E9', borderRadius: 2, border: '1px solid #C5E1A5' }}>
                <CheckCircleRoundedIcon sx={{ color: '#2E7D32', fontSize: 22, flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="#2E7D32">PDF successfully uploaded</Typography>
                  <Typography variant="caption" color="text.secondary">{FAKE_FILENAME}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" fontWeight={500} mb={1}>Fields extracted:</Typography>
              <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                {['First & last name', 'Date of birth', 'Chief complaint', 'Symptom duration', 'Medical history', 'Current medications', 'Treatment goals'].map((f) => (
                  <Box component="li" key={f}><Typography variant="body2" color="text.secondary">{f}</Typography></Box>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>Review and edit the extracted information before confirming.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeUpload} disabled={uploadPhase === 'processing'}>{uploadPhase === 'done' ? 'Close' : 'Cancel'}</Button>
          {uploadPhase === 'done' && <Button variant="contained" disableElevation onClick={handleReview}>Review Extracted Information</Button>}
        </DialogActions>
      </Dialog>

      {/* PDF viewer dialog */}
      <Dialog open={pdfOpen} onClose={() => setPdfOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 1.5 }}>
          <ArticleRoundedIcon sx={{ fontSize: 18, color: '#C62828' }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>Patient_Intake_Form.pdf</Typography>
          <Chip label="Original (patient voice)" size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontSize: '0.7rem' }} />
          <IconButton size="small" onClick={() => setPdfOpen(false)} sx={{ ml: 0.5 }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#EEEEEE', p: 2 }}>
          <PdfViewer />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
