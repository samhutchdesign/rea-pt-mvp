'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TopBar from '@/components/layout/TopBar';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { mockDocuments } from '@/lib/mock-data';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const doc = mockDocuments.find((d) => d.id === id);
  const [isFavorite, setIsFavorite] = useState(doc?.isFavorite ?? false);

  if (!doc) return <Box sx={{ p: 4 }}><Typography>Document not found.</Typography></Box>;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Documents', href: '/documents' }, { label: doc.name }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 700 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <Typography variant="h5" fontWeight={700}>{doc.name}</Typography>
              {doc.isDefault && <Chip label="Default" size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />}
              <IconButton onClick={() => setIsFavorite(!isFavorite)}>
                {isFavorite ? <FavoriteIcon sx={{ color: '#E91E63' }} /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Updated {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {doc.fields.length} fields
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => router.push('/documents/new')}>Edit</Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {doc.fields.map((field) => (
            <Box key={field.id}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>{field.label}</Typography>
              {field.type === 'dropdown' ? (
                <Box sx={{ border: '1px solid #E0E0E0', borderRadius: 1, px: 1.5, py: 1, bgcolor: '#FAFAFA' }}>
                  <Typography variant="body2" color="text.secondary">Options: {field.options?.join(', ')}</Typography>
                </Box>
              ) : field.type === 'checkbox' ? (
                <Box sx={{ border: '1px solid #E0E0E0', borderRadius: 1, px: 1.5, py: 1, bgcolor: '#FAFAFA', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, border: '1.5px solid #9E9E9E', borderRadius: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">{field.label}</Typography>
                </Box>
              ) : (
                <TextField
                  size="small" fullWidth
                  multiline={field.type === 'textarea'} rows={field.type === 'textarea' ? 3 : 1}
                  placeholder={field.type === 'date' ? 'MM/DD/YYYY' : `Enter ${field.label.toLowerCase()}…`}
                  InputProps={{ readOnly: true, sx: { bgcolor: '#FAFAFA', color: 'text.secondary' } }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
