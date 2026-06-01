'use client';
import { useState, useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import TopBar from '@/components/layout/TopBar';
import { mockPatients, mockPhysio } from '@/lib/mock-data';
import { clearUploadedData } from '@/lib/uploadStore';

const patientTabs = [
  { label: 'Overview', path: 'overview' },
  { label: 'Details', path: 'details' },
  { label: 'Program', path: 'program' },
  { label: 'Chart', path: 'chart' },
  { label: 'Documents', path: 'documents' },
  { label: 'Contact', path: 'contact' },
];

function conditionLabel(mechanism: string | undefined): string | null {
  if (!mechanism) return null;
  return mechanism.length > 32 ? mechanism.slice(0, 32).replace(/\s\S*$/, '') + '…' : mechanism;
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const patient = mockPatients.find((p) => p.id === id);

  const [archived, setArchived] = useState(patient?.archived ?? false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: patient?.firstName ?? '',
    lastName: patient?.lastName ?? '',
    email: patient?.email ?? '',
    location: patient?.location ?? '',
  });
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'warning'>('success');

  const isOwner = mockPhysio.role === 'owner';
  const activeTab = patientTabs.findIndex((t) => pathname.includes(`/${t.path}`));
  const currentTab = patientTabs[activeTab] ?? patientTabs[0];

  useEffect(() => {
    return () => { clearUploadedData(id); };
  }, [id]);

  if (!patient) {
    return (
      <Box sx={{ pt: '56px', px: 4, py: 4 }}>
        <Typography>Patient not found.</Typography>
      </Box>
    );
  }

  const chip = conditionLabel(patient.injuryHistory?.mechanism);

  const handleArchive = () => {
    setArchived(true);
    setEditOpen(false);
    setConfirmArchiveOpen(false);
    setSnackMsg(`${patient.firstName} ${patient.lastName} has been archived.`);
    setSnackSeverity('warning');
    setSnackOpen(true);
  };

  const handleRestore = () => {
    setArchived(false);
    setSnackMsg(`${patient.firstName} ${patient.lastName} restored to active.`);
    setSnackSeverity('success');
    setSnackOpen(true);
  };

  const handleSaveProfile = () => {
    setEditOpen(false);
    setSnackMsg('Profile updated successfully.');
    setSnackSeverity('success');
    setSnackOpen(true);
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'All Patients', href: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${id}/overview` },
          { label: currentTab.label },
        ]}
      />
      <Box sx={{ pt: '56px' }}>
        {archived && (
          <Alert severity="warning" sx={{ borderRadius: 0, px: 4 }}>
            This patient profile is archived. Restore it to resume active management.
          </Alert>
        )}

        <Box sx={{ px: 4, pt: 4, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 700, fontSize: 22, opacity: archived ? 0.6 : 1, mt: 0.5 }}>
              {patient.avatarInitials}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={700}>{patient.firstName} {patient.lastName}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{patient.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{patient.location}</Typography>
                </Box>
              </Box>
              {chip && (
                <Chip
                  label={chip}
                  size="small"
                  sx={{ mt: 1, bgcolor: '#EDE7F6', color: '#5B3FA6', fontSize: '0.72rem', height: 22, fontWeight: 500 }}
                />
              )}
            </Box>

            {isOwner && (
              archived ? (
                <Button
                  variant="outlined"
                  startIcon={<UnarchiveOutlinedIcon />}
                  size="small"
                  onClick={handleRestore}
                  color="warning"
                >
                  Restore Patient
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<EditOutlinedIcon />}
                  size="small"
                  onClick={() => {
                    setEditForm({ firstName: patient.firstName, lastName: patient.lastName, email: patient.email, location: patient.location });
                    setEditOpen(true);
                  }}
                >
                  Edit Profile
                </Button>
              )
            )}
          </Box>

          <Tabs
            value={activeTab === -1 ? 0 : activeTab}
            sx={{ borderBottom: '1px solid #E0E0E0' }}
            TabIndicatorProps={{ style: { backgroundColor: '#6750A4', height: 2 } }}
          >
            {patientTabs.map((tab, i) => (
              <Tab
                key={tab.path}
                label={tab.label}
                component={Link}
                href={`/patients/${id}/${tab.path}`}
                sx={{
                  color: (activeTab === -1 ? 0 : activeTab) === i ? 'primary.main' : 'text.secondary',
                  minHeight: 48,
                  fontWeight: (activeTab === -1 ? 0 : activeTab) === i ? 600 : 400,
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ px: 4, py: 4 }}>
          {children}
        </Box>
      </Box>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Profile</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label="First Name"
              size="small"
              fullWidth
              value={editForm.firstName}
              onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
            />
            <TextField
              label="Last Name"
              size="small"
              fullWidth
              value={editForm.lastName}
              onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </Box>
          <TextField
            label="Email"
            size="small"
            fullWidth
            value={editForm.email}
            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
          />
          <TextField
            label="Location"
            size="small"
            fullWidth
            value={editForm.location}
            onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
          />

          <Divider sx={{ my: 1 }} />

          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={1} sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
              Danger Zone
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<ArchiveOutlinedIcon />}
              onClick={() => setConfirmArchiveOpen(true)}
            >
              Archive Patient
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive Confirmation */}
      <Dialog open={confirmArchiveOpen} onClose={() => setConfirmArchiveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Archive Patient?</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>{patient.firstName} {patient.lastName}</strong> will be moved to the Archived tab and removed from your active patient list. You can restore them at any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmArchiveOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" disableElevation onClick={handleArchive}>
            Archive Patient
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
