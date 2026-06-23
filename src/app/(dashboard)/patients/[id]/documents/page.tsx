'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Card, Tag, Modal, Progress } from 'antd';
import {
  FilePdfOutlined,
  UploadOutlined,
  StarOutlined,
  CheckCircleFilled,
  CloseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { mockPatients, mockDocuments } from '@/lib/mock-data';

const { Text } = Typography;

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

function PdfViewer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page 1 */}
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

      {/* Page 2 */}
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

      {/* Page 3 */}
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text strong style={{ fontSize: 18 }}>Documents</Text>
        <Button type="primary" icon={<UploadOutlined />} onClick={openUpload}>
          Upload Patient PDF
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {docCards.map((doc) => (
          <Card
            key={doc.id}
            hoverable={doc.linkable}
            styles={{ body: { padding: 0 } }}
            style={{ cursor: doc.linkable ? 'pointer' : 'default' }}
            onClick={doc.linkable ? () => setPdfOpen(true) : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
              <div style={{ width: 44, height: 44, background: '#FFF3E0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FilePdfOutlined style={{ color: '#E65100', fontSize: 24 }} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <Text strong style={{ display: 'block' }}>{doc.name}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {doc.date !== '—'
                    ? `Submitted ${new Date(doc.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : 'Not yet submitted'}
                </Text>
              </div>
              <Tag style={{ background: '#FFF3E0', color: '#E65100', fontWeight: 600, fontSize: '0.72rem', border: 'none' }}>PDF</Tag>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload dialog */}
      <Modal
        open={uploadOpen}
        onCancel={closeUpload}
        title="Upload Patient PDF"
        footer={[
          <Button key="close" onClick={closeUpload} disabled={uploadPhase === 'processing'}>{uploadPhase === 'done' ? 'Close' : 'Cancel'}</Button>,
          ...(uploadPhase === 'done' ? [<Button key="review" type="primary" onClick={handleReview}>Review Extracted Information</Button>] : []),
        ]}
      >
        {uploadPhase === 'idle' && (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Upload a patient intake form, referral letter, or medical history PDF. Our AI will extract the information and let you review it before saving.
            </Text>
            <div
              onClick={handleBrowseClick}
              style={{ border: '2px dashed #E0E0E0', borderRadius: 8, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.15s' }}
            >
              <UploadOutlined style={{ fontSize: 40, color: '#BDBDBD' }} />
              <Text strong>Drag & drop a PDF here</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>or click to browse</Text>
            </div>
          </>
        )}
        {(uploadPhase === 'uploading' || uploadPhase === 'processing') && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {uploadPhase === 'uploading' ? <UploadOutlined style={{ color: '#6750A4' }} /> : <StarOutlined style={{ color: '#F57C00' }} />}
              <div style={{ flexGrow: 1 }}>
                <Text strong style={{ display: 'block', marginBottom: 2 }}>{uploadPhase === 'uploading' ? `Uploading ${FAKE_FILENAME}…` : 'AI is reading your document…'}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{uploadPhase === 'uploading' ? 'Uploading file' : 'Extracting patient information'}</Text>
              </div>
            </div>
            <Progress percent={uploadPhase === 'processing' ? 100 : 60} status="active" showInfo={false} />
          </div>
        )}
        {uploadPhase === 'done' && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 16, background: '#F1F8E9', borderRadius: 8, border: '1px solid #C5E1A5' }}>
              <CheckCircleFilled style={{ color: '#2E7D32', fontSize: 22, flexShrink: 0 }} />
              <div>
                <Text strong style={{ color: '#2E7D32', display: 'block' }}>PDF successfully uploaded</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{FAKE_FILENAME}</Text>
              </div>
            </div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Fields extracted:</Text>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              {['First & last name', 'Date of birth', 'Chief complaint', 'Symptom duration', 'Medical history', 'Current medications', 'Treatment goals'].map((f) => (
                <li key={f}><Text type="secondary">{f}</Text></li>
              ))}
            </ul>
            <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>Review and edit the extracted information before confirming.</Text>
          </div>
        )}
      </Modal>

      {/* PDF viewer dialog */}
      <Modal
        open={pdfOpen}
        onCancel={() => setPdfOpen(false)}
        width={800}
        closable={false}
        footer={null}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileTextOutlined style={{ fontSize: 18, color: '#C62828' }} />
            <Text strong style={{ flexGrow: 1 }}>Patient_Intake_Form.pdf</Text>
            <Tag style={{ background: '#FFEBEE', color: '#C62828', fontSize: '0.7rem', border: 'none' }}>Original (patient voice)</Tag>
            <Button type="text" size="small" onClick={() => setPdfOpen(false)} icon={<CloseOutlined />} />
          </div>
        }
        styles={{ body: { background: '#EEEEEE', padding: 16 } }}
      >
        <PdfViewer />
      </Modal>
    </div>
  );
}
