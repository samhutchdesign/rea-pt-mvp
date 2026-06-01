'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import TopBar from '@/components/layout/TopBar';
import { mockDocuments } from '@/lib/mock-data';

export default function DocumentsPage() {
  const router = useRouter();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockDocuments.filter((d) => d.isFavorite).map((d) => d.id)));

  const toggleFavorite = (id: string) => setFavorites((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const filtered = showFavoritesOnly ? mockDocuments.filter((d) => favorites.has(d.id)) : mockDocuments;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Documents' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Documents</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Chip
            label="Favorites" size="small"
            variant={showFavoritesOnly ? 'filled' : 'outlined'}
            color={showFavoritesOnly ? 'primary' : 'default'}
            icon={<FavoriteIcon sx={{ fontSize: '14px !important' }} />}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((doc) => (
            <Card
              key={doc.id}
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s' }}
              onClick={() => router.push(`/documents/${doc.id}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FolderRoundedIcon sx={{ color: '#F57C00', fontSize: 22 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                    <Typography variant="body1" fontWeight={600}>{doc.name}</Typography>
                    {favorites.has(doc.id) && <FavoriteIcon sx={{ fontSize: 14, color: '#E91E63' }} />}
                    {doc.isDefault && <Chip label="Default" size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main', fontSize: 10, height: 18 }} />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Updated {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {doc.fields.length} fields
                  </Typography>
                </Box>
                <Tooltip title={favorites.has(doc.id) ? 'Unfavorite' : 'Favorite'}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}>
                    {favorites.has(doc.id) ? <FavoriteIcon fontSize="small" sx={{ color: '#E91E63' }} /> : <FavoriteBorderIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </>
  );
}
