'use client';
import { useState } from 'react';
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
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { mockNotifications, mockPhysio } from '@/lib/mock-data';

interface TopBarProps {
  breadcrumbs: { label: string; href?: string }[];
}

export default function TopBar({ breadcrumbs }: TopBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: 80,
        width: 'calc(100% - 80px)',
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E0E0E0',
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
                {mockPhysio.role === 'owner' ? 'Clinic Owner' : 'Admin'}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem disabled sx={{ opacity: '0.7 !important', mt: -1 }}>
            <Typography variant="caption">{mockPhysio.email}</Typography>
          </MenuItem>
          <Divider />
          {mockPhysio.role === 'owner' && (
            <MenuItem onClick={() => { setAnchorEl(null); router.push('/clinic'); }}>Clinic Profile</MenuItem>
          )}
          {mockPhysio.role === 'owner' && (
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
  );
}
