export interface ExerciseNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'staff' | 'patient';
  content: string;
  createdAt: string;
  editedAt?: string;
}

const notesMap = new Map<string, ExerciseNote[]>();

notesMap.set('pat1:ex1', [
  {
    id: 'note-pat1-ex1-p',
    authorId: 'patient-pat1',
    authorName: 'Margaret Chen',
    authorRole: 'patient',
    content: "I've been doing these every morning after breakfast. Sometimes I forget in the evenings, but mornings feel natural now!",
    createdAt: '2026-05-10',
  },
]);

notesMap.set('pat1:ex3', [
  {
    id: 'note-pat1-ex3-p',
    authorId: 'patient-pat1',
    authorName: 'Margaret Chen',
    authorRole: 'patient',
    content: "This one is hard for me. I feel like I'm not holding long enough. Am I supposed to feel it in my lower back too?",
    createdAt: '2026-05-08',
  },
]);

notesMap.set('pat2:ex2', [
  {
    id: 'note-pat2-ex2-p',
    authorId: 'patient-pat2',
    authorName: 'Karen Oduya',
    authorRole: 'patient',
    content: 'Getting easier — I do these at my desk during lunch. The reminder alarm really helps.',
    createdAt: '2026-04-20',
  },
]);

export function getNotes(patientId: string, exerciseId: string): ExerciseNote[] {
  return notesMap.get(`${patientId}:${exerciseId}`) ?? [];
}

export function addNote(patientId: string, exerciseId: string, note: ExerciseNote): void {
  const key = `${patientId}:${exerciseId}`;
  const existing = notesMap.get(key) ?? [];
  notesMap.set(key, [...existing, note]);
}

export function updateNote(patientId: string, exerciseId: string, noteId: string, content: string): void {
  const key = `${patientId}:${exerciseId}`;
  const existing = notesMap.get(key) ?? [];
  notesMap.set(key, existing.map((n) => n.id === noteId ? { ...n, content, editedAt: new Date().toISOString().slice(0, 10) } : n));
}

export function deleteNote(patientId: string, exerciseId: string, noteId: string): void {
  const key = `${patientId}:${exerciseId}`;
  const existing = notesMap.get(key) ?? [];
  notesMap.set(key, existing.filter((n) => n.id !== noteId));
}
