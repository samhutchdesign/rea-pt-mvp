'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import { mockPatients, mockPrograms, mockExercises } from '@/lib/mock-data';

export default function PatientProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;

  if (!patient) return null;

  if (!program) {
    return (
      <Box>
        <Typography variant="h6" fontWeight={600} mb={1}>Program</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          No program assigned yet. Choose a recommended template or start from scratch.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mockPrograms.map((prog) => (
            <Card
              key={prog.id}
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s', p: 2.5 }}
              onClick={() => router.push(`/patients/${id}/program/edit`)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>{prog.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{prog.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
                    {prog.tags.map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)}
                  </Box>
                </Box>
                <Chip label={`${prog.exercises.length} exercises`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
              </Box>
            </Card>
          ))}
          <Button variant="outlined" onClick={() => router.push(`/patients/${id}/program/edit`)}>
            Create Program from Scratch
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>{program.name}</Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => router.push(`/patients/${id}/program/edit`)}>
            Modify
          </Button>
          <Button variant="contained" startIcon={<SendOutlinedIcon />} onClick={() => router.push(`/patients/${id}/program/send`)} disableElevation>
            Send Program to Patient
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {program.exercises.map((pe) => {
          const ex = mockExercises.find((e) => e.id === pe.exerciseId);
          if (!ex) return null;
          return (
            <Card key={pe.exerciseId}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2 }}>
                <Box sx={{ width: 80, height: 64, borderRadius: 1, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FitnessCenterRoundedIcon sx={{ color: '#6750A4', fontSize: 28 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={0.25}>{ex.name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>{ex.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                    <Chip label={`${pe.sets} Sets`} size="small" variant="outlined" />
                    <Chip label={`${pe.reps} Reps`} size="small" variant="outlined" />
                    {pe.holdSecs > 0 && <Chip label={`${pe.holdSecs} Sec Hold`} size="small" variant="outlined" />}
                    <Chip label={pe.frequency} size="small" variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pe.adherence}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: '#1C1B1F', borderRadius: 3 } }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>{pe.adherence}% Adherence</Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
