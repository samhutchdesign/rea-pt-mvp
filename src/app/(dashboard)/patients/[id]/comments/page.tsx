'use client';
import { use, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { mockPatientComments, mockPhysio } from '@/lib/mock-data';
import type { PatientComment } from '@/lib/types';

const AUTHOR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp_van3: '#2E7D32',
  emp3: '#F57C00',
  emp4: '#C62828',
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function CommentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const existing = mockPatientComments[id] ?? [];
  const [comments, setComments] = useState<PatientComment[]>(existing);
  const [draft, setDraft] = useState('');

  const pinned = comments.filter((c) => c.pinned).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unpinned = comments.filter((c) => !c.pinned).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const ordered = [...pinned, ...unpinned];

  const togglePin = (commentId: string) => {
    setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, pinned: !c.pinned } : c));
  };

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    const newComment: PatientComment = {
      id: `c-${Date.now()}`,
      patientId: id,
      authorId: 'emp1',
      authorName: `${mockPhysio.firstName} ${mockPhysio.lastName}`,
      authorInitials: mockPhysio.avatarInitials,
      content: text,
      createdAt: new Date().toISOString(),
      pinned: false,
    };
    setComments((prev) => [newComment, ...prev]);
    setDraft('');
  };

  const empty = ordered.length === 0;

  return (
    <Box sx={{ maxWidth: 720 }}>
      {/* Compose */}
      <Card sx={{ mb: 3, p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: AUTHOR_COLORS['emp1'] + '18', color: AUTHOR_COLORS['emp1'], fontWeight: 700, fontSize: 13, flexShrink: 0, mt: 0.25 }}>
            {mockPhysio.avatarInitials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              multiline
              minRows={2}
              maxRows={6}
              fullWidth
              placeholder="Add a comment or internal note…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
              size="small"
              sx={{ mb: 1.5 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="small"
                disableElevation
                endIcon={<SendRoundedIcon sx={{ fontSize: '16px !important' }} />}
                onClick={submit}
                disabled={!draft.trim()}
              >
                Post
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Comment list */}
      {empty ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: 44, color: '#BDBDBD', mb: 1 }} />
          <Typography color="text.secondary">No comments yet. Add the first internal note.</Typography>
        </Box>
      ) : (
        <Card>
          {ordered.map((comment, i) => {
            const color = AUTHOR_COLORS[comment.authorId] ?? '#6750A4';
            return (
              <Box key={comment.id}>
                <Box sx={{ px: 2.5, py: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: color + '18', color, fontWeight: 700, fontSize: 13, flexShrink: 0, mt: 0.25 }}>
                    {comment.authorInitials}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight={600}>{comment.authorName}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatTimestamp(comment.createdAt)}</Typography>
                      {comment.pinned && (
                        <Chip
                          label="Pinned"
                          size="small"
                          icon={<PushPinIcon sx={{ fontSize: '12px !important' }} />}
                          sx={{ height: 18, fontSize: 10, bgcolor: '#FFF8E1', color: '#E65100', '& .MuiChip-icon': { color: '#E65100' } }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => togglePin(comment.id)}
                    sx={{ flexShrink: 0, mt: 0.25, color: comment.pinned ? '#E65100' : 'text.disabled', '&:hover': { color: '#E65100' } }}
                  >
                    {comment.pinned ? <PushPinIcon sx={{ fontSize: 16 }} /> : <PushPinOutlinedIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Box>
                {i < ordered.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Card>
      )}
    </Box>
  );
}
