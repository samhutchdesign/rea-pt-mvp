'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import TopBar from '@/components/layout/TopBar';

interface Field { id: string; label: string; type: string; }

export default function NewDocumentPage() {
  const router = useRouter();
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<Field[]>([{ id: '1', label: '', type: 'text' }]);

  const addField = () => setFields((prev) => [...prev, { id: Date.now().toString(), label: '', type: 'text' }]);
  const removeField = (id: string) => setFields((prev) => prev.filter((f) => f.id !== id));
  const updateField = (id: string, key: keyof Field, value: string) =>
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, [key]: value } : f));

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Documents', href: '/documents' }, { label: 'New Form' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 700 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>Create New Form</Typography>

        <TextField label="Form Name" fullWidth size="small" value={formName} onChange={(e) => setFormName(e.target.value)} sx={{ mb: 3 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={2}>Fields</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          {fields.map((field, i) => (
            <Card key={field.id}>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', py: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 24 }}>{i + 1}.</Typography>
                <TextField
                  label="Field Label" size="small" sx={{ flexGrow: 1 }}
                  value={field.label} onChange={(e) => updateField(field.id, 'label', e.target.value)}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Type</InputLabel>
                  <Select label="Type" value={field.type} onChange={(e) => updateField(field.id, 'type', e.target.value)}>
                    <MenuItem value="text">Short Text</MenuItem>
                    <MenuItem value="textarea">Long Text</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="checkbox">Checkbox</MenuItem>
                    <MenuItem value="dropdown">Dropdown</MenuItem>
                  </Select>
                </FormControl>
                <IconButton size="small" onClick={() => removeField(field.id)} disabled={fields.length === 1} sx={{ color: '#9E9E9E', '&:hover': { color: '#F44336' } }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Button startIcon={<AddIcon />} onClick={addField} sx={{ mb: 4 }}>Add Field</Button>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => router.push('/documents')}>Cancel</Button>
          <Button variant="contained" onClick={() => router.push('/documents')} disableElevation>Save Form</Button>
        </Box>
      </Box>
    </>
  );
}
