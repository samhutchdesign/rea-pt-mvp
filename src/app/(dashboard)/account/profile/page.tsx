'use client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TopBar from '@/components/layout/TopBar';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { mockPhysio, mockClinic } from '@/lib/mock-data';
import { roleLabel } from '@/lib/permissions';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';

export default function ProfilePage() {
  const router = useRouter();
  const can = usePermissions();
  const role = useRole();

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Your Profile' }]} />
      <Box sx={{ px: 4, py: 4, maxWidth: 640 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>Your Profile</Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 700, fontSize: 22 }}>
                {mockPhysio.avatarInitials}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>{mockPhysio.firstName} {mockPhysio.lastName}</Typography>
                  <Chip
                    label={roleLabel(role)}
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">{mockPhysio.title}</Typography>
              </Box>
              <Button variant="outlined" size="small">Change Photo</Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="First Name" size="small" fullWidth defaultValue={mockPhysio.firstName} />
                <TextField label="Last Name" size="small" fullWidth defaultValue={mockPhysio.lastName} />
              </Box>
              <TextField label="Title" size="small" fullWidth defaultValue={mockPhysio.title} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Email" size="small" fullWidth defaultValue={mockPhysio.email} />
                <TextField label="Phone" size="small" fullWidth defaultValue={mockPhysio.phone} />
              </Box>
              <TextField label="Credentials" size="small" fullWidth defaultValue={mockPhysio.credentials} />
              <TextField label="Bio" size="small" fullWidth multiline rows={3} defaultValue={mockPhysio.bio} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" disableElevation>Save Changes</Button>
            </Box>
          </CardContent>
        </Card>

        {can.canManageClinic && (
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} mb={2}>Organization</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', p: 1.5, border: '1px solid #E0E0E0', borderRadius: 2, '&:hover': { borderColor: 'primary.main', bgcolor: '#FAFAFA' }, transition: 'all 0.15s' }}
                onClick={() => router.push('/clinic')}
              >
                <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                  {mockClinic.logoInitials}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{mockClinic.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{mockClinic.address}</Typography>
                </Box>
                <BusinessOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
}
