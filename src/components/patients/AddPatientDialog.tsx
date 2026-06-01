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
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { mockClinicLocations } from '@/lib/mock-data';
import { useRole } from '@/lib/roleStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddPatientDialog({ open, onClose }: Props) {
  const router = useRouter();
  const role = useRole();
  const isOwner = role === 'owner';

  const [activeStep, setActiveStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [locationId, setLocationId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = isOwner ? ['Patient Info', 'Select Location'] : [];

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!locationId) e.location = 'Please select a location';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1 && !validateStep1()) return;
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleCreate = () => {
    if (!validateStep0()) return;
    onClose();
    router.push('/patients/pat4/overview?welcome=1');
    reset();
  };

  const handleConfirm = () => {
    if (!validateStep1()) return;
    onClose();
    router.push('/patients/pat4/overview?welcome=1');
    reset();
  };

  const reset = () => {
    setActiveStep(0);
    setErrors({});
    setFirstName(''); setLastName(''); setEmail(''); setLocationId('');
  };

  const handleClose = () => { onClose(); reset(); };

  const isLastStep = isOwner ? activeStep === steps.length - 1 : true;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>Add New Patient</Typography>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {isOwner && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

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

        {isOwner && activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Which clinic location will {firstName} be seen at?
            </Typography>
            <TextField
              select
              label="Location"
              fullWidth
              size="small"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              error={!!errors.location}
              helperText={errors.location}
            >
              {mockClinicLocations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{loc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{loc.city}, {loc.regionCountry}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Box sx={{ flexGrow: 1 }} />
        {isOwner && activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        {isOwner ? (
          isLastStep
            ? <Button variant="contained" onClick={handleConfirm} disableElevation>Create Patient</Button>
            : <Button variant="contained" onClick={handleNext} disableElevation>Next</Button>
        ) : (
          <Button variant="contained" onClick={handleCreate} disableElevation>Create Patient</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
