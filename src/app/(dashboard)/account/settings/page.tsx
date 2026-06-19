'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TopBar from '@/components/layout/TopBar';
import { useThemeMode, setThemeMode } from '@/lib/themeStore';

export default function SettingsPage() {
  const mode = useThemeMode();
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Settings' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 600 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>Settings</Typography>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>Preferences</Typography>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={mode === 'dark'}
                    onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Dark mode</Typography>}
                sx={{ mb: 1 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
