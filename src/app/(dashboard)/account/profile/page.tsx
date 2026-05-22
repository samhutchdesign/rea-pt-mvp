'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TopBar from '@/components/layout/TopBar';
import { mockPhysio } from '@/lib/mock-data';

export default function ProfilePage() {
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Your Profile' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 600 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>Your Profile</Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 700, fontSize: 22 }}>
                {mockPhysio.avatarInitials}
              </Avatar>
              <Button variant="outlined" size="small">Change Photo</Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="First Name" size="small" fullWidth defaultValue={mockPhysio.firstName} />
                <TextField label="Last Name" size="small" fullWidth defaultValue={mockPhysio.lastName} />
              </Box>
              <TextField label="Email" size="small" fullWidth defaultValue={mockPhysio.email} />
              <TextField label="Clinic Name" size="small" fullWidth defaultValue={mockPhysio.clinicName} />
              <TextField label="Credentials" size="small" fullWidth defaultValue={mockPhysio.credentials} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" disableElevation>Save Changes</Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
