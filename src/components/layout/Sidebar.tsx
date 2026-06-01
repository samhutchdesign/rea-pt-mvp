'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import { usePermissions } from '@/lib/permissionsHook';

const baseNavItems = [
  { label: 'Home', href: '/', icon: HomeRoundedIcon },
  { label: 'Patients', href: '/patients', icon: PeopleAltRoundedIcon },
  { label: 'Exercises', href: '/exercises', icon: FitnessCenterRoundedIcon },
  { label: 'Programs', href: '/programs', icon: ListAltRoundedIcon },
];

const ownerNavItems = [
  { label: 'Home', href: '/', icon: HomeRoundedIcon },
  { label: 'Patients', href: '/patients', icon: PeopleAltRoundedIcon },
  { label: 'Employees', href: '/employees', icon: GroupsRoundedIcon },
  { label: 'Exercises', href: '/exercises', icon: FitnessCenterRoundedIcon },
  { label: 'Programs', href: '/programs', icon: ListAltRoundedIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const can = usePermissions();
  const navItems = can.canManageStaff ? ownerNavItems : baseNavItems;

  return (
    <Box
      component="nav"
      sx={{
        width: 80,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 2,
        pb: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Box sx={{ mb: 3, mt: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '-0.5px',
          }}
        >
          R
        </Box>
      </Box>

      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Tooltip key={href} title={label} placement="right">
            <Link href={href} style={{ textDecoration: 'none', width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 1,
                  px: 0.5,
                  mx: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  mb: 0.5,
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  '&:hover': { bgcolor: isActive ? 'primary.light' : 'action.hover' },
                  transition: 'background-color 0.15s',
                }}
              >
                <Icon sx={{ fontSize: 22, color: isActive ? 'primary.main' : 'text.secondary' }} />
                <Box
                  component="span"
                  sx={{
                    fontSize: 10,
                    mt: 0.4,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive ? 600 : 400,
                    lineHeight: 1,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </Box>
              </Box>
            </Link>
          </Tooltip>
        );
      })}
    </Box>
  );
}
