import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TopBar from '@/components/layout/TopBar';

export default function SettingsPage() {
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Settings' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 600 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>Settings</Typography>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>Email Notifications</Typography>
            {['Email notifications for new exercise comments', 'Weekly summary digest', 'Session reminders'].map((label) => (
              <Box key={label}>
                <FormControlLabel control={<Switch defaultChecked size="small" />} label={<Typography variant="body2">{label}</Typography>} sx={{ mb: 1 }} />
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} mb={2}>Preferences</Typography>
            {['Dark mode', 'Compact view'].map((label) => (
              <Box key={label}>
                <FormControlLabel control={<Switch size="small" />} label={<Typography variant="body2">{label}</Typography>} sx={{ mb: 1 }} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
