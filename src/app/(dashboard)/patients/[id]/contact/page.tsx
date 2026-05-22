'use client';
import { use } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import { mockPatients } from '@/lib/mock-data';

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>{label}</Typography>
      <TextField
        value={value || ''}
        size="small"
        fullWidth
        InputProps={{ readOnly: true, sx: { bgcolor: '#FAFAFA' } }}
      />
    </Box>
  );
}

export default function PatientContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);

  if (!patient) return null;
  const { emergencyContact: ec } = patient;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={2.5}>Contact Information</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ReadField label="First Name" value={patient.firstName} />
              <ReadField label="Last Name" value={patient.lastName} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ReadField label="Phone Number" value={patient.phone} />
              <ReadField label="Email Address" value={patient.email} />
            </Box>
            <ReadField label="Home Address" value={patient.address} />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={2.5}>Emergency Contact</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ReadField label="First Name" value={ec?.firstName} />
              <ReadField label="Last Name" value={ec?.lastName} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ReadField label="Phone Number" value={ec?.phone} />
              <ReadField label="Email Address" value={ec?.email} />
            </Box>
            <ReadField label="Home Address" value={ec?.address} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
