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

// ─── prog1 (Postpartum Foundation): ex1, ex11, ex3, ex5 ───────────────────────

// pat1 – Margaret Chen
notesMap.set('pat1:ex1', [
  { id: 'n-pat1-ex1-p', authorId: 'patient-pat1', authorName: 'Margaret Chen', authorRole: 'patient', content: "I've been doing these every morning after breakfast. Sometimes I forget in the evenings, but mornings feel natural now!", createdAt: '2026-05-10' },
]);
notesMap.set('pat1:ex3', [
  { id: 'n-pat1-ex3-p', authorId: 'patient-pat1', authorName: 'Margaret Chen', authorRole: 'patient', content: "This one is hard for me. I feel like I'm not holding long enough. Am I supposed to feel it in my lower back too?", createdAt: '2026-05-08' },
]);
notesMap.set('pat1:ex5', [
  { id: 'n-pat1-ex5-p', authorId: 'patient-pat1', authorName: 'Margaret Chen', authorRole: 'patient', content: "I tried the standing version against the wall — it made so much more sense than lying down. Feels really good first thing in the morning.", createdAt: '2026-05-14' },
]);

// pat6 – Laura Finch (prog1)
notesMap.set('pat6:ex1', [
  { id: 'n-pat6-ex1-p', authorId: 'patient-pat6', authorName: 'Laura Finch', authorRole: 'patient', content: "I do these before bed every night now. Helps me unwind after a stressful day.", createdAt: '2026-05-12' },
]);
notesMap.set('pat6:ex3', [
  { id: 'n-pat6-ex3-p', authorId: 'patient-pat6', authorName: 'Laura Finch', authorRole: 'patient', content: "Can I do more than 3 sets? I feel like I could keep going. Or is more not better here?", createdAt: '2026-05-15' },
]);

// pat_van9 – Mei Xu (prog1)
notesMap.set('pat_van9:ex1', [
  { id: 'n-van9-ex1-p', authorId: 'patient-pat_van9', authorName: 'Mei Xu', authorRole: 'patient', content: "I found an app that times my breathing — 4 count in, 4 count hold, 4 count out. Really helpful for staying consistent.", createdAt: '2026-05-11' },
]);
notesMap.set('pat_van9:ex5', [
  { id: 'n-van9-ex5-p', authorId: 'patient-pat_van9', authorName: 'Mei Xu', authorRole: 'patient', content: "I've been doing these at the wall. Should I feel the small of my back touching the wall the whole time, or just at the end?", createdAt: '2026-05-16' },
]);

// pat_nyc3 – Sophie Adams (prog1)
notesMap.set('pat_nyc3:ex3', [
  { id: 'n-nyc3-ex3-p', authorId: 'patient-pat_nyc3', authorName: 'Sophie Adams', authorRole: 'patient', content: "I'm up to 8-second holds now! Started at 3 a few weeks ago. Really noticing a difference.", createdAt: '2026-05-18' },
]);
notesMap.set('pat_nyc3:ex11', [
  { id: 'n-nyc3-ex11-p', authorId: 'patient-pat_nyc3', authorName: 'Sophie Adams', authorRole: 'patient', content: "I think I'm compensating with my thighs — I feel them engaging when I try to activate my core. Is that a problem?", createdAt: '2026-05-20' },
]);

// pat_nyc8 – Tanya Ross (prog1)
notesMap.set('pat_nyc8:ex1', [
  { id: 'n-nyc8-ex1-p', authorId: 'patient-pat_nyc8', authorName: 'Tanya Ross', authorRole: 'patient', content: "I love this one. It's the only exercise that actually feels relaxing. I do it twice a day some days.", createdAt: '2026-05-09' },
]);
notesMap.set('pat_nyc8:ex11', [
  { id: 'n-nyc8-ex11-p', authorId: 'patient-pat_nyc8', authorName: 'Tanya Ross', authorRole: 'patient', content: "I still can't tell if I'm activating the right muscle. Could we double-check this at the next session?", createdAt: '2026-05-13' },
]);

