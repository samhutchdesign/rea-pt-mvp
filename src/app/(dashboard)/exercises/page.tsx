'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Select, Tooltip } from 'antd';
import type { ComponentType } from 'react';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import FilterMenu from '@/components/exercises/FilterMenu';
import { mockExercises } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';
import { ArrowLeft, Eye, Heart, Lightbulb, Plus, Scissors, Search, Smile, Stethoscope, Trophy, User, Zap } from 'lucide-react';

type IconType = ComponentType<{ style?: React.CSSProperties }>;

// ── Specialties ───────────────────────────────────────────────────────────────

const SPECIALTIES: {
  id: string; name: string; apta: string; description: string;
  icon: IconType; color: string; bg: string; available: boolean; count: number;
}[] = [
  {
    id: 'pelvic-health',
    name: 'Pelvic Health',
    apta: "Pelvic & Women's Health",
    description: 'Pelvic floor, incontinence, prolapse, pain with sex, postpartum & pregnancy',
    icon: Heart,
    color: '#6750A4', bg: '#EDE7F6',
    available: true, count: 50,
  },
  {
    id: 'orthopaedics',
    name: 'Orthopaedics',
    apta: 'Orthopaedics',
    description: 'Spine, hip, knee, shoulder, and extremity rehabilitation',
    icon: User,
    color: '#0277BD', bg: '#E1F5FE',
    available: false, count: 0,
  },
  {
    id: 'sports',
    name: 'Sports & Performance',
    apta: 'Sports',
    description: 'Return to sport, athletic performance, and injury prevention',
    icon: Trophy,
    color: '#2E7D32', bg: '#E8F5E9',
    available: false, count: 0,
  },
  {
    id: 'neurology',
    name: 'Neurological Rehab',
    apta: 'Neurology',
    description: "Stroke, MS, Parkinson's, and spinal cord conditions",
    icon: Lightbulb,
    color: '#E65100', bg: '#FFF3E0',
    available: false, count: 0,
  },
  {
    id: 'cardio',
    name: 'Cardio & Respiratory',
    apta: 'Cardiovascular & Pulmonary',
    description: 'Cardiac rehabilitation and pulmonary physiotherapy',
    icon: Heart,
    color: '#C62828', bg: '#FFEBEE',
    available: false, count: 0,
  },
  {
    id: 'oncology',
    name: 'Cancer Care',
    apta: 'Oncology',
    description: 'Lymphoedema, post-mastectomy, and cancer-related fatigue',
    icon: Stethoscope,
    color: '#6A1B9A', bg: '#F3E5F5',
    available: false, count: 0,
  },
  {
    id: 'geriatrics',
    name: 'Ageing & Geriatrics',
    apta: 'Geriatrics',
    description: 'Falls prevention, balance, mobility, and frailty',
    icon: User,
    color: '#1565C0', bg: '#E8EAF6',
    available: false, count: 0,
  },
  {
    id: 'paediatrics',
    name: 'Paediatrics',
    apta: 'Pediatrics',
    description: "Children's physiotherapy and developmental conditions",
    icon: Smile,
    color: '#F57F17', bg: '#FFF8E1',
    available: false, count: 0,
  },
  {
    id: 'vestibular',
    name: 'Vestibular & Balance',
    apta: 'Vestibular',
    description: 'BPPV, vertigo, and vestibular rehabilitation',
    icon: Zap,
    color: '#00695C', bg: '#E0F2F1',
    available: false, count: 0,
  },
  {
    id: 'wound',
    name: 'Wound & Skin',
    apta: 'Wound Management',
    description: 'Wound care, scar management, and skin rehabilitation',
    icon: Scissors,
    color: '#4E342E', bg: '#EFEBE9',
    available: false, count: 0,
  },
  {
    id: 'hand',
    name: 'Hand & Upper Limb',
    apta: 'Hands',
    description: 'Fine motor rehabilitation, hand therapy, and upper extremity',
    icon: User,
    color: '#37474F', bg: '#ECEFF1',
    available: false, count: 0,
  },
  {
    id: 'electrophysiology',
    name: 'Electrophysiology',
    apta: 'Clinical Electrophysiology',
    description: 'Pain science, neuromodulation, and electrophysiology',
    icon: Zap,
    color: '#880E4F', bg: '#FCE4EC',
    available: false, count: 0,
  },
];

// ── Per-specialty filter config ───────────────────────────────────────────────

type SpecialtyFilters = {
  conditionLabel: string;
  conditions: string[];
  categories: string[];
};

