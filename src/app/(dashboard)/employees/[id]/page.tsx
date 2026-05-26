'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import TopBar from '@/components/layout/TopBar';
import { mockEmployees, mockPatients, mockPhysio } from '@/lib/mock-data';
import type { Patient, Employee } from '@/lib/types';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

function TransferDialog({
  open,
  patient,
  currentEmployee,
  onClose,
  onTransfer,
}: {
  open: boolean;
  patient: Patient | null;
  currentEmployee: Employee;
  onClose: () => void;
  onTransfer: (toEmployee: Employee) => void;
}) {
  const [selected, setSelected] = useState<Employee | null>(null);
  const otherEmployees = mockEmployees.filter((e) => e.id !== currentEmployee.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Transfer Patient</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Transfer <strong>{patient?.firstName} {patient?.lastName}</strong> to another physiotherapist.
        </Typography>
        <Autocomplete
          options={otherEmployees}
          getOptionLabel={(e) => `${e.firstName} ${e.lastName} — ${e.credentials}`}
          renderOption={(props, e) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body2" fontWeight={500}>{e.firstName} {e.lastName}</Typography>
                <Typography variant="caption" color="text.secondary">{e.title} · {e.credentials}</Typography>
              </Box>
            </Box>
          )}
          value={selected}
          onChange={(_, val) => setSelected(val)}
          renderInput={(params) => <TextField {...params} label="Select physiotherapist" size="small" autoFocus />}
          size="small"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disableElevation disabled={!selected} onClick={() => { if (selected) onTransfer(selected); }}>
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const emp = mockEmployees.find((e) => e.id === id);
  const [tab, setTab] = useState(0);
  const [transferPatient, setTransferPatient] = useState<Patient | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  if (!emp) return <Box sx={{ p: 4 }}><Typography>Employee not found.</Typography></Box>;

  const assignedPatients = mockPatients.filter((p) => emp.patientIds.includes(p.id));
  const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';
  const isOwner = mockPhysio.role === 'owner';

  const handleTransfer = (toEmployee: Employee) => {
    setTransferPatient(null);
    setSnackMsg(`${transferPatient?.firstName} ${transferPatient?.lastName} transferred to ${toEmployee.firstName} ${toEmployee.lastName}`);
    setSnackOpen(true);
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Employees', href: '/employees' }, { label: `${emp.firstName} ${emp.lastName}` }]} />
      <Box sx={{ px: 4, py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: bgColor + '18', color: bgColor, fontWeight: 700, fontSize: 24, flexShrink: 0 }}>
            {emp.avatarInitials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700}>{emp.firstName} {emp.lastName}</Typography>
              <Chip label={emp.credentials} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 600 }} />
            </Box>
            <Typography variant="body1" color="text.secondary" mb={1}>{emp.title}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{emp.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{emp.phone}</Typography>
              </Box>
            </Box>
          </Box>
          {isOwner && (
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} size="small">Edit Profile</Button>
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid #E0E0E0', mb: 3 }}
          TabIndicatorProps={{ style: { backgroundColor: '#6750A4', height: 2 } }}
        >
          <Tab label="Overview" sx={{ textTransform: 'none', minHeight: 48 }} />
          <Tab label={`Patients (${assignedPatients.length})`} sx={{ textTransform: 'none', minHeight: 48 }} />
          <Tab label="Details" sx={{ textTransform: 'none', minHeight: 48 }} />
        </Tabs>

        {/* Overview Tab */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Stats */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Card sx={{ flex: 1 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#6750A418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PersonOutlinedIcon sx={{ color: '#6750A4', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={700} lineHeight={1}>{assignedPatients.length}</Typography>
                      <Typography variant="caption" color="text.secondary">Active Patients</Typography>
                    </Box>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#0288D118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarTodayRoundedIcon sx={{ color: '#0288D1', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={700} lineHeight={1}>
                        {new Date(emp.joinedAt).getFullYear()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Joined</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Bio */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} mb={1.5}>About</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{emp.bio}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Specialties */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Specialties</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {emp.specialties.map((s) => (
                      <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: 12 }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Recent Patients */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Assigned Patients</Typography>
                  {assignedPatients.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No patients assigned.</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {assignedPatients.map((p) => (
                        <Box
                          key={p.id}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', p: 1, borderRadius: 1, '&:hover': { bgcolor: '#F5F5F5' } }}
                          onClick={() => router.push(`/patients/${p.id}/overview`)}
                        >
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#E8E0F0', color: 'primary.main', fontSize: 12, fontWeight: 600 }}>{p.avatarInitials}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{p.firstName} {p.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{p.status}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Patients Tab */}
        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {assignedPatients.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">No patients assigned to {emp.firstName} yet.</Typography>
              </Box>
            ) : (
              assignedPatients.map((p) => (
                <Card key={p.id} sx={{ '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2 }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                      {p.avatarInitials}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => router.push(`/patients/${p.id}/overview`)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                        <Typography variant="body1" fontWeight={600}>{p.firstName} {p.lastName}</Typography>
                        <Chip
                          label={p.status}
                          size="small"
                          sx={{
                            height: 20, fontSize: 11,
                            bgcolor: p.status === 'active' ? '#E8F5E9' : p.status === 'new' ? '#E3F2FD' : '#F5F5F5',
                            color: p.status === 'active' ? '#2E7D32' : p.status === 'new' ? '#0277BD' : '#757575',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{p.email}</Typography>
                    </Box>
                    {isOwner && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SwapHorizRoundedIcon />}
                        onClick={() => setTransferPatient(p)}
                        sx={{ flexShrink: 0 }}
                      >
                        Transfer
                      </Button>
                    )}
                  </Box>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* Details Tab */}
        {tab === 2 && (
          <Box sx={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>Contact Information</Typography>
                  {isOwner && <IconButton size="small"><EditOutlinedIcon fontSize="small" /></IconButton>}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField label="First Name" size="small" fullWidth value={emp.firstName} InputProps={{ readOnly: true }} />
                  <TextField label="Last Name" size="small" fullWidth value={emp.lastName} InputProps={{ readOnly: true }} />
                  <TextField label="Email" size="small" fullWidth value={emp.email} InputProps={{ readOnly: true }} />
                  <TextField label="Phone" size="small" fullWidth value={emp.phone} InputProps={{ readOnly: true }} />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Professional Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField label="Title" size="small" fullWidth value={emp.title} InputProps={{ readOnly: true }} />
                  <TextField label="Credentials" size="small" fullWidth value={emp.credentials} InputProps={{ readOnly: true }} />
                  <TextField label="Date Joined" size="small" fullWidth
                    value={new Date(emp.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    InputProps={{ readOnly: true }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      <TransferDialog
        open={!!transferPatient}
        patient={transferPatient}
        currentEmployee={emp}
        onClose={() => setTransferPatient(null)}
        onTransfer={handleTransfer}
      />

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </>
  );
}