// pat_uth2 – Marta Jensen (prog1)
notesMap.set('pat_uth2:ex1', [
  { id: 'n-uth2-ex1-p', authorId: 'patient-pat_uth2', authorName: 'Marta Jensen', authorRole: 'patient', content: "These help me sleep so much better. I do them right before bed every night.", createdAt: '2026-05-10' },
]);
notesMap.set('pat_uth2:ex5', [
  { id: 'n-uth2-ex5-p', authorId: 'patient-pat_uth2', authorName: 'Marta Jensen', authorRole: 'patient', content: "I wasn't sure I was doing these right so I filmed myself to check — I think my form looks okay! Can you confirm next time?", createdAt: '2026-05-17' },
]);

// pat_uth5 – Lisa de Boer (prog1)
notesMap.set('pat_uth5:ex1', [
  { id: 'n-uth5-ex1-p', authorId: 'patient-pat_uth5', authorName: 'Lisa de Boer', authorRole: 'patient', content: "These make me feel so calm. I do them on the train to work — nobody even notices!", createdAt: '2026-05-13' },
]);
notesMap.set('pat_uth5:ex11', [
  { id: 'n-uth5-ex11-p', authorId: 'patient-pat_uth5', authorName: 'Lisa de Boer', authorRole: 'patient', content: "I keep holding my breath when I try to activate. Really concentrating on breathing through it now.", createdAt: '2026-05-19' },
]);

// pat_uth10 – Hanna Müller (prog1)
notesMap.set('pat_uth10:ex3', [
  { id: 'n-uth10-ex3-p', authorId: 'patient-pat_uth10', authorName: 'Hanna Müller', authorRole: 'patient', content: "Ich halte es jetzt 8 Sekunden — I can hold for 8 seconds now! A big improvement from where I started.", createdAt: '2026-05-16' },
]);
notesMap.set('pat_uth10:ex11', [
  { id: 'n-uth10-ex11-p', authorId: 'patient-pat_uth10', authorName: 'Hanna Müller', authorRole: 'patient', content: "I do this one in the waiting room before sessions to warm up. Is that a good idea or should I save it for the program?", createdAt: '2026-05-21' },
]);

// ─── prog2 (Incontinence Recovery): ex2, ex3, ex1, ex4 ───────────────────────

// pat2 – Karen Oduya
notesMap.set('pat2:ex2', [
  { id: 'n-pat2-ex2-p', authorId: 'patient-pat2', authorName: 'Karen Oduya', authorRole: 'patient', content: 'Getting easier — I do these at my desk during lunch. The reminder alarm really helps.', createdAt: '2026-04-20' },
]);
notesMap.set('pat2:ex3', [
  { id: 'n-pat2-ex3-p', authorId: 'patient-pat2', authorName: 'Karen Oduya', authorRole: 'patient', content: "10 seconds feels like forever! I get to about 6-7 before I lose focus. Is that still beneficial?", createdAt: '2026-04-28' },
]);
notesMap.set('pat2:ex1', [
  { id: 'n-pat2-ex1-p', authorId: 'patient-pat2', authorName: 'Karen Oduya', authorRole: 'patient', content: "I've been doing these at my desk between meetings. Really helps with the afternoon tension.", createdAt: '2026-05-05' },
]);

// pat5 – Diane Morrison (prog2)
notesMap.set('pat5:ex2', [
  { id: 'n-pat5-ex2-p', authorId: 'patient-pat5', authorName: 'Diane Morrison', authorRole: 'patient', content: "Finally getting the squeeze-and-release rhythm. I set a noon alarm every day — that's been the game changer.", createdAt: '2026-05-06' },
]);
notesMap.set('pat5:ex4', [
  { id: 'n-pat5-ex4-p', authorId: 'patient-pat5', authorName: 'Diane Morrison', authorRole: 'patient', content: "Love this one! I actually feel it in my glutes now, not my back. Big difference from week one.", createdAt: '2026-05-14' },
]);

// pat_van8 – Chloe Tanaka (prog2)
notesMap.set('pat_van8:ex2', [
  { id: 'n-van8-ex2-p', authorId: 'patient-pat_van8', authorName: 'Chloe Tanaka', authorRole: 'patient', content: "I'm not sure I'm isolating the right muscles. It feels like my whole core tightens. Should I feel it more specifically?", createdAt: '2026-05-10' },
]);
notesMap.set('pat_van8:ex4', [
  { id: 'n-van8-ex4-p', authorId: 'patient-pat_van8', authorName: 'Chloe Tanaka', authorRole: 'patient', content: "I do these on my lunch break at home — the carpet works fine! My cat keeps coming to investigate.", createdAt: '2026-05-17' },
]);

