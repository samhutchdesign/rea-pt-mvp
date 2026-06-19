'use client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TopBar from '@/components/layout/TopBar';
import { useState } from 'react';

const CONDITIONS = ['Incontinence', 'Prolapse', 'Pelvic Pain', 'Postpartum', 'Urgency'];
const SURGERIES = ['Post-THA', 'Post-TKA', 'C-Section', 'Post-Hysterectomy'];
const SPECIALTIES = ['Pelvic Floor', 'Orthopedic'];
const MUSCLES = ['Levator Ani', 'Coccygeus', 'Transverse Abdominis', 'Glutes', 'Diaphragm', 'Multifidus', 'Hip Abductors', 'Adductors', 'Hip Flexors', 'Quadriceps'];
const BODY_PARTS = ['Pelvis', 'Core', 'Hip', 'Spine', 'Knee'];
const FREQUENCIES = ['Daily', '2x Daily', 'Every Other Day', '3x Weekly'];

export default function NewExercisePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [hold, setHold] = useState(0);
  const [frequency, setFrequency] = useState('Daily');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Pelvic Floor']);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedSurgeries, setSelectedSurgeries] = useState<string[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises', href: '/exercises' }, { label: 'New Exercise' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 700 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>New Exercise</Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>Basic Info</Typography>
            <TextField label="Exercise Name" fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Description" fullWidth size="small" multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            <TextField label="Instructions (one step per line)" fullWidth size="small" multiline rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
            <TextField label="Common Mistakes (one per line)" fullWidth size="small" multiline rows={3} value={mistakes} onChange={(e) => setMistakes(e.target.value)} />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>Defaults</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {[{ label: 'Sets', value: sets, set: setSets }, { label: 'Reps', value: reps, set: setReps }, { label: 'Hold (sec)', value: hold, set: setHold }].map(({ label, value, set }) => (
                <TextField key={label} label={label} type="number" size="small" value={value} onChange={(e) => set(parseInt(e.target.value) || 0)} sx={{ width: 100 }} inputProps={{ min: 0 }} />
              ))}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Frequency</InputLabel>
                <Select label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  {FREQUENCIES.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>Tags</Typography>
            {[
              { label: 'Specialty', options: SPECIALTIES, selected: selectedSpecialties, set: setSelectedSpecialties },
              { label: 'Condition', options: CONDITIONS, selected: selectedConditions, set: setSelectedConditions },
              { label: 'Surgery', options: SURGERIES, selected: selectedSurgeries, set: setSelectedSurgeries },
              { label: 'Muscle', options: MUSCLES, selected: selectedMuscles, set: setSelectedMuscles },
              { label: 'Body Part', options: BODY_PARTS, selected: selectedBodyParts, set: setSelectedBodyParts },
            ].map(({ label, options, selected, set }) => (
              <FormControl key={label} size="small" fullWidth>
                <InputLabel>{label}</InputLabel>
                <Select
                  multiple value={selected}
                  onChange={(e) => set(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label={label} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((v) => <Chip key={v} label={v} size="small" />)}
                    </Box>
                  )}
                >
                  {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            ))}
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>Media</Typography>
            <TextField
              label="YouTube URL"
              fullWidth
              size="small"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" size="small">Upload Video / Image</Button>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => router.push('/exercises')}>Cancel</Button>
          <Button variant="contained" onClick={() => router.push('/exercises')} disableElevation>Save Exercise</Button>
        </Box>
      </Box>
    </>
  );
}
