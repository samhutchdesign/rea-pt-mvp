'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TopBar from '@/components/layout/TopBar';
import { mockClinicLocations, mockClinic, mockEmployees, mockPatients } from '@/lib/mock-data';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

export default function ClinicLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const location = mockClinicLocations.find((l) => l.id === id);
  if (!location) return null;

  const teamMembers = mockEmployees.filter((e) => location.employeeIds.includes(e.id) && !e.archived);

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'Organization Profile', href: '/clinic' },
          { label: location.name },
        ]}
      />
      <Box sx={{ px: 4, py: 4, maxWidth: 900 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', color: '#fff', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
            {mockClinic.logoInitials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
              {mockClinic.name}
            </Typography>
            <Typography variant="h5" fontWeight={700} mt={0.25} mb={0.5}>{location.name}</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{location.city}, {location.regionCountry}</Typography>
              </Box>
              {teamMembers.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GroupsRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{teamMembers.length} physiotherapist{teamMembers.length !== 1 ? 's' : ''}</Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/clinic')}
          >
            Organization
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left: About + Contact */}
          <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={1.5}>About This Location</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {location.description}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Contact</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { icon: LocationOnOutlinedIcon, label: location.address },
                    { icon: PhoneOutlinedIcon, label: location.phone },
                    { icon: EmailOutlinedIcon, label: location.email },
                  ].map(({ icon: Icon, label }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Icon sx={{ fontSize: 17, color: 'text.secondary', mt: 0.2, flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right: Team */}
          <Box sx={{ flex: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>
                  Team {teamMembers.length > 0 ? `(${teamMembers.length})` : ''}
                </Typography>
                {teamMembers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No staff assigned to this location yet.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {teamMembers.map((emp, i) => {
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
                          {i < teamMembers.length - 1 && <Divider />}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </>
  );
}