// pat_nyc4 – Keisha Williams (prog2)
notesMap.set('pat_nyc4:ex2', [
  { id: 'n-nyc4-ex2-p', authorId: 'patient-pat_nyc4', authorName: 'Keisha Williams', authorRole: 'patient', content: "3 sets is a lot harder than it looks! I usually manage 2 full sets before my focus goes.", createdAt: '2026-05-08' },
]);
notesMap.set('pat_nyc4:ex1', [
  { id: 'n-nyc4-ex1-p', authorId: 'patient-pat_nyc4', authorName: 'Keisha Williams', authorRole: 'patient', content: "I do these in the car waiting for school pickup. Sneaky multitasking!", createdAt: '2026-05-15' },
]);

// pat_nyc7 – Maria Gonzalez (prog2)
notesMap.set('pat_nyc7:ex3', [
  { id: 'n-nyc7-ex3-p', authorId: 'patient-pat_nyc7', authorName: 'Maria Gonzalez', authorRole: 'patient', content: "10 segundos es mucho! I get to about 7 before I lose the contraction. Getting better each week though.", createdAt: '2026-05-11' },
]);
notesMap.set('pat_nyc7:ex2', [
  { id: 'n-nyc7-ex2-p', authorId: 'patient-pat_nyc7', authorName: 'Maria Gonzalez', authorRole: 'patient', content: "Getting better at these. I set a timer on my phone and do them before my morning coffee.", createdAt: '2026-05-18' },
]);

// pat_uth1 – Anna de Vries (prog2)
notesMap.set('pat_uth1:ex2', [
  { id: 'n-uth1-ex2-p', authorId: 'patient-pat_uth1', authorName: 'Anna de Vries', authorRole: 'patient', content: "Ik doe deze elke ochtend — I do these every morning now, it's really becoming a habit. Feeling more in control.", createdAt: '2026-05-09' },
]);
notesMap.set('pat_uth1:ex3', [
  { id: 'n-uth1-ex3-p', authorId: 'patient-pat_uth1', authorName: 'Anna de Vries', authorRole: 'patient', content: "The holding part is hard. I get to about 6 seconds consistently. Trying to build up slowly.", createdAt: '2026-05-16' },
]);

// pat_uth4 – Sarah Bakker (prog2)
notesMap.set('pat_uth4:ex3', [
  { id: 'n-uth4-ex3-p', authorId: 'patient-pat_uth4', authorName: 'Sarah Bakker', authorRole: 'patient', content: "I can only hold for 5 seconds before I start shaking! But I can tell it's getting better each week.", createdAt: '2026-05-12' },
]);
notesMap.set('pat_uth4:ex4', [
  { id: 'n-uth4-ex4-p', authorId: 'patient-pat_uth4', authorName: 'Sarah Bakker', authorRole: 'patient', content: "My glutes finally activated! I can really feel the difference from week one. Such a satisfying exercise now.", createdAt: '2026-05-19' },
]);

// pat_uth7 – Petra Hoffman (prog2)
notesMap.set('pat_uth7:ex2', [
  { id: 'n-uth7-ex2-p', authorId: 'patient-pat_uth7', authorName: 'Petra Hoffman', authorRole: 'patient', content: "Am I supposed to feel this in my inner thighs too? I feel the squeeze everywhere, not just the pelvic floor.", createdAt: '2026-05-14' },
]);
notesMap.set('pat_uth7:ex1', [
  { id: 'n-uth7-ex1-p', authorId: 'patient-pat_uth7', authorName: 'Petra Hoffman', authorRole: 'patient', content: "I was sceptical at first but these really do help with the tension. I notice it most when I skip a day.", createdAt: '2026-05-20' },
]);

// ─── prog3 (Pelvic Pain Relief): ex1, ex9, ex5 ───────────────────────────────

