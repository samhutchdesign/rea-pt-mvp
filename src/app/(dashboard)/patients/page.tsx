'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import TopBar from '@/components/layout/TopBar';
import AddPatientDialog from '@/components/patients/AddPatientDialog';
import { mockPatients } from '@/lib/mock-data';

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#E8F5E9', color: '#2E7D32' },
  new: { bg: '#E3F2FD', color: '#0277BD' },
  inactive: { bg: '#F5F5F5', color: '#757575' },
};

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const filtered = mockPatients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Patients' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Patients</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} disableElevation>
            Add New Patient
          </Button>
        </Box>

        <TextField
          placeholder="Search patients…"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3, width: 340 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} /></InputAdornment>,
          }}
        />

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonOutlineIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 1 }} />
            <Typography color="text.secondary">No patients found</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map((patient) => (
              <Card
                key={patient.id}
                sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s' }}
                onClick={() => router.push(`/patients/${patient.id}/overview`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2.5 }}>
                  <Avatar sx={{ bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 600, width: 44, height: 44 }}>
                    {patient.avatarInitials}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight={600}>{patient.firstName} {patient.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary">{patient.email}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">{patient.location}</Typography>
                  <Chip
                    label={patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    size="small"
                    sx={{ ...statusColors[patient.status], fontWeight: 500, fontSize: 12 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
                    Modified {new Date(patient.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      <AddPatientDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
