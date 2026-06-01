'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { mockPatients, mockDocuments } from '@/lib/mock-data';

type UploadPhase = 'idle' | 'uploading' | 'processing' | 'done';

const FAKE_FILENAME = 'Patient_Intake_Margaret_Chen.pdf';

export default function PatientDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const [expanded, setExpanded] = useState<string | false>('doc1');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');

  if (!patient) return null;

  const submittedDocs = patient.documents.map((pd) => {
    const template = mockDocuments.find((d) => d.id === pd.documentId);
    return { ...pd, template };
  }).filter((d) => d.template);

  const openUpload = () => {
    setUploadPhase('idle');
    setUploadOpen(true);
  };

  const handleBrowseClick = () => {
    setUploadPhase('uploading');
    setTimeout(() => {
      setUploadPhase('processing');
      setTimeout(() => setUploadPhase('done'), 2000);
    }, 1500);
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>Documents</Typography>
        <Button
          variant="contained"
          startIcon={<UploadFileRoundedIcon />}
          onClick={openUpload}
          disableElevation
        >
          Upload Patient PDF
        </Button>
      </Box>

      {submittedDocs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No documents submitted yet.</Typography>
      ) : (
        submittedDocs.map(({ documentId, submittedAt, fieldValues, template }) => (
          <Accordion
            key={documentId}
            expanded={expanded === documentId}
            onChange={(_, isExpanded) => setExpanded(isExpanded ? documentId : false)}
            disableGutters
            sx={{ border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' }, boxShadow: 'none' }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>{template!.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated {new Date(submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {template!.fields.map((field) => {
                  const value = fieldValues[field.id];
                  if (!value) return null;
                  return (
                    <Box key={field.id}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.3}>{field.label}</Typography>
                      <Box sx={{ border: '1px solid #E0E0E0', borderRadius: 1, px: 1.5, py: 1, bgcolor: '#FAFAFA' }}>
                        <Typography variant="body2">{value}</Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}

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
                sx={{
                  border: '2px dashed #E0E0E0', borderRadius: 2, p: 5,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
                  cursor: 'pointer', transition: 'border-color 0.15s',
                  '&:hover': { borderColor: 'primary.main', bgcolor: '#FAFAFA' },
                }}
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
                {uploadPhase === 'uploading'
                  ? <UploadFileRoundedIcon sx={{ color: 'primary.main' }} />
                  : <AutoAwesomeRoundedIcon sx={{ color: '#F57C00' }} />}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={500} mb={0.25}>
                    {uploadPhase === 'uploading' ? `Uploading ${FAKE_FILENAME}…` : 'AI is reading your document…'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {uploadPhase === 'uploading' ? 'Uploading file' : 'Extracting patient information'}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant={uploadPhase === 'processing' ? 'indeterminate' : 'determinate'}
                value={60}
                sx={{ borderRadius: 1 }}
              />
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
                  <Box component="li" key={f}>
                    <Typography variant="body2" color="text.secondary">{f}</Typography>
                  </Box>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
                Review and edit the extracted information before confirming.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeUpload} disabled={uploadPhase === 'processing'}>
            {uploadPhase === 'done' ? 'Close' : 'Cancel'}
          </Button>
          {uploadPhase === 'done' && (
            <Button variant="contained" disableElevation onClick={handleReview}>
              Review Extracted Information
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
