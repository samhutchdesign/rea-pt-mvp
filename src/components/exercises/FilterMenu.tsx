'use client';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface FilterMenuProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export default function FilterMenu({ label, options, selected, onChange }: FilterMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  return (
    <>
      <Button
        size="small"
        endIcon={<ArrowDropDownIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        variant={selected.length > 0 ? 'contained' : 'outlined'}
        color={selected.length > 0 ? 'primary' : 'inherit'}
        disableElevation
        sx={{
          textTransform: 'none',
          fontSize: 13,
          borderColor: '#E0E0E0',
          color: selected.length > 0 ? undefined : 'text.primary',
          whiteSpace: 'nowrap',
        }}
      >
        {label}{selected.length > 0 ? ` (${selected.length})` : ''}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { maxHeight: 280, width: 230 } }}
      >
        {options.map((opt) => (
          <MenuItem key={opt} onClick={() => toggle(opt)} dense sx={{ px: 1.5 }}>
            <Checkbox checked={selected.includes(opt)} size="small" sx={{ p: 0.5, mr: 0.5 }} />
            <ListItemText primary={opt} primaryTypographyProps={{ fontSize: 13 }} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
