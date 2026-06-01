'use client';
import { use, useState, useEffect } from 'react';
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
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import TopBar from '@/components/layout/TopBar';
import { mockEmployees, mockPatients } from '@/lib/mock-data';
import { usePermissions } from '@/lib/permissionsHook';
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
  const otherEmployees = mockEmployees.filter((e) => e.id !== currentEmployee.id && !e.archived);

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

function ArchiveEmployeeDialog({
  open,
  employee,
  assignedPatients,
  onClose,
  onConfirm,
}: {
  open: boolean;
  employee: Employee;
  assignedPatients: Patient[];
  onClose: () => void;
  onConfirm: (reassignments: Record<string, Employee>) => void;
}) {
  const [reassignments, setReassignments] = useState<Record<string, Employee | null>>({});
  const otherEmployees = mockEmployees.filter((e) => e.id !== employee.id && !e.archived);

  useEffect(() => {
    if (open) {
      const init: Record<string, Employee | null> = {};
      assignedPatients.forEach((p) => { init[p.id] = null; });
      setReassignments(init);
    }
  }, [open, assignedPatients]);

  const hasPatients = assignedPatients.length > 0;
  const allReassigned = assignedPatients.every((p) => reassignments[p.id] != null);
  const canConfirm = !hasPatients || allReassigned;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Archive Employee?</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        {!hasPatients ? (
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to archive <strong>{employee.firstName} {employee.lastName}</strong>? They will be moved to the Archived tab and lose clinic access. You can restore them at any time.
          </Typography>
        ) : (
          <>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <strong>{employee.firstName} {employee.lastName}</strong> currently has {assignedPatients.length} assigned patient{assignedPatients.length !== 1 ? 's' : ''}. Select a new physiotherapist for each before archiving.
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {assignedPatients.map((p) => (
                <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.main', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                    {p.avatarInitials}
                  </Avatar>
                  <Box sx={{ minWidth: 130, flexShrink: 0 }}>
                    <Typography variant="body2" fontWeight={500}>{p.firstName} {p.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.status}</Typography>
                  </Box>
                  <Autocomplete
                    options={otherEmployees}
                    getOptionLabel={(e) => `${e.firstName} ${e.lastName}`}
                    renderOption={(props, e) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{e.firstName} {e.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary">{e.credentials}</Typography>
                        </Box>
                      </Box>
                    )}
                    value={reassignments[p.id] ?? null}
                    onChange={(_, val) => setReassignments((r) => ({ ...r, [p.id]: val }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Transfer to…"
                        error={reassignments[p.id] === null && allReassigned === false}
                      />
                    )}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="warning"
          disableElevation
          disabled={!canConfirm}
          onClick={() => {
            const result: Record<string, Employee> = {};
            assignedPatients.forEach((p) => {
              if (reassignments[p.id]) result[p.id] = reassignments[p.id]!;
            });
            onConfirm(result);
          }}
        >
          Archive Employee
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
  const [archived, setArchived] = useState(emp?.archived ?? false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [transferPatient, setTransferPatient] = useState<Patient | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'warning'>('success');

  // Details tab edit state
  const [editingContact, setEditingContact] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(false);
  const [savedContact, setSavedContact] = useState({
    firstName: emp?.firstName ?? '',
    lastName: emp?.lastName ?? '',
    email: emp?.email ?? '',
    phone: emp?.phone ?? '',
  });
  const [savedProfessional, setSavedProfessional] = useState({
    title: emp?.title ?? '',
    credentials: emp?.credentials ?? '',
  });
  const [contactDraft, setContactDraft] = useState({ ...savedContact });
  const [professionalDraft, setProfessionalDraft] = useState({ ...savedProfessional });
  const can = usePermissions();

  if (!emp) return <Box sx={{ p: 4 }}><Typography>Employee not found.</Typography></Box>;

  const assignedPatients = mockPatients.filter((p) => emp.patientIds.includes(p.id));
  const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';

  const handleTransfer = (toEmployee: Employee) => {
    const name = `${transferPatient?.firstName} ${transferPatient?.lastName}`;
    setTransferPatient(null);
    setSnackMsg(`${name} transferred to ${toEmployee.firstName} ${toEmployee.lastName}`);
    setSnackSeverity('success');
    setSnackOpen(true);
  };

  const handleConfirmArchive = (reassignments: Record<string, Employee>) => {
    setArchived(true);
    setArchiveDialogOpen(false);
    const count = Object.keys(reassignments).length;
    const msg = count > 0
      ? `${emp.firstName} ${emp.lastName} archived. ${count} patient${count !== 1 ? 's' : ''} transferred.`
      : `${emp.firstName} ${emp.lastName} has been archived.`;
    setSnackMsg(msg);
    setSnackSeverity('warning');
    setSnackOpen(true);
  };

  const handleRestore = () => {
    setArchived(false);
    setSnackMsg(`${emp.firstName} ${emp.lastName} restored to active.`);
    setSnackSeverity('success');
    setSnackOpen(true);
  };

  const handleEditContact = () => {
    setContactDraft({ ...savedContact });
    setEditingContact(true);
  };

  const handleSaveContact = () => {
    setSavedContact({ ...contactDraft });
    setEditingContact(false);
    setSnackMsg('Contact information updated.');
    setSnackSeverity('success');
    setSnackOpen(true);
  };

  const handleEditProfessional = () => {
    setProfessionalDraft({ ...savedProfessional });
    setEditingProfessional(true);
  };

  const handleSaveProfessional = () => {
    setSavedProfessional({ ...professionalDraft });
    setEditingProfessional(false);
    setSnackMsg('Professional details updated.');
    setSnackSeverity('success');
    setSnackOpen(true);
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Employees', href: '/employees' }, { label: `${savedContact.firstName} ${savedContact.lastName}` }]} />
      <Box sx={{ px: 4, py: 4 }}>

        {archived && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 1 }}>
            This employee profile is archived. Restore it to re-activate their access.
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: bgColor + '18', color: bgColor, fontWeight: 700, fontSize: 24, flexShrink: 0, opacity: archived ? 0.6 : 1 }}>
            {emp.avatarInitials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700}>{savedContact.firstName} {savedContact.lastName}</Typography>
              <Chip label={savedProfessional.credentials} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 }} />
            </Box>
            <Typography variant="body1" color="text.secondary" mb={1}>{savedProfessional.title}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{savedContact.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{savedContact.phone}</Typography>
              </Box>
            </Box>
          </Box>
          {can.canManageStaff && (
            archived ? (
              <Button variant="outlined" startIcon={<UnarchiveOutlinedIcon />} size="small" onClick={handleRestore} color="warning">
                Restore Employee
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<ArchiveOutlinedIcon />}
                size="small"
                onClick={() => setArchiveDialogOpen(true)}
                sx={{ color: 'text.secondary', borderColor: '#BDBDBD', '&:hover': { borderColor: '#9E9E9E', bgcolor: 'action.hover' } }}
              >
                Archive Employee
              </Button>
            )
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

              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} mb={1.5}>About</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{emp.bio}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                          onClick={() => router.push(`/patients/${p.id}/overview`)}
                        >
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.main', fontSize: 12, fontWeight: 600 }}>{p.avatarInitials}</Avatar>
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
                    <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
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
                    {can.canManageStaff && (
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
                  {can.canManageStaff && !editingContact && (
                    <IconButton size="small" onClick={handleEditContact}><EditOutlinedIcon fontSize="small" /></IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                      label="First Name" size="small" fullWidth
                      value={editingContact ? contactDraft.firstName : savedContact.firstName}
                      onChange={(e) => setContactDraft((d) => ({ ...d, firstName: e.target.value }))}
                      InputProps={{ readOnly: !editingContact }}
                    />
                    <TextField
                      label="Last Name" size="small" fullWidth
                      value={editingContact ? contactDraft.lastName : savedContact.lastName}
                      onChange={(e) => setContactDraft((d) => ({ ...d, lastName: e.target.value }))}
                      InputProps={{ readOnly: !editingContact }}
                    />
                  </Box>
                  <TextField
                    label="Email" size="small" fullWidth
                    value={editingContact ? contactDraft.email : savedContact.email}
                    onChange={(e) => setContactDraft((d) => ({ ...d, email: e.target.value }))}
                    InputProps={{ readOnly: !editingContact }}
                  />
                  <TextField
                    label="Phone" size="small" fullWidth
                    value={editingContact ? contactDraft.phone : savedContact.phone}
                    onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))}
                    InputProps={{ readOnly: !editingContact }}
                  />
                </Box>
                {editingContact && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button size="small" onClick={() => setEditingContact(false)}>Cancel</Button>
                    <Button size="small" variant="contained" disableElevation onClick={handleSaveContact}>Save</Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>Professional Details</Typography>
                  {can.canManageStaff && !editingProfessional && (
                    <IconButton size="small" onClick={handleEditProfessional}><EditOutlinedIcon fontSize="small" /></IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField
                    label="Title" size="small" fullWidth
                    value={editingProfessional ? professionalDraft.title : savedProfessional.title}
                    onChange={(e) => setProfessionalDraft((d) => ({ ...d, title: e.target.value }))}
                    InputProps={{ readOnly: !editingProfessional }}
                  />
                  <TextField
                    label="Credentials" size="small" fullWidth
                    value={editingProfessional ? professionalDraft.credentials : savedProfessional.credentials}
                    onChange={(e) => setProfessionalDraft((d) => ({ ...d, credentials: e.target.value }))}
                    InputProps={{ readOnly: !editingProfessional }}
                  />
                  <TextField
                    label="Date Joined" size="small" fullWidth
                    value={new Date(emp.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                {editingProfessional && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button size="small" onClick={() => setEditingProfessional(false)}>Cancel</Button>
                    <Button size="small" variant="contained" disableElevation onClick={handleSaveProfessional}>Save</Button>
                  </Box>
                )}
              </CardContent>
            </Card>

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

      <ArchiveEmployeeDialog
        open={archiveDialogOpen}
        employee={emp}
        assignedPatients={assignedPatients}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
      />

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </>
  );
}
