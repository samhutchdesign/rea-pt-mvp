'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import TopBar from '@/components/layout/TopBar';
import { mockPatients } from '@/lib/mock-data';
import { useLocationScope } from '@/lib/locationScope';
import type { Employee } from '@/lib/types';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

export default function EmployeesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const { employees: scopedEmployees } = useLocationScope();
  const [overrides, setOverrides] = useState<Record<string, Partial<Employee>>>({});

  const employees = scopedEmployees.map((e) => overrides[e.id] ? { ...e, ...overrides[e.id] } : e);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);

  const activeEmployees = employees.filter((e) => !e.archived);
  const archivedEmployees = employees.filter((e) => e.archived);

  const applySearch = (list: Employee[]) => {
    const q = search.toLowerCase();
    return list.filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.credentials.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q)
    );
  };

  const displayed = applySearch(tab === 0 ? activeEmployees : archivedEmployees);

  const restore = (emp: Employee) => {
    setOverrides((prev) => ({ ...prev, [emp.id]: { archived: false } }));
    setSnackMsg(`${emp.firstName} ${emp.lastName} restored to active.`);
    setSnackOpen(true);
  };

  const empty = displayed.length === 0;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Employees' }]} />
      <Box sx={{ px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Employees</Typography>
          <Button variant="contained" startIcon={<AddIcon />} disableElevation>Add Employee</Button>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid #E0E0E0', mb: 3 }}
          TabIndicatorProps={{ style: { backgroundColor: '#6750A4', height: 2 } }}
        >
          <Tab label={`Active (${activeEmployees.length})`} sx={{ textTransform: 'none', minHeight: 44, fontSize: 14 }} />
          <Tab label={`Archived (${archivedEmployees.length})`} sx={{ textTransform: 'none', minHeight: 44, fontSize: 14 }} />
        </Tabs>

        <TextField
          placeholder={tab === 0 ? 'Search active employees…' : 'Search archived employees…'}
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3, width: 340 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} /></InputAdornment>,
          }}
        />

        {empty ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PeopleOutlineIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 1 }} />
            <Typography color="text.secondary">
              {tab === 0 ? 'No active employees found' : 'No archived employees found'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {displayed.map((emp) => {
              const patientCount = mockPatients.filter((p) => emp.patientIds.includes(p.id)).length;
              const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';
              return (
                <Card
                  key={emp.id}
                  sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s', opacity: emp.archived ? 0.75 : 1 }}
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
                    {tab === 1 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        onClick={(e) => { e.stopPropagation(); restore(emp); }}
                        sx={{ flexShrink: 0, ml: 1 }}
                      >
                        Restore
                      </Button>
                    )}
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </>
  );
}
