'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TopBar from '@/components/layout/TopBar';
import { mockClinic, mockClinicLocations, mockEmployees, mockPatients } from '@/lib/mock-data';
import type { ClinicLocation } from '@/lib/types';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

const INITIAL_LOCATIONS: ClinicLocation[] = mockClinicLocations;

export default function ClinicPage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('Organization profile updated successfully!');

  const [form, setForm] = useState({
    name: mockClinic.name,
    address: mockClinic.address,
    phone: mockClinic.phone,
    email: mockClinic.email,
    website: mockClinic.website,
    description: mockClinic.description,
  });

  const [locations, setLocations] = useState<ClinicLocation[]>(INITIAL_LOCATIONS);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  const handleSave = () => {
    setEditing(false);
    setSnackMsg('Organization profile updated successfully!');
    setSnackOpen(true);
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    const parts = newLocation.trim().split(',').map((s) => s.trim());
    const city = parts[0] ?? newLocation.trim();
    const regionCountry = parts.slice(1).join(', ') || '';
    setLocations((prev) => [
      ...prev,
      {
        id: `loc-${Date.now()}`,
        orgId: 'clinic1',
        name: `${city} Clinic`,
        city,
        regionCountry,
        address: '',
        phone: '',
        email: '',
        description: '',
        employeeIds: [],
      },
    ]);
    setNewLocation('');
    setAddLocationOpen(false);
    setSnackMsg('Location added.');
    setSnackOpen(true);
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Organization Profile' }]} />
      <Box sx={{ px: 4, py: 4, maxWidth: 900 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', color: '#fff', fontWeight: 700, fontSize: 24, flexShrink: 0 }}>
            {mockClinic.logoInitials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={700} mb={0.5}>{mockClinic.name}</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{locations.length} location{locations.length !== 1 ? 's' : ''}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{mockEmployees.length} physiotherapists</Typography>
              </Box>
            </Box>
          </Box>
          {!editing ? (
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditing(true)}>Edit Organization</Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="contained" disableElevation onClick={handleSave}>Save Changes</Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left column */}
          <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Organization Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Organization Name" size="small" fullWidth value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    InputProps={{ readOnly: !editing }}
                  />
                  <TextField
                    label="Primary Address" size="small" fullWidth value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    InputProps={{ readOnly: !editing }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Phone" size="small" fullWidth value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      InputProps={{ readOnly: !editing }}
                    />
                    <TextField
                      label="Email" size="small" fullWidth value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      InputProps={{ readOnly: !editing }}
                    />
                  </Box>
                  <TextField
                    label="Website" size="small" fullWidth value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    InputProps={{ readOnly: !editing }}
                  />
                  <TextField
                    label="About the Organization" size="small" fullWidth multiline rows={4} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    InputProps={{ readOnly: !editing }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>Locations</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setAddLocationOpen(true)}>
                    Add Location
                  </Button>
                </Box>
                {locations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No locations added yet.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {locations.map((loc, i) => (
                      <Box key={loc.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
                          <LocationOnOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
                          <Box
                            sx={{ flexGrow: 1, cursor: 'pointer', '&:hover': { '& .loc-name': { color: 'primary.main' } } }}
                            onClick={() => router.push(`/clinic/${loc.id}`)}
                          >
                            <Typography className="loc-name" variant="body2" fontWeight={500} sx={{ transition: 'color 0.15s' }}>
                              {loc.name}
                            </Typography>
                            {loc.regionCountry && (
                              <Typography variant="caption" color="text.secondary">{loc.city}, {loc.regionCountry}</Typography>
                            )}
                          </Box>
                          <ChevronRightIcon
                            sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }}
                            onClick={() => router.push(`/clinic/${loc.id}`)}
                          />
                        </Box>
                        {i < locations.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Contact summary */}
            {!editing && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>Contact</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      { icon: PhoneOutlinedIcon, label: mockClinic.phone },
                      { icon: EmailOutlinedIcon, label: mockClinic.email },
                      { icon: LanguageOutlinedIcon, label: mockClinic.website },
                      { icon: LocationOnOutlinedIcon, label: mockClinic.address },
                    ].map(({ icon: Icon, label }) => (
                      <Box key={label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Icon sx={{ fontSize: 17, color: 'text.secondary', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Right: Team */}
          <Box sx={{ flex: 2 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Team ({mockEmployees.length} employees)</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {mockEmployees.map((emp, i) => {
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
                        {i < mockEmployees.length - 1 && <Divider />}
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Add Location Dialog */}
      <Dialog open={addLocationOpen} onClose={() => { setAddLocationOpen(false); setNewLocation(''); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Add Location</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <TextField
            label="Location"
            placeholder="e.g. Toronto, ON, Canada"
            size="small"
            fullWidth
            autoFocus
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddLocation(); }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setAddLocationOpen(false); setNewLocation(''); }}>Cancel</Button>
          <Button variant="contained" disableElevation disabled={!newLocation.trim()} onClick={handleAddLocation}>
            Add Location
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </>
  );
}
