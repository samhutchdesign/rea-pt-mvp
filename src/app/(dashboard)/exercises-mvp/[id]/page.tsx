'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Tag, Divider } from 'antd';
import TopBar from '@/components/layout/TopBar';
import { mockExercises, mockPrograms } from '@/lib/mock-data';
import { ChevronRight, Heart, Pencil, Zap } from 'lucide-react';

const { Title, Text } = Typography;

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const ex = mockExercises.find((e) => e.id === id);
  const [isFavorite, setIsFavorite] = useState(ex?.isFavorite ?? false);

  if (!ex) return <div style={{ padding: 32 }}><Text>Exercise not found.</Text></div>;

  const allTags = [...new Set([...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart])];

  const prescriptionTag = (label: string) => (
    <Tag key={label} style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontWeight: 600 }}>{label}</Tag>
  );

  const usedInPrograms = mockPrograms.filter((prog) => prog.exercises.some((pe) => pe.exerciseId === id));

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises', href: '/exercises' }, { label: ex.name }]} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 820 }}>

        {/* Video */}
        {ex.videoUrl ? (
          <div style={{ width: '100%', height: 360, borderRadius: 8, overflow: 'hidden', marginBottom: 24, background: '#0f0f0f' }}>
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
          <div style={{ width: '100%', height: 300, borderRadius: 8, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <Zap size={64} color="#6750A4" />
              <div style={{ marginTop: 8 }}>
                <Button type="primary" icon={<ChevronRight size={14} />}>Play Video</Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>{ex.name}</Title>
            <Text type="secondary">{ex.description}</Text>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="text"
              shape="circle"
              onClick={() => setIsFavorite(!isFavorite)}
              icon={isFavorite ? <Heart size={16} fill="#E91E63" color="#E91E63" /> : <Heart size={16} />}
            />
            <Button icon={<Pencil size={14} />} onClick={() => router.push(`/exercises/new?edit=${id}`)}>Edit</Button>
          </div>
        </div>

        {/* Prescription chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {prescriptionTag(`${ex.defaultSets} Sets`)}
          {prescriptionTag(`${ex.defaultReps} Reps`)}
          {ex.defaultHoldSecs > 0 && prescriptionTag(`${ex.defaultHoldSecs}s Hold`)}
          {prescriptionTag(ex.defaultFrequency)}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {allTags.map((tag) => <Tag key={tag} style={{ fontSize: 12 }}>{tag}</Tag>)}
        </div>

        <Divider style={{ marginBottom: 24 }} />

        {/* Programs using this exercise */}
        {usedInPrograms.length > 0 && (
          <>
            <Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>Used in Programs</Title>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {usedInPrograms.map((prog) => (
                <Tag
                  key={prog.id}
                  onClick={() => router.push(`/programs/${prog.id}`)}
                  style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontWeight: 500, cursor: 'pointer' }}
                >
                  {prog.name}
                </Tag>
              ))}
            </div>
            <Divider style={{ marginBottom: 24 }} />
          </>
        )}

        {/* Instructions */}
        <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>Instructions</Title>
        <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
          {ex.instructions.map((step, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <Text>{step}</Text>
            </li>
          ))}
        </ol>

        <Divider style={{ marginBottom: 24 }} />

        {/* Common mistakes */}
        <Title level={3} style={{ marginTop: 0, marginBottom: 16, color: '#FB8C00' }}>Common Mistakes</Title>
        <ul style={{ paddingLeft: 24 }}>
          {ex.commonMistakes.map((m, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <Text>{m}</Text>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
