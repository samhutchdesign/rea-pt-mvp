'use client';
import { use, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button as AriaButton } from 'react-aria-components';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { mockPrograms, mockExercises, mockPatients, mockPhysio } from '@/lib/mock-data';
import { useDataState } from '@/lib/dataStateStore';
import { SignUpRequiredModal } from '@/components/ui/sign-up-required-modal';
import { NativeSelect } from '@/components/ui/native-select';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { cx } from '@/utils/cx';
import { toTitleCase } from '@/utils/text';
import type { Patient } from '@/lib/types';
import { ArrowLeft, Heart, MoreHorizontal, Pencil, Play, Trash2, UserPlus } from 'lucide-react';

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
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs', href: '/programs' }, { label: prog.name }]} />
      <div className="px-8 py-8 max-w-[1200px]">
        <button
          onClick={() => router.push(backUrl)}
          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left: hero, details, tags */}
          <div className="flex-1 min-w-0 w-full max-w-[780px]">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
              <ExerciseThumbnail src={selectedExercise?.imageUrl} alt={selectedExercise?.name ?? prog.name} iconSize={44} />
              {selectedExercise && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600">
                      <Play size={24} className="text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary shadow-xs">
                    {selectedExercise.name}
                  </span>
                </>
              )}
            </div>

            <h2 className="text-2xl font-bold text-primary mt-5 mb-3">{prog.name}</h2>

            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <Avatar initials={clinicInitials} size="sm" />
                <span className="text-sm font-medium text-secondary">{mockPhysio.clinicName}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button color="secondary" size="sm" iconLeading={UserPlus} onPress={() => dataState === 'empty' ? setShowSignUpModal(true) : setAssignOpen(true)}>
                  Assign
                </Button>
                <Button
                  color="secondary"
                  size="sm"
                  iconLeading={Heart}
                  onPress={() => setIsFavorite((v) => !v)}
                  className={isFavorite ? '[&_svg]:fill-pink-500 [&_svg]:text-pink-500' : undefined}
                >
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                <Dropdown.Root>
                  <AriaButton
                    aria-label="More options"
                    className={(state) =>
                      cx(
                        'flex size-9 items-center justify-center rounded-full border border-secondary bg-primary text-tertiary transition-colors outline-none',
                        (state.isPressed || state.isHovered) && 'bg-secondary',
                        state.isFocusVisible && 'ring-2 ring-brand-300'
                      )
                    }
                  >
                    <MoreHorizontal size={18} />
                  </AriaButton>
                  <Dropdown.Popover className="w-44">
                    <Dropdown.Menu onAction={handleMenuAction}>
                      <Dropdown.Item id="edit" icon={Pencil} label="Edit" />
                      {prog.userCreated && <Dropdown.Item id="delete" icon={Trash2} label="Delete" />}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown.Root>
              </div>
            </div>

            <div className="border-t border-secondary pt-5 mb-5">
              <h3 className="text-base font-bold text-primary mb-2">Program Description</h3>
              <p className="text-sm text-secondary leading-relaxed">
                {prog.description || 'No description yet.'}
              </p>
            </div>

            <div className="border-t border-secondary pt-5">
              <h3 className="text-base font-bold text-primary mb-3">Tags</h3>
              {derivedTags.length === 0 ? (
                <p className="text-sm text-tertiary">Add exercises to see suggested tags.</p>
              ) : (
                <div className="flex gap-1.5 flex-wrap items-center">
                  {visibleTags.map((t, i) => (
                    <span key={`${t}-${i}`} className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {t}
                    </span>
                  ))}
                  {!showAllTags && derivedTags.length > INITIAL_TAG_COUNT && (
                    <Button color="link-color" size="sm" onPress={() => setShowAllTags(true)}>See All</Button>
                  )}
                  {showAllTags && derivedTags.length > INITIAL_TAG_COUNT && (
                    <Button color="link-color" size="sm" onPress={() => setShowAllTags(false)}>Show less</Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: video list */}
          <div className="w-full lg:w-[380px] shrink-0 rounded-2xl border border-secondary overflow-hidden">
            <div className="bg-primary px-6 py-4 border-b border-secondary">
              <h3 className="text-lg font-bold text-primary m-0">{prog.name} Videos</h3>
            </div>
            <div className="max-h-[462px] overflow-y-auto divide-y divide-secondary">
              {prog.exercises.length === 0 ? (
                <p className="text-sm text-tertiary px-6 py-6">No exercises in this program yet.</p>
              ) : prog.exercises.map((pe) => {
                const ex = mockExercises.find((e) => e.id === pe.exerciseId);
                if (!ex) return null;
                const isSelected = selectedExerciseId === ex.id;
                return (
                  <button
                    key={pe.exerciseId}
                    onClick={() => setSelectedExerciseId(ex.id)}
                    className={cx(
                      'flex w-full items-center gap-3 px-6 py-2.5 text-left border-y-0 border-r-0 border-l-[3px] cursor-pointer transition-colors',
                      isSelected ? 'bg-brand-100 border-l-brand-600 hover:bg-brand-200' : 'bg-transparent border-l-transparent hover:bg-secondary_alt'
                    )}
                  >
                    <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden">
                      <ExerciseThumbnail src={ex.imageUrl} alt={ex.name} iconSize={20} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600">
                          <Play size={13} className="text-white ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-semibold text-sm text-primary leading-tight mb-1 truncate">{ex.name}</span>
                      <span className="block text-xs text-tertiary">
                        {pe.sets} Sets · {pe.reps} Reps{pe.holdSecs > 0 ? ` · ${pe.holdSecs}s Hold` : ''}
                      </span>
                    </div>
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

      {/* Delete confirmation modal */}
      <ModalOverlay isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <Modal>
          <Dialog>
            <div className="p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold text-primary mb-2">Delete Program?</h2>
              <p className="text-sm text-secondary mb-6">
                This will permanently delete <strong>{prog.name}</strong>. This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button color="secondary" size="sm" onPress={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary-destructive" size="sm" onPress={handleDelete}>
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