const SPECIALTY_FILTER_CONFIG: Record<string, SpecialtyFilters> = {
  'pelvic-health': {
    conditionLabel: 'Condition',
    conditions: [
      'Urinary Incontinence', 'Urge Urinary Incontinence', 'Mixed Urinary Incontinence',
      'Overactive Bladder', 'Bladder Pain Syndrome',
      'Dyspareunia', 'Vaginismus', 'Vulvodynia', 'Vestibulodynia', 'Pudendal Neuralgia', 'Coccydynia',
      'Pelvic Organ Prolapse', 'Cystocele', 'Rectocele',
      'Constipation', 'Fecal Incontinence', 'Dyssynergic Defecation',
      'Postpartum Recovery', 'Pregnancy', 'Diastasis Recti', 'C-Section Recovery',
      'Low Back Pain', 'Pelvic Girdle Pain',
    ],
    categories: [
      'Pelvic Floor Muscle Training', 'Core / Transversus', 'Glute / Hip Strength',
      'Hip & Pelvic Mobility', 'Functional / Lower Extremity', 'Bowel & Anorectal',
      'Scar Tissue & Post-Surgical', 'Pelvic Pain & Hypertonic', 'Bladder Retraining',
    ],
  },
};

// Search abbreviation aliases
const SEARCH_ALIASES: Record<string, string> = {
  sui: 'Stress Urinary Incontinence',
  uui: 'Urge Urinary Incontinence',
  oab: 'Overactive Bladder',
  'ic-bps': 'Bladder Pain Syndrome',
  ic: 'Bladder Pain',
  pop: 'Pelvic Organ Prolapse',
  dra: 'Diastasis Recti',
  pgp: 'Pelvic Girdle Pain',
  pfmt: 'Pelvic Floor Muscle Training',
};

const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Newest Added'];

const { Title, Text } = Typography;

function expandSearch(q: string) {
  return SEARCH_ALIASES[q.toLowerCase().trim()] ?? q;
}

// ── Specialty landing grid ────────────────────────────────────────────────────

function SpecialtyGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Select a specialty to browse exercises.
      </Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {SPECIALTIES.map((sp) => {
          const Icon = sp.icon;
          return (
            <div
              key={sp.id}
              onClick={() => onSelect(sp.id)}
              style={{
                border: `1px solid ${sp.available ? sp.color + '44' : '#E0E0E0'}`,
                borderRadius: 8,
                padding: 20,
                cursor: 'pointer',
                background: '#FFFFFF',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: sp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ fontSize: 22, color: sp.color }} />
                </div>
                {sp.available ? (
                  <Tag style={{ fontSize: 11, background: sp.bg, color: sp.color, fontWeight: 600, border: 'none' }}>{`${sp.count} exercises`}</Tag>
                ) : (
                  <Tag style={{ fontSize: 11, color: '#BDBDBD', background: 'rgba(0,0,0,0.04)', border: 'none' }}>Coming soon</Tag>
                )}
              </div>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>{sp.name}</Text>
              <Text type="secondary" style={{ display: 'block', lineHeight: 1.4, fontSize: 12 }}>
                {sp.description}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Coming soon placeholder ───────────────────────────────────────────────────

function ComingSoonState({ sp }: { sp: typeof SPECIALTIES[0] }) {
  const Icon = sp.icon;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', borderRadius: 8, border: '2px dashed #E0E0E0', background: sp.bg + '44' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: sp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon style={{ fontSize: 30, color: sp.color }} />
      </div>
      <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>{sp.name}</Title>
      <Text type="secondary" style={{ maxWidth: 380, textAlign: 'center', marginBottom: 16 }}>
        {sp.description}
      </Text>
      <Tag style={{ background: sp.bg, color: sp.color, fontWeight: 600, marginBottom: 8, border: 'none' }}>Coming Soon</Tag>
      <Text type="secondary" style={{ fontSize: 12 }}>APTA: {sp.apta}</Text>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterLevels, setFilterLevels] = useState<string[]>([]);
  const [filterEquipment, setFilterEquipment] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const specialty = SPECIALTIES.find((s) => s.id === selectedId) ?? null;
  const filterConfig = selectedId ? SPECIALTY_FILTER_CONFIG[selectedId] : null;

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });

  const goBack = () => {
    setSelectedId(null);
    setSearch('');
    setFilterConditions([]);
    setFilterCategories([]);
    setFilterLevels([]);
    setFilterEquipment([]);
    setShowFavoritesOnly(false);
  };

  const selectSpecialty = (id: string) => {
    setSelectedId(id);
    setSearch('');
    setFilterConditions([]);
    setFilterCategories([]);
    setFilterLevels([]);
    setFilterEquipment([]);
    setShowFavoritesOnly(false);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterConditions([]);
    setFilterCategories([]);
    setFilterLevels([]);
    setFilterEquipment([]);
    setShowFavoritesOnly(false);
  };

  const effectiveSearch = expandSearch(search);
  const hasFilters = !!search || filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || showFavoritesOnly;

  const filtered = useMemo(() => {
    if (!specialty?.available) return [];
    const exs = mockExercises.filter((ex) => {
      if (showFavoritesOnly && !favorites.has(ex.id)) return false;
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        const allTags = [...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart];
        if (!ex.name.toLowerCase().includes(q) && !ex.category.toLowerCase().includes(q) && !allTags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (filterConditions.length && !filterConditions.some((c) => ex.tags.condition.some((ec) => ec.toLowerCase().includes(c.toLowerCase())))) return false;
      if (filterCategories.length && !filterCategories.includes(ex.category)) return false;
      if (filterLevels.length && !filterLevels.includes(ex.level)) return false;
      if (filterEquipment.length && !filterEquipment.includes(ex.equipment)) return false;
      return true;
    });
    return exs.sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Used') return b.usageCount - a.usageCount;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [specialty, effectiveSearch, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, showFavoritesOnly, favorites]);

  const breadcrumbs = specialty
    ? [{ label: 'All Exercises' }, { label: specialty.name }]
    : [{ label: 'All Exercises' }];

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      <div style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {specialty && (
              <Button type="text" size="small" onClick={goBack} icon={<ArrowLeft />} style={{ color: '#49454F' }} />
            )}
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {specialty ? specialty.name : 'Exercises'}
              </Title>
              {specialty && (
                <Text type="secondary" style={{ fontSize: 12 }}>{specialty.apta}</Text>
              )}
            </div>
          </div>
          <Button type="primary" icon={<Plus />} onClick={() => router.push('/exercises/new')}>
            Create New
          </Button>
        </div>

        {/* Landing: specialty grid */}
        {!specialty && <SpecialtyGrid onSelect={selectSpecialty} />}

        {/* Coming soon */}
        {specialty && !specialty.available && <ComingSoonState sp={specialty} />}

        {/* Exercise browser */}
        {specialty && specialty.available && (
          <>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap', paddingBottom: 16, borderBottom: '1px solid #E0E0E0' }}>
              <Input
                placeholder="Search exercises, SUI, OAB…"
                style={{ width: 260 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                prefix={<Search style={{ color: '#9E9E9E' }} />}
              />
              <Tag.CheckableTag
                checked={showFavoritesOnly}
                onChange={() => setShowFavoritesOnly((v) => !v)}
                style={{ border: '1px solid #E0E0E0', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Heart size={14} fill="currentColor" /> Favourites
              </Tag.CheckableTag>
              {filterConfig && (
                <FilterMenu
                  label={filterConfig.conditionLabel}
                  options={filterConfig.conditions}
                  selected={filterConditions}
                  onChange={setFilterConditions}
                />
              )}
              {filterConfig && (
                <FilterMenu
                  label="Category"
                  options={filterConfig.categories}
                  selected={filterCategories}
                  onChange={setFilterCategories}
                />
              )}
              <FilterMenu label="Level" options={ALL_LEVELS} selected={filterLevels} onChange={setFilterLevels} />
              <FilterMenu label="Equipment" options={ALL_EQUIPMENT} selected={filterEquipment} onChange={setFilterEquipment} />
              {hasFilters && (
                <Button type="text" size="small" onClick={clearFilters} style={{ color: '#49454F', fontSize: 13 }}>
                  Clear all
                </Button>
              )}
              <Select value={sortBy} onChange={setSortBy} style={{ minWidth: 130, marginLeft: 'auto' }} options={SORT_OPTIONS.map((o) => ({ value: o, label: o }))} />
            </div>

            <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 12 }}>
              {filtered.length} of {mockExercises.length} exercises
            </Text>

            {/* Exercise list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                  <div style={{ marginBottom: 8 }}><Text type="secondary">No exercises match your filters.</Text></div>
                  <Button size="small" onClick={clearFilters}>Clear filters</Button>
                </div>
              ) : filtered.map((ex) => (
                <Card
                  key={ex.id}
                  hoverable
                  styles={{ body: { padding: 0 } }}
                  onClick={() => router.push(`/exercises/${ex.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 24px' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={24} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text strong>{ex.name}</Text>
                        {favorites.has(ex.id) && <Heart size={14} fill="currentColor" />}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Tag style={{ fontSize: 11 }}>{ex.category}</Tag>
                        <Tag
                          style={{
                            fontSize: 11, border: 'none',
                            background: ex.level === 'Beginner' ? '#E8F5E9' : ex.level === 'Intermediate' ? '#FFF8E1' : '#FFF3E0',
                            color: ex.level === 'Beginner' ? '#2E7D32' : ex.level === 'Intermediate' ? '#F57F17' : '#E65100',
                          }}
                        >
                          {ex.level}
                        </Tag>
                        {ex.equipment !== 'None' && (
                          <Tag style={{ fontSize: 11 }}>{ex.equipment}</Tag>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Preview">
                        <Button type="text" size="small" onClick={() => setPreviewExercise(ex)} icon={<Eye />} />
                      </Tooltip>
                      <Tooltip title={favorites.has(ex.id) ? 'Unfavourite' : 'Favourite'}>
                        <Button type="text" size="small" onClick={() => toggleFavorite(ex.id)} icon={favorites.has(ex.id) ? <Heart style={{ color: '#E91E63' }} fill="currentColor" /> : <Heart />} />
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <ExercisePreviewDrawer exercise={previewExercise} open={!!previewExercise} onClose={() => setPreviewExercise(null)} />
    </>
  );
}
