import Sidebar from '@/components/layout/Sidebar';
import Box from '@mui/material/Box';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          ml: '72px',
          flexGrow: 1,
          minHeight: '100vh',
          pt: '56px',
          bgcolor: '#FFFFFF',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
