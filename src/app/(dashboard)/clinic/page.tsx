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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import TopBar from '@/components/layout/TopBar';
import { mockClinic, mockEmployees, mockPatients } from '@/lib/mock-data';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

export default function ClinicPage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  const [form, setForm] = useState({
    name: mockClinic.name,
    address: mockClinic.address,
    phone: mockClinic.phone,
    email: mockClinic.email,
    website: mockClinic.website,
    description: mockClinic.description,
  });

  const handleSave = () => {
    setEditing(false);
    setSnackOpen(true);
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Clinic Profile' }]} />
      <Box sx={{ px: 4, py: 4, maxWidth: 900 }}>
        {/* Clinic Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', color: '#fff', fontWeight: 700, fontSize: 24, flexShrink: 0 }}>
            {mockClinic.logoInitials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={700} mb={0.5}>{mockClinic.name}</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Vancouver, BC</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{mockEmployees.length} physiotherapists</Typography>
              </Box>
            </Box>
          </Box>
          {!editing ? (
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditing(true)}>Edit Clinic</Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="contained" disableElevation onClick={handleSave}>Save Changes</Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left: Clinic Info */}
          <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Clinic Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Clinic Name" size="small" fullWidth value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    InputProps={{ readOnly: !editing }}
                  />
                  <TextField
                    label="Address" size="small" fullWidth value={form.address}
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
                    label="About the Clinic" size="small" fullWidth multiline rows={4} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    InputProps={{ readOnly: !editing }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Contact Summary */}
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

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>Clinic profile updated successfully!</Alert>
      </Snackbar>
    </>
  );
}
