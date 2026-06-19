import Sidebar from '@/components/layout/Sidebar';
import DemoRoleBar from '@/components/layout/DemoRoleBar';
import Box from '@mui/material/Box';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoRoleBar />
      <Box sx={{ display: 'flex', minHeight: '100vh', pt: '40px' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            ml: '80px',
            flexGrow: 1,
            minHeight: '100vh',
            pt: '56px',
            bgcolor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
}
