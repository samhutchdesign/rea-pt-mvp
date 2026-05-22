'use client';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import TopBar from '@/components/layout/TopBar';
import { mockPatients } from '@/lib/mock-data';

const patientTabs = [
  { label: 'Overview', path: 'overview' },
  { label: 'Details', path: 'details' },
  { label: 'Program', path: 'program' },
  { label: 'Chart', path: 'chart' },
  { label: 'Documents', path: 'documents' },
  { label: 'Contact', path: 'contact' },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const patient = mockPatients.find((p) => p.id === id);

  const activeTab = patientTabs.findIndex((t) => pathname.includes(`/${t.path}`));
  const currentTab = patientTabs[activeTab] ?? patientTabs[0];

  if (!patient) {
    return (
      <Box sx={{ pt: '56px', px: 4, py: 4 }}>
        <Typography>Patient not found.</Typography>
      </Box>
    );
  }

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'All Patients', href: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${id}/overview` },
          { label: currentTab.label },
        ]}
      />
      <Box sx={{ pt: '56px' }}>
        {/* Patient Header */}
        <Box sx={{ px: 4, pt: 4, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 700, fontSize: 22 }}>
              {patient.avatarInitials}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>{patient.firstName} {patient.lastName}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{patient.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{patient.location}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Tabs
            value={activeTab === -1 ? 0 : activeTab}
            sx={{ borderBottom: '1px solid #E0E0E0' }}
            TabIndicatorProps={{ style: { backgroundColor: '#6750A4', height: 2 } }}
          >
            {patientTabs.map((tab, i) => (
              <Tab
                key={tab.path}
                label={tab.label}
                component={Link}
                href={`/patients/${id}/${tab.path}`}
                sx={{ color: (activeTab === -1 ? 0 : activeTab) === i ? 'primary.main' : 'text.secondary', minHeight: 48, fontWeight: (activeTab === -1 ? 0 : activeTab) === i ? 600 : 400 }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ px: 4, py: 4 }}>
          {children}
        </Box>
      </Box>
    </>
  );
}
