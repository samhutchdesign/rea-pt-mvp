'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { Divider } from '@/components/ui/divider';
import { mockPatients, mockPrograms, mockExercises } from '@/lib/mock-data';
import { Send, Zap } from 'lucide-react';

export default function SendProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;

  const templateMessage = program
    ? `Hi ${patient?.firstName},\n\nI hope you're doing well! Please find your updated home exercise program attached below. I've put together ${program.exercises.length} exercises tailored to your current treatment plan.\n\nPlease aim to complete your exercises as prescribed. If you have any questions or experience any discomfort, don't hesitate to reach out.\n\nWarm regards,\nSarah Harper, PT, DPT, PRPC\nRea Pelvic Health`
    : '';

  const [message, setMessage] = useState(templateMessage);

  const handleSend = () => {
    toast.success('New Program has successfully been emailed to the Patient!');
    setTimeout(() => router.push(`/patients/${id}/program`), 1500);
  };

  if (!patient || !program) return (
    <p className="block p-8 text-secondary">No program to send.</p>
  );

  return (
    <div className="max-w-[700px]">
      <h3 className="mt-0 mb-1 text-xl font-semibold text-primary">Send Program to Patient</h3>
      <p className="mb-6 text-sm text-secondary">{patient.firstName} {patient.lastName} · {patient.email}</p>

      {/* Message */}
      <div className="mb-6 rounded-xl border border-secondary bg-primary shadow-xs p-6">
        <span className="mb-3 block text-sm font-semibold text-primary">Message</span>
        <textarea
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 resize-none"
        />
      </div>

      {/* Program preview */}
      <div className="mb-6 rounded-xl border border-secondary bg-primary shadow-xs p-6">
        <span className="mb-4 block text-sm font-semibold text-primary">{program.name}</span>
        <div className="flex flex-col gap-3">
          {program.exercises.map((pe) => {
            const ex = mockExercises.find((e) => e.id === pe.exerciseId);
            if (!ex) return null;
            return (
              <div key={pe.exerciseId}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EDE7F6]">
                    <Zap size={18} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-primary">{ex.name}</span>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      <span className="rounded border border-secondary px-2 py-0.5 text-[11px] text-secondary">{`${pe.sets} Sets`}</span>
                      <span className="rounded border border-secondary px-2 py-0.5 text-[11px] text-secondary">{`${pe.reps} Reps`}</span>
                      {pe.holdSecs > 0 && <span className="rounded border border-secondary px-2 py-0.5 text-[11px] text-secondary">{`${pe.holdSecs}s Hold`}</span>}
                      <span className="rounded border border-secondary px-2 py-0.5 text-[11px] text-secondary">{pe.frequency}</span>
                    </div>
                  </div>
                </div>
                <Divider className="mt-3" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/program`)}>Cancel</Button>
        <Button color="primary" size="sm" iconLeading={Send} onPress={handleSend}>Send to Patient</Button>
      </div>
    </div>
  );
}
