'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import { mockPatients, mockPrograms, mockExercises } from '@/lib/mock-data';

export default function SendProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;
  const [snackOpen, setSnackOpen] = useState(false);

  const templateMessage = program
    ? `Hi ${patient?.firstName},\n\nI hope you're doing well! Please find your updated home exercise program attached below. I've put together ${program.exercises.length} exercises tailored to your current treatment plan.\n\nPlease aim to complete your exercises as prescribed. If you have any questions or experience any discomfort, don't hesitate to reach out.\n\nWarm regards,\nSarah Harper, PT, DPT, PRPC\nRea Pelvic Health`
    : '';

  const [message, setMessage] = useState(templateMessage);

  const handleSend = () => {
    setSnackOpen(true);
    setTimeout(() => router.push(`/patients/${id}/program`), 1500);
  };

  if (!patient || !program) return <Typography sx={{ p: 4 }}>No program to send.</Typography>;

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="h6" fontWeight={600} mb={0.5}>Send Program to Patient</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>{patient.firstName} {patient.lastName} · {patient.email}</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Message</Typography>
          <TextField multiline rows={8} fullWidth value={message} onChange={(e) => setMessage(e.target.value)} size="small" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} mb={2}>{program.name}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {program.exercises.map((pe) => {
              const ex = mockExercises.find((e) => e.id === pe.exerciseId);
              if (!ex) return null;
              return (
                <Box key={pe.exerciseId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FitnessCenterRoundedIcon sx={{ color: '#6750A4', fontSize: 18 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{ex.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                        <Chip label={`${pe.sets} Sets`} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />
                        <Chip label={`${pe.reps} Reps`} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />
                        {pe.holdSecs > 0 && <Chip label={`${pe.holdSecs}s Hold`} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />}
                        <Chip label={pe.frequency} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ mt: 1.5 }} />
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => router.push(`/patients/${id}/program`)}>Cancel</Button>
        <Button variant="contained" startIcon={<SendOutlinedIcon />} onClick={handleSend} disableElevation>Send to Patient</Button>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>New Program has successfully been emailed to the Patient!</Alert>
      </Snackbar>
    </Box>
  );
}
