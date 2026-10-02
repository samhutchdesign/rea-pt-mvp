'use client';
import { use, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button as AriaButton } from 'react-aria-components';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { mockPrograms, mockExercises, mockPatients, mockPhysio } from '@/lib/mock-data';
import { useDataState } from '@/lib/dataStateStore';
import { SignUpRequiredModal } from '@/components/ui/sign-up-required-modal';
import { useRole } from '@/lib/roleStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { canManageProgram } from '@/lib/permissions';
import { NativeSelect } from '@/components/ui/native-select';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { cueLabel } from '@/components/programs/programBuilder';
import { cx } from '@/utils/cx';
import { toTitleCase } from '@/utils/text';
import type { Patient } from '@/lib/types';
import { ArrowLeft, Copy, Heart, MoreHorizontal, Pencil, Play, Trash2, UserPlus } from 'lucide-react';

const INITIAL_TAG_COUNT = 5;

const clinicInitials = mockPhysio.clinicName
  .split(' ')
  .map((w) => w[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <ProgramDetailContent id={id} />
    </Suspense>
  );
}

function ProgramDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backUrl = decodeURIComponent(searchParams.get('back') ?? '/programs');
  const prog = mockPrograms.find((p) => p.id === id);
  const [isFavorite, setIsFavorite] = useState(prog?.isFavorite ?? false);
  const dataState = useDataState();
  const role = useRole();
  const currentIdentity = useCurrentIdentity();
  const canManage = prog ? canManageProgram(prog, role, currentIdentity.id) : false;
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(prog?.exercises[0]?.exerciseId ?? null);
  const [showAllTags, setShowAllTags] = useState(false);

  const derivedTags = useMemo(() => {
    if (!prog) return [];
    const conditions = new Set<string>();
    const categories = new Set<string>();
    const levels = new Set<string>();
    const equipment = new Set<string>();
    const movements = new Set<string>();
    prog.exercises.forEach((pe) => {
      const ex = mockExercises.find((e) => e.id === pe.exerciseId);
      if (!ex) return;
      ex.tags.condition.forEach((c) => conditions.add(toTitleCase(c)));
      categories.add(ex.category);
      levels.add(ex.level);
      equipment.add(toTitleCase(ex.equipment));
      ex.movementTypes.forEach((m) => movements.add(m));
    });
    return [...conditions, ...categories, ...levels, ...equipment, ...movements];
  }, [prog]);

  if (!prog) return <div className="p-8"><span className="text-secondary">Program not found.</span></div>;

  const selectedExercise = mockExercises.find((e) => e.id === selectedExerciseId) ?? null;
  const visibleTags = showAllTags ? derivedTags : derivedTags.slice(0, INITIAL_TAG_COUNT);

  const handleAssign = () => {
    if (selectedPatient) {
      toast.success(`Program assigned to ${selectedPatient.firstName} ${selectedPatient.lastName}!`);
    }
    setAssignOpen(false);
    setSelectedPatient(null);
  };

  const handleDelete = () => {
    const idx = mockPrograms.findIndex((p) => p.id === prog.id);
    if (idx !== -1) mockPrograms.splice(idx, 1);
    setDeleteOpen(false);
    toast.success(`${prog.name} deleted`);
    router.push('/programs');
  };

  const handleMenuAction = (key: React.Key) => {
    if (key === 'edit') {
      dataState === 'empty' ? setShowSignUpModal(true) : router.push(`/programs/new?edit=${prog.id}`);
    }
    if (key === 'delete') {
      dataState === 'empty' ? setShowSignUpModal(true) : setDeleteOpen(true);
    }
    if (key === 'duplicate') {
      dataState === 'empty' ? setShowSignUpModal(true) : router.push(`/programs/new?duplicate=${prog.id}`);
    }
  };

  return (
    <>
      <div className="px-[60px] pt-10 pb-20">
        <button
          onClick={() => router.push(backUrl)}
          className="inline-flex items-center gap-1.5 text-base text-primary hover:text-secondary mb-5 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.25} />
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Left: hero, details, tags */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-10">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-secondary">
              <ExerciseThumbnail src={selectedExercise?.imageUrl} alt={selectedExercise?.name ?? prog.name} iconSize={44} />
              {selectedExercise && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                      <Play size={20} className="text-primary ml-0.5" fill="currentColor" strokeWidth={1.25} />
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary">
                    {selectedExercise.name}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-col gap-6 w-full">
              <h2 className="font-display text-2xl leading-8 font-normal text-primary m-0">{prog.name}</h2>
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-3">
                  <Avatar initials={clinicInitials} size="lg" />
                  <span className="font-display text-md font-medium tracking-[0.1px] text-primary">{mockPhysio.clinicName}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button color="secondary" size="lg" iconLeading={(p) => <UserPlus {...p} strokeWidth={1.25} />} onPress={() => dataState === 'empty' ? setShowSignUpModal(true) : setAssignOpen(true)}>
                    Assign
                  </Button>
                  <Button
                    color="secondary"
                    size="lg"
                    iconLeading={(p) => <Heart {...p} strokeWidth={1.25} />}
                    onPress={() => setIsFavorite((v) => !v)}
                    className={isFavorite ? '[&_svg]:fill-favorite [&_svg]:text-favorite' : undefined}
                  >
                    {isFavorite ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Dropdown.Root>
                    <AriaButton
                      aria-label="More options"
                      className={(state) =>
                        cx(
                          'flex size-12 items-center justify-center rounded-full border border-secondary bg-primary text-tertiary transition-colors outline-none',
                          (state.isPressed || state.isHovered) && 'bg-secondary',
                          state.isFocusVisible && 'ring-2 ring-brand-300'
                        )
                      }
                    >
                      <MoreHorizontal size={18} strokeWidth={1.25} />
                    </AriaButton>
                    <Dropdown.Popover className="w-44">
                      <Dropdown.Menu onAction={handleMenuAction}>
                        {canManage ? (
                          <>
                            <Dropdown.Item id="edit" icon={(p) => <Pencil {...p} strokeWidth={1.25} />} label="Edit" />
                            <Dropdown.Item id="delete" icon={(p) => <Trash2 {...p} strokeWidth={1.25} />} label="Delete" />
                          </>
                        ) : (
                          <Dropdown.Item id="duplicate" icon={(p) => <Copy {...p} strokeWidth={1.25} />} label="Duplicate" />
                        )}
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown.Root>
                </div>
              </div>
            </div>

            <div className="border-t border-secondary pt-10 flex flex-col gap-7 w-full">
              <h3 className="font-display text-xl leading-[32px] font-medium text-primary m-0">Program Description</h3>
              <p className="text-base leading-6 text-primary m-0">
                {prog.description || 'No description yet.'}
              </p>
            </div>

            <div className="border-t border-secondary pt-10 flex flex-col gap-7 w-full">
              <h3 className="font-display text-xl leading-[32px] font-medium text-primary m-0">Key Words</h3>
              {derivedTags.length === 0 ? (
                <p className="text-xs text-tertiary">Add exercises to see suggested tags.</p>
              ) : (
                <div className="flex gap-2 flex-wrap items-center">
                  {visibleTags.map((t, i) => (
                    <span key={`${t}-${i}`} className="inline-flex items-center rounded-full bg-tertiary px-3 py-2 text-xs text-primary">
                      {t}
                    </span>
                  ))}
                  {!showAllTags && derivedTags.length > INITIAL_TAG_COUNT && (
                    <Button color="link-color" size="sm" onPress={() => setShowAllTags(true)}>See more</Button>
                  )}
                  {showAllTags && derivedTags.length > INITIAL_TAG_COUNT && (
                    <Button color="link-color" size="sm" onPress={() => setShowAllTags(false)}>Show less</Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: exercise list */}
          <div className="w-full lg:w-[400px] shrink-0 rounded-lg border border-secondary overflow-hidden">
            <div className="bg-primary px-6 py-6 border-b border-secondary">
              <h3 className="font-display text-xl leading-[32px] font-medium text-primary m-0">Program Exercises</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-secondary">
              {prog.exercises.length === 0 ? (
                <p className="text-xs text-tertiary px-6 py-6">No exercises in this program yet.</p>
              ) : prog.exercises.map((pe) => {
                const ex = mockExercises.find((e) => e.id === pe.exerciseId);
                if (!ex) return null;
                const isSelected = selectedExerciseId === ex.id;
                return (
                  <button
                    key={pe.exerciseId}
                    onClick={() => setSelectedExerciseId(ex.id)}
                    className={cx(
                      'group relative flex w-full items-center gap-4 p-3 text-left cursor-pointer transition-colors',
                      isSelected ? 'bg-brand-50' : 'bg-primary hover:bg-secondary_alt'
                    )}
                  >
                    <div className="relative h-[72px] w-[116px] shrink-0 overflow-hidden rounded-lg">
                      <ExerciseThumbnail src={ex.imageUrl} alt={ex.name} iconSize={24} />
                    </div>
                    <div className="flex flex-1 min-w-0 flex-col gap-4">
                      <span className="font-display text-md font-medium tracking-[0.1px] text-primary truncate w-full">{ex.name}</span>
                      <span className="text-xs text-primary">
                        {pe.sets} Sets / {pe.reps} Reps{pe.holdSecs > 0 ? ` / ${pe.holdSecs} Sec Hold` : ''}
                      </span>
                      {pe.cue && (
                        <span className={cx('inline-flex w-fit items-center rounded-full px-3 py-2 text-xs text-primary', isSelected ? 'bg-brand-100' : 'bg-tertiary')}>
                          {cueLabel(pe.cue)}
                        </span>
                      )}
                    </div>
                    {isSelected && <span className="absolute right-0 top-0 h-full w-1 bg-brand-600" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <SignUpRequiredModal open={showSignUpModal} onClose={() => setShowSignUpModal(false)} action="assign or edit programs" />

      {/* Assign to Patient Dialog */}
      <ModalOverlay isOpen={assignOpen} onOpenChange={setAssignOpen}>
        <Modal className="w-full max-w-[480px]">
          <Dialog>
            <div className="flex w-full flex-col gap-10 p-8">
              <div className="flex w-full flex-col gap-4">
                <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Assign to Patient</h2>
                <p className="m-0 text-base text-primary">
                  Select a patient to assign <strong>{prog.name}</strong> to.
                </p>
              </div>
              <NativeSelect
                className="h-12"
                value={selectedPatient?.id ?? ''}
                onChange={(e) => setSelectedPatient(mockPatients.find((p) => p.id === e.target.value) ?? null)}
              >
                <option value="">Search patients…</option>
                {mockPatients.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </NativeSelect>
              <div className="flex w-full justify-end gap-4">
                <Button color="secondary" size="lg" onPress={() => setAssignOpen(false)}>Cancel</Button>
                <Button color="primary" size="lg" onPress={handleAssign}>
                  Assign Program
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>

      {/* Delete confirmation modal */}
      <ModalOverlay isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <Modal className="w-full max-w-[480px]">
          <Dialog>
            <div className="flex w-full flex-col gap-10 p-8">
              <div className="flex w-full flex-col gap-4">
                <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Delete Program?</h2>
                <p className="m-0 text-base text-primary">
                  This will permanently delete <strong>{prog.name}</strong>. This cannot be undone.
                </p>
              </div>
              <div className="flex w-full justify-end gap-4">
                <Button color="secondary" size="lg" onPress={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button color="warning" size="lg" onPress={handleDelete}>
                  Delete Program
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
