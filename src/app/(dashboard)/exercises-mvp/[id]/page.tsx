'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { Divider } from '@/components/ui/divider';
import { mockExercises, mockPrograms } from '@/lib/mock-data';
import { ChevronRight, Heart, Pencil, Zap } from 'lucide-react';

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const ex = mockExercises.find((e) => e.id === id);
  const [isFavorite, setIsFavorite] = useState(ex?.isFavorite ?? false);

  if (!ex) return (
    <div className="p-8">
      <p className="text-secondary">Exercise not found.</p>
    </div>
  );

  const allTags = [...new Set([...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart])];

  const prescriptionTag = (label: string) => (
    <span key={label} className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
      {label}
    </span>
  );

  const usedInPrograms = mockPrograms.filter((prog) => prog.exercises.some((pe) => pe.exerciseId === id));

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises', href: '/exercises' }, { label: ex.name }]} />
      <div className="p-8 max-w-[820px]">

        {/* Video */}
        {ex.videoUrl ? (
          <div className="mb-6 w-full h-[360px] rounded-lg overflow-hidden bg-[#0f0f0f]">
            <iframe
              src={`https://www.youtube.com/embed/${ex.videoUrl}?rel=0&modestbranding=1`}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none', display: 'block' }}
            />
          </div>
        ) : (
          <div className="mb-6 w-full h-[300px] rounded-lg bg-[#EDE7F6] flex items-center justify-center">
            <div className="text-center">
              <Zap size={64} color="#6750A4" />
              <div className="mt-2">
                <Button color="primary" size="sm" iconLeading={ChevronRight}>Play Video</Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h2 className="mt-0 mb-1 text-2xl font-bold text-primary">{ex.name}</h2>
            <p className="text-sm text-secondary">{ex.description}</p>
          </div>
          <div className="flex gap-2 ml-4 shrink-0">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary bg-primary shadow-xs hover:bg-secondary transition-colors"
            >
              {isFavorite
                ? <Heart size={16} fill="#E91E63" color="#E91E63" />
                : <Heart size={16} className="text-secondary" />}
            </button>
            <Button color="secondary" size="sm" iconLeading={Pencil} onPress={() => router.push(`/exercises/new?edit=${id}`)}>Edit</Button>
          </div>
        </div>

        {/* Prescription chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          {prescriptionTag(`${ex.defaultSets} Sets`)}
          {prescriptionTag(`${ex.defaultReps} Reps`)}
          {ex.defaultHoldSecs > 0 && prescriptionTag(`${ex.defaultHoldSecs}s Hold`)}
          {prescriptionTag(ex.defaultFrequency)}
        </div>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-md border border-secondary bg-secondary px-2.5 py-1 text-xs text-secondary">
              {tag}
            </span>
          ))}
        </div>

        <Divider className="mb-6" />

        {/* Programs using this exercise */}
        {usedInPrograms.length > 0 && (
          <>
            <h3 className="mt-0 mb-3 text-lg font-semibold text-primary">Used in Programs</h3>
            <div className="mb-6 flex flex-wrap gap-2">
              {usedInPrograms.map((prog) => (
                <button
                  key={prog.id}
                  onClick={() => router.push(`/programs/${prog.id}`)}
                  className="inline-flex items-center rounded-md bg-[#EDE7F6] px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-[#DDD6F3] transition-colors"
                >
                  {prog.name}
                </button>
              ))}
            </div>
            <Divider className="mb-6" />
          </>
        )}

        {/* Instructions */}
        <h3 className="mt-0 mb-4 text-lg font-semibold text-primary">Instructions</h3>
        <ol className="mb-6 pl-6">
          {ex.instructions.map((step, i) => (
            <li key={i} className="mb-2 text-sm text-primary">{step}</li>
          ))}
        </ol>

        <Divider className="mb-6" />

        {/* Common mistakes */}
        <h3 className="mt-0 mb-4 text-lg font-semibold" style={{ color: '#FB8C00' }}>Common Mistakes</h3>
        <ul className="pl-6">
          {ex.commonMistakes.map((m, i) => (
            <li key={i} className="mb-2 text-sm text-primary">{m}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
