'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { mockPrograms, mockExercises, mockPatients } from '@/lib/mock-data';
import { useDataState } from '@/lib/dataStateStore';
import { SignUpRequiredModal } from '@/components/ui/sign-up-required-modal';
import { NativeSelect } from '@/components/ui/native-select';
import type { Patient } from '@/lib/types';
import { Heart, Pencil, UserPlus, Zap } from 'lucide-react';

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const prog = mockPrograms.find((p) => p.id === id);
  const [isFavorite, setIsFavorite] = useState(prog?.isFavorite ?? false);
  const dataState = useDataState();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  if (!prog) return <div className="p-8"><span className="text-secondary">Program not found.</span></div>;

  const handleAssign = () => {
    if (selectedPatient) {
      toast.success(`Program assigned to ${selectedPatient.firstName} ${selectedPatient.lastName}!`);
    }
    setAssignOpen(false);
    setSelectedPatient(null);
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs', href: '/programs' }, { label: prog.name }]} />
      <div className="px-8 py-8 max-w-[700px]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-semibold text-primary m-0">{prog.name}</h2>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent border-0 cursor-pointer hover:bg-secondary transition-colors"
              >
                {isFavorite
                  ? <Heart className="text-pink-500" fill="#E91E63" size={18} />
                  : <Heart className="text-tertiary" size={18} />}
              </button>
            </div>
            <p className="text-secondary mb-2">{prog.description}</p>
            <div className="flex gap-1.5 flex-wrap">
              {prog.tags.map((t) => (
                <span key={t} className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button color="secondary" size="sm" iconLeading={UserPlus} onPress={() => dataState === 'empty' ? setShowSignUpModal(true) : setAssignOpen(true)}>
              Assign to Patient
            </Button>
            <Button color="secondary" size="sm" iconLeading={Pencil} onPress={() => dataState === 'empty' ? setShowSignUpModal(true) : router.push('/programs/new')}>
              Edit
            </Button>
          </div>
        </div>

        <span className="block mb-4 font-semibold text-tertiary">{prog.exercises.length} exercises</span>

        <div className="flex flex-col gap-3">
          {prog.exercises.map((pe) => {
            const ex = mockExercises.find((e) => e.id === pe.exerciseId);
            if (!ex) return null;
            return (
              <div key={pe.exerciseId} className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/exercises/${pe.exerciseId}`)}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <Zap size={22} className="text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-semibold text-primary mb-1">{ex.name}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{`${pe.sets} Sets`}</span>
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{`${pe.reps} Reps`}</span>
                      {pe.holdSecs > 0 && (
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{`${pe.holdSecs}s Hold`}</span>
                      )}
                      <span className="inline-flex items-center rounded-full bg-secondary_alt px-2.5 py-0.5 text-xs font-medium text-tertiary">{pe.frequency}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SignUpRequiredModal open={showSignUpModal} onClose={() => setShowSignUpModal(false)} action="assign or edit programs" />

      {/* Assign to Patient Dialog */}
      <ModalOverlay isOpen={assignOpen} onOpenChange={setAssignOpen}>
        <Modal>
          <Dialog>
            <div className="p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-primary mb-1">Assign to Patient</h3>
              <p className="text-sm text-secondary mb-4">
                Select a patient to assign <strong>{prog.name}</strong> to.
              </p>
              <NativeSelect
                wrapperClassName="mb-6"
                value={selectedPatient?.id ?? ''}
                onChange={(e) => setSelectedPatient(mockPatients.find((p) => p.id === e.target.value) ?? null)}
              >
                <option value="">Search patients…</option>
                {mockPatients.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </NativeSelect>
              <div className="flex justify-end gap-3">
                <Button color="secondary" size="md" onPress={() => setAssignOpen(false)}>Cancel</Button>
                <Button color="primary" size="md" onPress={handleAssign}>
                  Assign Program
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