// pat3 – Priya Nair
notesMap.set('pat3:ex1', [
  { id: 'n-pat3-ex1-p', authorId: 'patient-pat3', authorName: 'Priya Nair', authorRole: 'patient', content: "These are calming but I keep forgetting to do them in the evenings. Mornings I'm consistent, evenings not so much.", createdAt: '2026-05-07' },
]);
notesMap.set('pat3:ex5', [
  { id: 'n-pat3-ex5-p', authorId: 'patient-pat3', authorName: 'Priya Nair', authorRole: 'patient', content: "The standing version against the wall feels more natural to me than lying down. I do it every morning.", createdAt: '2026-05-13' },
]);

// pat_van6 – Rachel Singh (prog3)
notesMap.set('pat_van6:ex1', [
  { id: 'n-van6-ex1-p', authorId: 'patient-pat_van6', authorName: 'Rachel Singh', authorRole: 'patient', content: "My partner jokes that I'm always breathing slowly now! But it genuinely helps with my anxiety too.", createdAt: '2026-05-09' },
]);
notesMap.set('pat_van6:ex9', [
  { id: 'n-van6-ex9-p', authorId: 'patient-pat_van6', authorName: 'Rachel Singh', authorRole: 'patient', content: "My hips are so stiff in the mornings. The cat stretch is easy but the cow stretch is really hard — I can't seem to get my back to arc the other way.", createdAt: '2026-05-16' },
]);

// pat_nyc5 – Jennifer Hayes (prog3)
notesMap.set('pat_nyc5:ex9', [
  { id: 'n-nyc5-ex9-p', authorId: 'patient-pat_nyc5', authorName: 'Jennifer Hayes', authorRole: 'patient', content: "How slow should I go? I've been doing about 3-4 seconds each direction. Am I rushing it?", createdAt: '2026-05-10' },
]);
notesMap.set('pat_nyc5:ex5', [
  { id: 'n-nyc5-ex5-p', authorId: 'patient-pat_nyc5', authorName: 'Jennifer Hayes', authorRole: 'patient', content: "Standing version felt really weird at first but gets easier. I can actually feel the connection to my lower back now.", createdAt: '2026-05-17' },
]);

// pat_nyc9 – Claire Burke (prog3)
notesMap.set('pat_nyc9:ex1', [
  { id: 'n-nyc9-ex1-p', authorId: 'patient-pat_nyc9', authorName: 'Claire Burke', authorRole: 'patient', content: "I've been doing these twice a day like you suggested. Definitely sleeping better — I think it's helping more than just the pelvic floor.", createdAt: '2026-05-12' },
]);
notesMap.set('pat_nyc9:ex9', [
  { id: 'n-nyc9-ex9-p', authorId: 'patient-pat_nyc9', authorName: 'Claire Burke', authorRole: 'patient', content: "The cat-cow stretch helps so much with my morning stiffness. It's become my favourite part of the program.", createdAt: '2026-05-19' },
]);

// pat_uth3 – Emma van den Berg (prog3)
notesMap.set('pat_uth3:ex9', [
  { id: 'n-uth3-ex9-p', authorId: 'patient-pat_uth3', authorName: 'Emma van den Berg', authorRole: 'patient', content: "The cow stretch hurts a little at the very top — is that normal or am I going too far?", createdAt: '2026-05-11' },
]);
notesMap.set('pat_uth3:ex5', [
  { id: 'n-uth3-ex5-p', authorId: 'patient-pat_uth3', authorName: 'Emma van den Berg', authorRole: 'patient', content: "I do these at my standing desk during work. Really helps my back during long days — I do them every hour or so.", createdAt: '2026-05-18' },
]);

// pat_uth8 – Inge Visser (prog3)
notesMap.set('pat_uth8:ex1', [
  { id: 'n-uth8-ex1-p', authorId: 'patient-pat_uth8', authorName: 'Inge Visser', authorRole: 'patient', content: "I time these with a ticking clock — 4 ticks in, 4 ticks hold, 4 ticks out. Really helps me stay consistent.", createdAt: '2026-05-08' },
]);
notesMap.set('pat_uth8:ex9', [
  { id: 'n-uth8-ex9-p', authorId: 'patient-pat_uth8', authorName: 'Inge Visser', authorRole: 'patient', content: "My lower back is so much less stiff since I started doing cat-cow every morning. Really noticeable difference.", createdAt: '2026-05-15' },
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
