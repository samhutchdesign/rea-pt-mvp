'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Popover from '@mui/material/Popover';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { mockPatients, mockPhysio } from '@/lib/mock-data';
import { roleLabel } from '@/lib/permissions';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';
import { useYourEmpId } from '@/lib/locationScope';
import { getAllPatientNotes } from '@/lib/noteStore';

interface TopBarProps {
  breadcrumbs: { label: string; href?: string }[];
}

export default function TopBar({ breadcrumbs }: TopBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bellAnchorEl, setBellAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const can = usePermissions();
  const role = useRole();
  const yourEmpId = useYourEmpId();

  const commentNotifications = useMemo(() => {
    if (!yourEmpId) return [];
    const yourPatientIds = new Set(
      mockPatients
        .filter((p) => !p.archived && p.assignedEmployeeIds.includes(yourEmpId))
        .map((p) => p.id)
    );
    return getAllPatientNotes().filter((n) => yourPatientIds.has(n.patientId));
  }, [yourEmpId]);

  return (
    <>
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: 80,
        width: 'calc(100% - 80px)',
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: 99,
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: '#9E9E9E' }} />}
          sx={{ flexGrow: 1 }}
        >
          {breadcrumbs.map((crumb, i) =>
            crumb.href && i < breadcrumbs.length - 1 ? (
              <Link key={i} href={crumb.href}>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', textDecoration: 'underline', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                >
                  {crumb.label}
                </Typography>
              </Link>
            ) : (
              <Typography key={i} variant="body2" sx={{ color: i === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary', fontWeight: i === breadcrumbs.length - 1 ? 500 : 400 }}>
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>

        {yourEmpId && (
          <IconButton
            onClick={(e) => setBellAnchorEl(e.currentTarget)}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={commentNotifications.length} color="primary" max={99}>
              <NotificationsOutlinedIcon sx={{ fontSize: 22, color: 'text.secondary' }} />
            </Badge>
          </IconButton>
        )}

        <Avatar
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ width: 36, height: 36, bgcolor: '#E8E0F0', color: 'primary.main', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          {mockPhysio.avatarInitials}
        </Avatar>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1, minWidth: 200, border: '1px solid #E0E0E0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } }}
        >
          <MenuItem disabled sx={{ opacity: '1 !important' }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>{mockPhysio.firstName} {mockPhysio.lastName}</Typography>
              <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                {roleLabel(role)}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem disabled sx={{ opacity: '0.7 !important', mt: -1 }}>
            <Typography variant="caption">{mockPhysio.email}</Typography>
          </MenuItem>
          <Divider />
          {can.canManageClinic && (
            <MenuItem onClick={() => { setAnchorEl(null); router.push('/clinic'); }}>Organization Profile</MenuItem>
          )}
          {can.canManageLocation && (
            <MenuItem onClick={() => { setAnchorEl(null); router.push(`/clinic/${mockPhysio.locationId}`); }}>Clinic Profile</MenuItem>
          )}
          {can.canManageBilling && (
            <MenuItem onClick={() => { setAnchorEl(null); router.push('/billing'); }}>Billing</MenuItem>
          )}
          <MenuItem onClick={() => { setAnchorEl(null); router.push('/account/profile'); }}>Your Profile</MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); router.push('/account/settings'); }}>Settings</MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); router.push('/account/email'); }}>Email Change</MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); router.push('/account/password'); }}>Password Reset</MenuItem>
          <Divider />
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'text.secondary' }}>Log Out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>

    {/* Patient comment notifications popover */}
    <Popover
      open={Boolean(bellAnchorEl)}
      anchorEl={bellAnchorEl}
      onClose={() => setBellAnchorEl(null)}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{ sx: { mt: 1, width: 340, border: '1px solid #E0E0E0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } }}
    >
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #F0F0F0' }}>
        <Typography variant="body2" fontWeight={600}>Patient Comments</Typography>
      </Box>
      {commentNotifications.length === 0 ? (
        <Box sx={{ px: 2.5, py: 2.5 }}>
          <Typography variant="caption" color="text.secondary">No comments from your patients yet.</Typography>
        </Box>
      ) : (
        commentNotifications.map(({ patientId, note }, i) => {
          const patient = mockPatients.find((p) => p.id === patientId);
          return (
            <Box key={note.id}>
              <Box
                sx={{ px: 2.5, py: 1.75, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.1s' }}
                onClick={() => { setBellAnchorEl(null); router.push(`/patients/${patientId}/program`); }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, '&:hover': { bgcolor: 'action.hover' } }}>
                  <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                  <Typography variant="caption" fontWeight={600} color="primary.main">
                    {patient ? `${patient.firstName} ${patient.lastName}` : patientId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {note.createdAt}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4, pl: 2.75 }}>
                  {note.content.length > 80 ? note.content.slice(0, 80) + '…' : note.content}
                </Typography>
              </Box>
              {i < commentNotifications.length - 1 && <Divider />}
            </Box>
          );
        })
      )}
    </Popover>
    </>
  );
}
