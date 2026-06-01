'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TopBar from '@/components/layout/TopBar';
import { mockClinicLocations, mockClinic, mockEmployees, mockPatients } from '@/lib/mock-data';
import { usePermissions } from '@/lib/permissionsHook';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

export default function ClinicLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const can = usePermissions();

  const location = mockClinicLocations.find((l) => l.id === id);

  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const [form, setForm] = useState({
    name: location?.name ?? '',
    city: location?.city ?? '',
    regionCountry: location?.regionCountry ?? '',
    address: location?.address ?? '',
    phone: location?.phone ?? '',
    email: location?.email ?? '',
    description: location?.description ?? '',
  });
  const [saved, setSaved] = useState({ ...form });

  if (!location) return null;

  const teamMembers = mockEmployees.filter((e) => location.employeeIds.includes(e.id) && !e.archived);

  const handleSave = () => {
    setSaved({ ...form });
    setEditing(false);
    setSnackMsg('Clinic profile updated.');
    setSnackOpen(true);
  };

  const handleCancel = () => {
    setForm({ ...saved });
    setEditing(false);
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    router.push('/clinic');
  };

  const readOnly = !editing;

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'Organization Profile', href: '/clinic' },
          { label: saved.name },
        ]}
      />
      <Box sx={{ px: 4, py: 4, maxWidth: 900 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', color: '#fff', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
            {mockClinic.logoInitials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
              {mockClinic.name}
            </Typography>
            <Typography variant="h5" fontWeight={700} mt={0.25} mb={0.5}>{saved.name}</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{saved.city}, {saved.regionCountry}</Typography>
              </Box>
              {teamMembers.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GroupsRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{teamMembers.length} physiotherapist{teamMembers.length !== 1 ? 's' : ''}</Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/clinic')}
            >
              Organization
            </Button>
            {can.canManageClinic && !editing && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setEditing(true)}
              >
                Edit Clinic
              </Button>
            )}
            {editing && (
              <>
                <Button size="small" onClick={handleCancel}>Cancel</Button>
                <Button size="small" variant="contained" disableElevation onClick={handleSave}>Save Changes</Button>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left: About + Contact + Danger Zone */}
          <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>About This Location</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Clinic Name" size="small" fullWidth
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      InputProps={{ readOnly }}
                      sx={readOnly ? { '& .MuiInputBase-root': { bgcolor: '#FAFAFA' } } : {}}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="City" size="small" fullWidth
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      InputProps={{ readOnly }}
                      sx={readOnly ? { '& .MuiInputBase-root': { bgcolor: '#FAFAFA' } } : {}}
                    />
                    <TextField
                      label="Region / Country" size="small" fullWidth
                      value={form.regionCountry}
                      onChange={(e) => setForm((f) => ({ ...f, regionCountry: e.target.value }))}
                      InputProps={{ readOnly }}
                      sx={readOnly ? { '& .MuiInputBase-root': { bgcolor: '#FAFAFA' } } : {}}
                    />
                  </Box>
                  <TextField
                    label="Description" size="small" fullWidth multiline rows={4}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    InputProps={{ readOnly }}
                    sx={readOnly ? { '& .MuiInputBase-root': { bgcolor: '#FAFAFA' } } : {}}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Contact</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Address" size="small" fullWidth
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    InputProps={{ readOnly }}
                    sx={readOnly ? { '& .MuiInputBase-root': { bgcolor: '#FAFAFA' } } : {}}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Phone" size="small" fullWidth
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      InputProps={{ readOnly }}
                      sx={readOnly ? { '& .MuiInputBase-root': { bgcolor: '#FAFAFA' } } : {}}
                    />
                    <TextField
                      label="Email" size="small" fullWidth
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      InputProps={{ readOnly }}
                      sx={readOnly ? { '& .MuiInputBase-root': { bgcolor: '#FAFAFA' } } : {}}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {can.canManageClinic && (
              <Card sx={{ border: '1px solid #FFCDD2' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1} sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                    Danger Zone
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>Delete this clinic location</Typography>
                      <Typography variant="caption" color="text.secondary">This will remove the location from the organization permanently.</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete Location
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Right: Team */}
          <Box sx={{ flex: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>
                  Team {teamMembers.length > 0 ? `(${teamMembers.length})` : ''}
                </Typography>
                {teamMembers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No staff assigned to this location yet.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {teamMembers.map((emp, i) => {
                      const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';
                      const patientCount = mockPatients.filter((p) => emp.patientIds.includes(p.id)).length;
                      return (
                        <Box key={emp.id}>
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, cursor: 'pointer', borderRadius: 1, px: 0.5, '&:hover': { bgcolor: '#F5F5F5' } }}
                            onClick={() => router.push(`/employees/${emp.id}`)}
                          >
                            <Avatar sx={{ width: 40, height: 40, bgcolor: bgColor + '18', color: bgColor, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                              {emp.avatarInitials}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>{emp.firstName} {emp.lastName}</Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>{emp.credentials} · {emp.title}</Typography>
                            </Box>
                            <Chip label={`${patientCount}p`} size="small" sx={{ bgcolor: '#F0EDF6', color: 'primary.main', fontSize: 11, height: 20, fontWeight: 600 }} />
                          </Box>
                          {i < teamMembers.length - 1 && <Divider />}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Clinic Location?</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove <strong>{saved.name}</strong> from the organization. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" disableElevation onClick={handleDelete}>
            Delete Location
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </>
  );
}
