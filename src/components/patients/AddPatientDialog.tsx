'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { mockDocuments } from '@/lib/mock-data';

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps = ['Patient Info', 'Send Documents', 'Confirm'];

export default function AddPatientDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDocs, setSelectedDocs] = useState<string[]>(['doc1']);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) return;
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const toggleDoc = (id: string) =>
    setSelectedDocs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);

  const handleSend = () => {
    // In production: create patient + send documents via API
    onClose();
    router.push('/patients/pat4/overview?welcome=1');
    setActiveStep(0);
    setFirstName(''); setLastName(''); setEmail('');
    setSelectedDocs(['doc1']);
  };

  const handleClose = () => {
    onClose();
    setActiveStep(0);
    setErrors({});
    setFirstName(''); setLastName(''); setEmail('');
    setSelectedDocs(['doc1']);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>Add New Patient</Typography>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name" fullWidth required size="small"
                value={firstName} onChange={(e) => setFirstName(e.target.value)}
                error={!!errors.firstName} helperText={errors.firstName}
              />
              <TextField
                label="Last Name" fullWidth required size="small"
                value={lastName} onChange={(e) => setLastName(e.target.value)}
                error={!!errors.lastName} helperText={errors.lastName}
              />
            </Box>
            <TextField
              label="Email Address" fullWidth required size="small" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email} helperText={errors.email}
            />
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Select documents to send to {firstName}:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {mockDocuments.map((doc) => (
                <Box
                  key={doc.id}
                  sx={{ border: '1px solid', borderColor: selectedDocs.includes(doc.id) ? 'primary.main' : '#E0E0E0', borderRadius: 2, px: 2, py: 1.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                  onClick={() => toggleDoc(doc.id)}
                >
                  <FormControlLabel
                    control={<Checkbox checked={selectedDocs.includes(doc.id)} size="small" sx={{ mr: 0.5 }} />}
                    label={<Typography variant="body2" fontWeight={500}>{doc.name}</Typography>}
                    sx={{ m: 0, pointerEvents: 'none' }}
                  />
                </Box>
              ))}
            </Box>
            <Link href="/documents/new" onClick={handleClose}>
              <Typography variant="body2" color="primary" sx={{ mt: 2, display: 'inline-block', cursor: 'pointer', textDecoration: 'underline' }}>
                + Create new document
              </Typography>
            </Link>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">Review and confirm the details below.</Typography>
            <Box sx={{ bgcolor: '#F9F9FB', borderRadius: 2, p: 2.5 }}>
              <Typography variant="body2"><strong>Name:</strong> {firstName} {lastName}</Typography>
              <Typography variant="body2" mt={0.5}><strong>Email:</strong> {email}</Typography>
            </Box>
            <Box sx={{ bgcolor: '#F9F9FB', borderRadius: 2, p: 2.5 }}>
              <Typography variant="body2" fontWeight={600} mb={1}>Documents to send:</Typography>
              {selectedDocs.length === 0
                ? <Typography variant="body2" color="text.secondary">None selected</Typography>
                : mockDocuments.filter((d) => selectedDocs.includes(d.id)).map((d) => (
                    <Typography key={d.id} variant="body2">• {d.name}</Typography>
                  ))
              }
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Box sx={{ flexGrow: 1 }} />
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        {activeStep < 2
          ? <Button variant="contained" onClick={handleNext} disableElevation>Next</Button>
          : <Button variant="contained" onClick={handleSend} disableElevation>Send Forms</Button>
        }
      </DialogActions>
    </Dialog>
  );
}
