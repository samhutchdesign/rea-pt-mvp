'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRole } from '@/lib/roleStore';
import { setRole } from '@/lib/roleStore';
import type { UserRole } from '@/lib/types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

export default function DemoRoleBar() {
  const current = useRole();

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 56,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3,
        py: 0.75,
        bgcolor: '#1C1B1F',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, mr: 0.5, whiteSpace: 'nowrap' }}>
        Viewing as:
      </Typography>
      {ROLES.map(({ value, label }) => {
        const active = current === value;
        return (
          <Box
            key={value}
            component="button"
            onClick={() => setRole(value)}
            sx={{
              cursor: 'pointer',
              border: active ? '1px solid #D0BCFF' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: '999px',
              px: 1.5,
              py: 0.25,
              bgcolor: active ? '#4A3780' : 'transparent',
              color: active ? '#D0BCFF' : 'rgba(255,255,255,0.55)',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              fontFamily: 'inherit',
              lineHeight: '20px',
              transition: 'all 0.15s',
              '&:hover': { borderColor: '#D0BCFF', color: '#D0BCFF' },
            }}
          >
            {label}
          </Box>
        );
      })}
    </Box>
  );
}
