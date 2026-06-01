'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TopBar from '@/components/layout/TopBar';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { mockPrograms, mockExercises, mockPatients } from '@/lib/mock-data';
import type { Patient } from '@/lib/types';

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const prog = mockPrograms.find((p) => p.id === id);
  const [isFavorite, setIsFavorite] = useState(prog?.isFavorite ?? false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [assignedName, setAssignedName] = useState('');

  if (!prog) return <Box sx={{ p: 4 }}><Typography>Program not found.</Typography></Box>;

  const handleAssign = () => {
    if (selectedPatient) setAssignedName(`${selectedPatient.firstName} ${selectedPatient.lastName}`);
    setAssignOpen(false);
    setSelectedPatient(null);
    setSnackOpen(true);
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs', href: '/programs' }, { label: prog.name }]} />
      <Box sx={{ px: 4, py: 4, maxWidth: 700 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700}>{prog.name}</Typography>
              <IconButton onClick={() => setIsFavorite(!isFavorite)}>
                {isFavorite ? <FavoriteIcon sx={{ color: '#E91E63' }} /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
            <Typography variant="body1" color="text.secondary" mb={1}>{prog.description}</Typography>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              {prog.tags.map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<PersonAddOutlinedIcon />} onClick={() => setAssignOpen(true)}>
              Assign to Patient
            </Button>
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => router.push('/programs/new')}>Edit</Button>
          </Box>
        </Box>

        <Typography variant="subtitle2" color="text.secondary" mb={2}>{prog.exercises.length} exercises</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {prog.exercises.map((pe) => {
            const ex = mockExercises.find((e) => e.id === pe.exerciseId);
            if (!ex) return null;
            return (
              <Card key={pe.exerciseId}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FitnessCenterRoundedIcon sx={{ color: '#6750A4', fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>{ex.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <Chip label={`${pe.sets} Sets`} size="small" variant="outlined" />
                      <Chip label={`${pe.reps} Reps`} size="small" variant="outlined" />
                      {pe.holdSecs > 0 && <Chip label={`${pe.holdSecs}s Hold`} size="small" variant="outlined" />}
                      <Chip label={pe.frequency} size="small" variant="outlined" />
                    </Box>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Assign to Patient Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Assign to Patient</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select a patient to assign <strong>{prog.name}</strong> to.
          </Typography>
          <Autocomplete
            options={mockPatients}
            getOptionLabel={(p) => `${p.firstName} ${p.lastName}`}
            renderOption={(props, p) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{p.firstName} {p.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{p.email}</Typography>
                </Box>
              </Box>
            )}
            value={selectedPatient}
            onChange={(_, val) => setSelectedPatient(val)}
            renderInput={(params) => <TextField {...params} label="Search patients" size="small" autoFocus />}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" disableElevation disabled={!selectedPatient} onClick={handleAssign}>
            Assign Program
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>
          Program assigned to {assignedName}!
        </Alert>
      </Snackbar>
    </>
  );
}
