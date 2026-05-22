'use client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TopBar from '@/components/layout/TopBar';

export default function PasswordResetPage() {
  const router = useRouter();
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Password Reset' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 500 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>Reset Password</Typography>
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Current Password" size="small" fullWidth type="password" />
            <TextField label="New Password" size="small" fullWidth type="password" />
            <TextField label="Confirm New Password" size="small" fullWidth type="password" />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => router.back()}>Cancel</Button>
              <Button variant="contained" disableElevation>Save</Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
