'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TopBar from '@/components/layout/TopBar';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { mockPrograms, mockExercises } from '@/lib/mock-data';

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const prog = mockPrograms.find((p) => p.id === id);
  const [isFavorite, setIsFavorite] = useState(prog?.isFavorite ?? false);

  if (!prog) return <Box sx={{ p: 4 }}><Typography>Program not found.</Typography></Box>;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs', href: '/programs' }, { label: prog.name }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 700 }}>
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
            <Button variant="outlined" startIcon={<PersonAddOutlinedIcon />}>Assign to Patient</Button>
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
                  <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
    </>
  );
}
