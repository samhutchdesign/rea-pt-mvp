'use client';
import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#D0BCFF' : '#6750A4',
        light: isDark ? 'rgba(208,188,255,0.12)' : '#EADDFF',
        contrastText: isDark ? '#1C1B1F' : '#FFFFFF',
      },
      ...(isDark ? {} : {
        background: { default: '#FFFFFF', paper: '#FFFFFF' },
        text: { primary: '#1C1B1F', secondary: '#49454F' },
        divider: '#E0E0E0',
      }),
      warning: { main: '#FB8C00' },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            ...(isDark ? { borderColor: 'rgba(255,255,255,0.15)' } : {}),
          },
        },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: isDark ? '1px solid #3D3D3D' : '1px solid #E0E0E0',
            boxShadow: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: isDark ? {
            backgroundColor: 'rgba(255,255,255,0.05)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
          } : {},
        },
      },
    },
  });
}
