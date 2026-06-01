'use client';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TopBar from '@/components/layout/TopBar';
import { mockPhysio } from '@/lib/mock-data';

export default function EmailChangePage() {
  const router = useRouter();
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Email Change' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 500 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>Change Email</Typography>
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Current Email" size="small" fullWidth defaultValue={mockPhysio.email} InputProps={{ readOnly: true, sx: { bgcolor: 'action.hover' } }} />
            <TextField label="New Email" size="small" fullWidth type="email" />
            <TextField label="Confirm New Email" size="small" fullWidth type="email" />
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
