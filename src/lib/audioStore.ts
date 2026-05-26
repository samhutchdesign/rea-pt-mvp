import type { AudioTrack } from './types';

// In-memory store: exerciseId → AudioTrack[]
// Persists across component re-renders and navigation within the browser session.
const store = new Map<string, AudioTrack[]>();

// Pre-load demo tracks for ex1 (Diaphragmatic Breathing) to show the completed state.
store.set('ex1', [
  {
    id: 'demo-track-1',
    ownerId: 'p1',
    ownerName: 'Sarah Harper',
    durationSecs: 127,
    createdAt: '2026-01-15',
    blobUrl: null, // demo-only: UI shows correctly but no audio plays
  },
  {
    id: 'demo-track-2',
    ownerId: 'emp1',
    ownerName: 'Emily Chen',
    durationSecs: 49,
    createdAt: '2026-01-20',
    blobUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Birds_singing_in_garden.ogg',
  },
]);

export function getAudioTracks(exerciseId: string): AudioTrack[] {
  return store.get(exerciseId) ?? [];
}

export function getMyTrack(exerciseId: string, ownerId: string): AudioTrack | null {
  return store.get(exerciseId)?.find((t) => t.ownerId === ownerId) ?? null;
}

export function saveAudioTrack(exerciseId: string, track: AudioTrack): void {
  const existing = store.get(exerciseId) ?? [];
  const filtered = existing.filter((t) => t.ownerId !== track.ownerId);
  store.set(exerciseId, [...filtered, track]);
}

export function deleteAudioTrack(exerciseId: string, ownerId: string): void {
  const existing = store.get(exerciseId) ?? [];
  store.set(exerciseId, existing.filter((t) => t.ownerId !== ownerId));
}
