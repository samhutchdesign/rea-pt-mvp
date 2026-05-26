'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import TopBar from '@/components/layout/TopBar';
import { mockEmployees, mockPatients } from '@/lib/mock-data';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

export default function EmployeesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    mockEmployees.filter((e) =>
      !search ||
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.credentials.toLowerCase().includes(search.toLowerCase()) ||
      e.title.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Employees' }]} />
      <Box sx={{ px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Employees</Typography>
          <Button variant="contained" startIcon={<AddIcon />} disableElevation>Add Employee</Button>
        </Box>

        <TextField
          placeholder="Search employees…" size="small" sx={{ width: 300, mb: 3 }}
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 18 }} /></InputAdornment> }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((emp) => {
            const patientCount = mockPatients.filter((p) => emp.patientIds.includes(p.id)).length;
            const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';
            return (
              <Card
                key={emp.id}
                sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s' }}
                onClick={() => router.push(`/employees/${emp.id}`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2 }}>
                  <Avatar sx={{ width: 52, height: 52, bgcolor: bgColor + '18', color: bgColor, fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
                    {emp.avatarInitials}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.3 }}>
                      <Typography variant="body1" fontWeight={600}>{emp.firstName} {emp.lastName}</Typography>
                      <Typography variant="body2" color="text.secondary">{emp.credentials}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={0.75}>{emp.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {emp.specialties.map((s) => (
                        <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75, flexShrink: 0 }}>
                    <Chip
                      label={`${patientCount} patient${patientCount !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{ bgcolor: '#F0EDF6', color: 'primary.main', fontWeight: 500 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">{emp.email}</Typography>
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
