'use client';
import { use, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { mockPatients, mockPrograms, mockExercises, mockPhysio } from '@/lib/mock-data';
import { getNotes, addNote, updateNote, deleteNote } from '@/lib/noteStore';
import type { Exercise, ProgramExercise } from '@/lib/types';
import type { ExerciseNote } from '@/lib/noteStore';

const ME_ID = mockPhysio.id ?? 'p1';
const ME_NAME = `${mockPhysio.firstName} ${mockPhysio.lastName}`;

function NoteItem({
  note,
  onEdit,
  onDelete,
}: {
  note: ExerciseNote;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const isPatient = note.authorRole === 'patient';
  const canEdit = !isPatient;
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(note.content);

  const saveEdit = () => {
    const trimmed = editDraft.trim();
    if (trimmed && trimmed !== note.content) onEdit(note.id, trimmed);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditDraft(note.content);
    setEditing(false);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Avatar
        sx={{
          width: 28, height: 28, fontSize: 11, fontWeight: 700,
          bgcolor: isPatient ? '#E3F2FD' : '#E8E0F0',
          color: isPatient ? '#0277BD' : 'primary.main',
          flexShrink: 0,
        }}
      >
        {note.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography variant="caption" fontWeight={600}>{note.authorName}</Typography>
          {isPatient && (
            <Chip label="Patient" size="small" sx={{ height: 16, fontSize: 10, bgcolor: '#E3F2FD', color: '#0277BD' }} />
          )}
          <Typography variant="caption" color="text.secondary">
            {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Typography>
          {note.editedAt && (
            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>edited</Typography>
          )}
          {canEdit && !editing && (
            <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
              <Tooltip title="Edit note">
                <IconButton size="small" onClick={() => { setEditDraft(note.content); setEditing(true); }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete note">
                <IconButton size="small" onClick={() => onDelete(note.id)} sx={{ color: 'error.main' }}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {editing ? (
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-end' }}>
            <TextField
              size="small"
              multiline
              maxRows={4}
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === 'Escape') cancelEdit(); }}
              autoFocus
              sx={{ flexGrow: 1, '& .MuiInputBase-root': { fontSize: 13 } }}
            />
            <Tooltip title="Save">
              <IconButton size="small" color="primary" onClick={saveEdit} sx={{ mb: 0.25 }}>
                <CheckRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={cancelEdit} sx={{ mb: 0.25 }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{note.content}</Typography>
        )}
      </Box>
    </Box>
  );
}

function ExerciseNotes({ patientId, exerciseId }: { patientId: string; exerciseId: string }) {
  const [notes, setNotes] = useState<ExerciseNote[]>(() => getNotes(patientId, exerciseId));
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => setNotes(getNotes(patientId, exerciseId));

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addNote(patientId, exerciseId, {
      id: `note-${Date.now()}`,
      authorId: ME_ID,
      authorName: ME_NAME,
      authorRole: 'staff',
      content: trimmed,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    refresh();
    setDraft('');
  };

  const handleEdit = (noteId: string, content: string) => {
    updateNote(patientId, exerciseId, noteId, content);
    refresh();
  };

  const handleDelete = (noteId: string) => {
    deleteNote(patientId, exerciseId, noteId);
    refresh();
  };

  return (
    <Box sx={{ px: 2.5, pb: 2.5, pt: 1 }}>
      <Divider sx={{ mb: 2 }} />

      {notes.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          inputRef={inputRef}
          size="small"
          multiline
          maxRows={4}
          placeholder="Add a note for this exercise…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
          sx={{ flexGrow: 1, '& .MuiInputBase-root': { fontSize: 13 } }}
        />
        <Tooltip title="Add note">
          <span>
            <IconButton size="small" color="primary" onClick={handleAdd} disabled={!draft.trim()} sx={{ mb: 0.25 }}>
              <SendRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function PatientProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [previewPE, setPreviewPE] = useState<ProgramExercise | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const patient = mockPatients.find((p) => p.id === id);
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;

  const toggleNotes = (exerciseId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(exerciseId) ? next.delete(exerciseId) : next.add(exerciseId);
      return next;
    });
  };

  const noteCount = (exerciseId: string) => getNotes(id, exerciseId).length;

  if (!patient) return null;

  if (!program) {
    return (
      <Box>
        <Typography variant="h6" fontWeight={600} mb={1}>Program</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          No program assigned yet. Choose a recommended template or start from scratch.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mockPrograms.map((prog) => (
            <Card
              key={prog.id}
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s', p: 2.5 }}
              onClick={() => router.push(`/patients/${id}/program/edit`)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>{prog.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{prog.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
                    {prog.tags.map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)}
                  </Box>
                </Box>
                <Chip label={`${prog.exercises.length} exercises`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
              </Box>
            </Card>
          ))}
          <Button variant="outlined" onClick={() => router.push(`/patients/${id}/program/edit`)}>
            Create Program from Scratch
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>{program.name}</Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => router.push(`/patients/${id}/program/edit`)}>
            Modify
          </Button>
          <Button variant="contained" startIcon={<SendOutlinedIcon />} onClick={() => router.push(`/patients/${id}/program/send`)} disableElevation>
            Send Program to Patient
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {program.exercises.map((pe) => {
          const ex = mockExercises.find((e) => e.id === pe.exerciseId);
          if (!ex) return null;
          const notesOpen = expandedNotes.has(ex.id);
          const count = noteCount(ex.id);
          return (
            <Card key={pe.exerciseId}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2 }}>
                <Box sx={{ width: 80, height: 64, borderRadius: 1, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FitnessCenterRoundedIcon sx={{ color: '#6750A4', fontSize: 28 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={0.25}>{ex.name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>{ex.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                    <Chip label={`${pe.sets} Sets`} size="small" variant="outlined" />
                    <Chip label={`${pe.reps} Reps`} size="small" variant="outlined" />
                    {pe.holdSecs > 0 && <Chip label={`${pe.holdSecs} Sec Hold`} size="small" variant="outlined" />}
                    <Chip label={pe.frequency} size="small" variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pe.adherence}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: '#1C1B1F', borderRadius: 3 } }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>{pe.adherence}% Adherence</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                  <Tooltip title="Preview exercise">
                    <IconButton size="small" onClick={() => { setPreviewExercise(ex); setPreviewPE(pe); }}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={notesOpen ? 'Hide notes' : 'View / add notes'}>
                    <IconButton
                      size="small"
                      onClick={() => toggleNotes(ex.id)}
                      sx={{ color: notesOpen ? 'primary.main' : count > 0 ? '#F57C00' : 'text.secondary' }}
                    >
                      <Box sx={{ position: 'relative', display: 'flex' }}>
                        <ChatBubbleOutlineRoundedIcon fontSize="small" />
                        {count > 0 && (
                          <Box sx={{
                            position: 'absolute', top: -5, right: -6,
                            width: 14, height: 14, borderRadius: '50%',
                            bgcolor: notesOpen ? 'primary.main' : '#F57C00',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Typography sx={{ fontSize: 9, color: '#fff', fontWeight: 700, lineHeight: 1 }}>{count}</Typography>
                          </Box>
                        )}
                      </Box>
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Collapse in={notesOpen} unmountOnExit>
                <ExerciseNotes patientId={id} exerciseId={ex.id} />
              </Collapse>
            </Card>
          );
        })}
      </Box>

      <ExercisePreviewDrawer
        exercise={previewExercise}
        open={!!previewExercise}
        onClose={() => { setPreviewExercise(null); setPreviewPE(null); }}
        patientPrescription={previewPE ? { sets: previewPE.sets, reps: previewPE.reps, holdSecs: previewPE.holdSecs, frequency: previewPE.frequency, adherence: previewPE.adherence } : undefined}
      />
    </Box>
  );
}
