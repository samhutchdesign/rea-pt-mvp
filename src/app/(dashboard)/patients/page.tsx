'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import RestoreIcon from '@mui/icons-material/Restore';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import TopBar from '@/components/layout/TopBar';
import AddPatientDialog from '@/components/patients/AddPatientDialog';
import { mockChartSessions } from '@/lib/mock-data';
import { useLocationScope, useYourEmpId } from '@/lib/locationScope';
import type { Patient } from '@/lib/types';

function conditionChip(patient: Patient): string | null {
  const text = patient.injuryHistory?.mechanism;
  if (!text) return null;
  return text.length > 32 ? text.slice(0, 32).replace(/\s\S*$/, '') + '…' : text;
}

function sessionInfo(patient: Patient): { lastSeen: string | null; count: number } {
  const sessions = mockChartSessions[patient.id] ?? [];
  if (!sessions.length) return { lastSeen: null, count: 0 };
  const latest = sessions.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastSeen = new Date(latest.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { lastSeen, count: sessions.length };
}

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [sort, setSort] = useState('newest');
  const [addOpen, setAddOpen] = useState(false);
  const [localPatients, setLocalPatients] = useState<Record<string, boolean>>({});
  const [snackMsg, setSnackMsg] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);

  const { patients: scopedPatients } = useLocationScope();
  const yourEmpId = useYourEmpId();

  // Apply local archived overrides
  const patients = scopedPatients.map((p) =>
    p.id in localPatients ? { ...p, archived: localPatients[p.id] } : p
  );

  const yourPatients = yourEmpId
    ? patients.filter((p) => !p.archived && p.assignedEmployeeIds.includes(yourEmpId))
    : [];
  const allActive = patients.filter((p) => !p.archived);
  const archived = patients.filter((p) => p.archived);

  const showYoursTab = yourEmpId !== null;
  const tabList = showYoursTab ? [yourPatients, allActive, archived] : [allActive, archived];

  // Reset to tab 0 when role changes and tab count changes to avoid out-of-range index
  useEffect(() => { setTab(0); }, [showYoursTab]);
  const currentList = tabList[tab] ?? allActive;

  const applySearch = (list: Patient[]) => {
    const q = search.toLowerCase();
    if (!q) return list;
    return list.filter((p) =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  };

  const applySort = (list: Patient[]) => {
    const sorted = [...list];
    if (sort === 'a-z') sorted.sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName));
    else if (sort === 'z-a') sorted.sort((a, b) => b.firstName.localeCompare(a.firstName) || b.lastName.localeCompare(a.lastName));
    else if (sort === 'location') sorted.sort((a, b) => a.location.localeCompare(b.location));
    else if (sort === 'oldest') sorted.sort((a, b) => a.id.localeCompare(b.id));
    else sorted.sort((a, b) => b.id.localeCompare(a.id));
    return sorted;
  };

  const displayed = applySort(applySearch(currentList));

  const restore = (patient: Patient) => {
    setLocalPatients((prev) => ({ ...prev, [patient.id]: false }));
    setSnackMsg(`${patient.firstName} ${patient.lastName} restored to active.`);
    setSnackOpen(true);
  };

  const searchPlaceholders = showYoursTab
    ? ['Search your patients…', 'Search all patients…', 'Search archived patients…']
    : ['Search all patients…', 'Search archived patients…'];
  const empty = displayed.length === 0;
  const emptyMessages = showYoursTab
    ? ['No patients assigned to you yet', 'No active patients found', 'No archived patients found']
    : ['No active patients found', 'No archived patients found'];

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Patients' }]} />
      <Box sx={{ px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Patients</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} disableElevation>
            Add New Patient
          </Button>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setSearch(''); }}
          sx={{ borderBottom: '1px solid #E0E0E0', mb: 3 }}
          TabIndicatorProps={{ style: { backgroundColor: '#6750A4', height: 2 } }}
        >
          {showYoursTab && <Tab label={`Your Patients (${yourPatients.length})`} sx={{ textTransform: 'none', minHeight: 44, fontSize: 14 }} />}
          <Tab label={`All (${allActive.length})`} sx={{ textTransform: 'none', minHeight: 44, fontSize: 14 }} />
          <Tab label={`Archived (${archived.length})`} sx={{ textTransform: 'none', minHeight: 44, fontSize: 14 }} />
        </Tabs>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          <TextField
            placeholder={searchPlaceholders[tab]}
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 340 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} /></InputAdornment>,
            }}
          />
          {tab !== (showYoursTab ? 2 : 1) && (
            <Select
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              sx={{ minWidth: 140, fontSize: 14 }}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="a-z">A → Z</MenuItem>
              <MenuItem value="z-a">Z → A</MenuItem>
              <MenuItem value="location">Location</MenuItem>
            </Select>
          )}
        </Box>

        {empty ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonOutlineIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 1 }} />
            <Typography color="text.secondary">{emptyMessages[tab]}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {displayed.map((patient) => (
              <Card
                key={patient.id}
                sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s', opacity: patient.archived ? 0.75 : 1 }}
                onClick={() => router.push(`/patients/${patient.id}/overview`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, width: 44, height: 44 }}>
                    {patient.avatarInitials}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body1" fontWeight={600}>{patient.firstName} {patient.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary">{patient.email}</Typography>
                    {conditionChip(patient) && (
                      <Chip
                        label={conditionChip(patient)}
                        size="small"
                        sx={{ mt: 0.75, bgcolor: 'primary.light', color: 'primary.main', fontSize: '0.72rem', height: 22, fontWeight: 500 }}
                      />
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
                    {(() => {
                      const { lastSeen, count } = sessionInfo(patient);
                      return (
                        <>
                          {[
                            { icon: LocationOnOutlinedIcon, text: patient.location },
                            { icon: EventRoundedIcon, text: lastSeen ? `Last seen ${lastSeen}` : 'No sessions yet' },
                            { icon: RepeatRoundedIcon, text: count > 0 ? `${count} session${count !== 1 ? 's' : ''}` : '—' },
                          ].map(({ icon: Icon, text }) => (
                            <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Icon sx={{ fontSize: 12, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary">{text}</Typography>
                            </Box>
                          ))}
                        </>
                      );
                    })()}
                    {tab === (showYoursTab ? 2 : 1) && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        onClick={(e) => { e.stopPropagation(); restore(patient); }}
                        sx={{ mt: 0.5 }}
                      >
                        Restore
                      </Button>
                    )}
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <AddPatientDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </>
  );
}
