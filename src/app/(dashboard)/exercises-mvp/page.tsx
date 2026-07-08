'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Select, Tooltip, Checkbox } from 'antd';
import type { ComponentType } from 'react';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { mockExercises } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import type { Exercise } from '@/lib/types';
import { ArrowLeft, Eye, Heart, Lightbulb, Plus, Scissors, Search, Smile, Stethoscope, Trophy, User, X, Zap } from 'lucide-react';

type IconType = ComponentType<{ style?: React.CSSProperties; size?: number; color?: string }>;

const SPECIALTIES: {
  id: string; name: string; apta: string; description: string;
  icon: IconType; color: string; bg: string; available: boolean; count: number;
}[] = [
  { id: 'pelvic-health', name: 'Pelvic Health', apta: "Pelvic & Women's Health", description: 'Pelvic floor, incontinence, prolapse, pain with sex, postpartum & pregnancy', icon: Heart, color: '#6750A4', bg: '#EDE7F6', available: true, count: 50 },
  { id: 'orthopaedics', name: 'Orthopaedics', apta: 'Orthopaedics', description: 'Spine, hip, knee, shoulder, and extremity rehabilitation', icon: User, color: '#0277BD', bg: '#E1F5FE', available: false, count: 0 },
  { id: 'sports', name: 'Sports & Performance', apta: 'Sports', description: 'Return to sport, athletic performance, and injury prevention', icon: Trophy, color: '#2E7D32', bg: '#E8F5E9', available: false, count: 0 },
  { id: 'neurology', name: 'Neurological Rehab', apta: 'Neurology', description: "Stroke, MS, Parkinson's, and spinal cord conditions", icon: Lightbulb, color: '#E65100', bg: '#FFF3E0', available: false, count: 0 },
  { id: 'cardio', name: 'Cardio & Respiratory', apta: 'Cardiovascular & Pulmonary', description: 'Cardiac rehabilitation and pulmonary physiotherapy', icon: Heart, color: '#C62828', bg: '#FFEBEE', available: false, count: 0 },
  { id: 'oncology', name: 'Cancer Care', apta: 'Oncology', description: 'Lymphoedema, post-mastectomy, and cancer-related fatigue', icon: Stethoscope, color: '#6A1B9A', bg: '#F3E5F5', available: false, count: 0 },
  { id: 'geriatrics', name: 'Ageing & Geriatrics', apta: 'Geriatrics', description: 'Falls prevention, balance, mobility, and frailty', icon: User, color: '#1565C0', bg: '#E8EAF6', available: false, count: 0 },
  { id: 'paediatrics', name: 'Paediatrics', apta: 'Pediatrics', description: "Children's physiotherapy and developmental conditions", icon: Smile, color: '#F57F17', bg: '#FFF8E1', available: false, count: 0 },
  { id: 'vestibular', name: 'Vestibular & Balance', apta: 'Vestibular', description: 'BPPV, vertigo, and vestibular rehabilitation', icon: Zap, color: '#00695C', bg: '#E0F2F1', available: false, count: 0 },
  { id: 'wound', name: 'Wound & Skin', apta: 'Wound Management', description: 'Wound care, scar management, and skin rehabilitation', icon: Scissors, color: '#4E342E', bg: '#EFEBE9', available: false, count: 0 },
  { id: 'hand', name: 'Hand & Upper Limb', apta: 'Hands', description: 'Fine motor rehabilitation, hand therapy, and upper extremity', icon: User, color: '#37474F', bg: '#ECEFF1', available: false, count: 0 },
  { id: 'electrophysiology', name: 'Electrophysiology', apta: 'Clinical Electrophysiology', description: 'Pain science, neuromodulation, and electrophysiology', icon: Zap, color: '#880E4F', bg: '#FCE4EC', available: false, count: 0 },
];

type SpecialtyFilters = { conditionLabel: string; conditions: string[]; categories: string[] };

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

const SEARCH_ALIASES: Record<string, string> = {
  sui: 'Stress Urinary Incontinence', uui: 'Urge Urinary Incontinence',
  oab: 'Overactive Bladder', 'ic-bps': 'Bladder Pain Syndrome',
  ic: 'Bladder Pain', pop: 'Pelvic Organ Prolapse',
  dra: 'Diastasis Recti', pgp: 'Pelvic Girdle Pain', pfmt: 'Pelvic Floor Muscle Training',
};

const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Newest Added'];

const GROUP_NAMES: Record<string, string> = {
  'pelvic-floor': 'Pelvic Floor',
  'core-breathing': 'Core Breathing',
  'breathing': 'Breathing',
  'transversus': 'Transversus',
  'deadbug': 'Deadbug',
  'pelvic-tilt': 'Pelvic Tilt',
  'plank': 'Plank',
  'glute-bridge': 'Glute Bridge',
  'childs-pose': "Child's Pose",
  'squat': 'Squat',
  'bowel': 'Bowel',
  'csection-massage': 'C-Section Massage',
  'perineal-massage': 'Perineal Massage',
};

const { Title, Text } = Typography;

function expandSearch(q: string) { return SEARCH_ALIASES[q.toLowerCase().trim()] ?? q; }

// ── Specialty landing ─────────────────────────────────────────────────────────

function SpecialtyGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Select a specialty to browse exercises.</Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {SPECIALTIES.map((sp) => {
          const Icon = sp.icon;
          return (
            <div key={sp.id} onClick={() => onSelect(sp.id)} style={{ border: `1px solid ${sp.available ? sp.color + '44' : '#E0E0E0'}`, borderRadius: 8, padding: 20, cursor: 'pointer', background: '#FFFFFF', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: sp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={sp.color} />
                </div>
                {sp.available
                  ? <Tag style={{ fontSize: 11, background: sp.bg, color: sp.color, fontWeight: 600, border: 'none' }}>{`${sp.count} exercises`}</Tag>
                  : <Tag style={{ fontSize: 11, color: '#BDBDBD', background: 'rgba(0,0,0,0.04)', border: 'none' }}>Coming soon</Tag>}
              </div>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>{sp.name}</Text>
              <Text type="secondary" style={{ display: 'block', lineHeight: 1.4, fontSize: 12 }}>{sp.description}</Text>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComingSoonState({ sp }: { sp: typeof SPECIALTIES[0] }) {
  const Icon = sp.icon;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', borderRadius: 8, border: '2px dashed #E0E0E0', background: sp.bg + '44' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: sp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon size={28} color={sp.color} />
      </div>
      <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>{sp.name}</Title>
      <Text type="secondary" style={{ maxWidth: 380, textAlign: 'center', marginBottom: 16 }}>{sp.description}</Text>
      <Tag style={{ background: sp.bg, color: sp.color, fontWeight: 600, marginBottom: 8, border: 'none' }}>Coming Soon</Tag>
      <Text type="secondary" style={{ fontSize: 12 }}>APTA: {sp.apta}</Text>
    </div>
  );
}

// ── Filter panel section ──────────────────────────────────────────────────────

function FilterSection({ title, activeCount, onClear, children }: { title: string; activeCount: number; onClear: () => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #F0F0F0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text strong style={{ fontSize: 13 }}>{title}</Text>
        {activeCount > 0 && (
          <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#BDBDBD', display: 'flex', lineHeight: 1 }}>
            <X size={13} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }} onClick={onChange}>
      <Checkbox checked={checked} onChange={onChange} onClick={(e) => e.stopPropagation()} />
      <Text style={{ fontSize: 13, lineHeight: 1.3 }}>{label}</Text>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const router = useRouter();
  const viewMode = useViewMode();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveSelectedId = viewMode === 'mvp' ? 'pelvic-health' : selectedId;
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterLevels, setFilterLevels] = useState<string[]>([]);
  const [filterEquipment, setFilterEquipment] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMoreConditions, setShowMoreConditions] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const specialty = SPECIALTIES.find((s) => s.id === effectiveSelectedId) ?? null;
  const filterConfig = effectiveSelectedId ? SPECIALTY_FILTER_CONFIG[effectiveSelectedId] : null;

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const goBack = () => { setSelectedId(null); setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setShowFavoritesOnly(false); };
  const selectSpecialty = (id: string) => { setSelectedId(id); setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setShowFavoritesOnly(false); };
  const clearFilters = () => { setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setShowFavoritesOnly(false); };

  const effectiveSearch = expandSearch(search);
  const hasFilters = !!search || filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || showFavoritesOnly;

  const filtered = useMemo(() => {
    if (!specialty?.available) return [];
    return mockExercises.filter((ex) => {
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
    }).sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Used') return b.usageCount - a.usageCount;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [specialty, effectiveSearch, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, showFavoritesOnly, favorites]);

  const levelColor = (l: string) => l === 'Beginner' ? { bg: '#E8F5E9', color: '#2E7D32' } : l === 'Intermediate' ? { bg: '#FFF8E1', color: '#F57F17' } : { bg: '#FFF3E0', color: '#E65100' };

  type DisplayItem =
    | { kind: 'single'; ex: Exercise }
    | { kind: 'group'; groupId: string; groupName: string; representative: Exercise; totalCount: number };

  const displayItems = useMemo((): DisplayItem[] => {
    const seenGroups = new Set<string>();
    const items: DisplayItem[] = [];
    for (const ex of filtered) {
      if (!ex.variationGroup) {
        items.push({ kind: 'single', ex });
      } else if (!seenGroups.has(ex.variationGroup)) {
        seenGroups.add(ex.variationGroup);
        const totalCount = mockExercises.filter((e) => e.variationGroup === ex.variationGroup).length;
        items.push({ kind: 'group', groupId: ex.variationGroup, groupName: GROUP_NAMES[ex.variationGroup] ?? ex.variationGroup, representative: ex, totalCount });
      }
    }
    return items;
  }, [filtered]);

  const breadcrumbs = specialty ? [{ label: 'All Exercises' }, { label: specialty.name }] : [{ label: 'All Exercises' }];

  const visibleConditions = filterConfig
    ? (showMoreConditions ? filterConfig.conditions : filterConfig.conditions.slice(0, 7))
    : [];

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      <div style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {specialty && viewMode === 'full' && <Button type="text" size="small" onClick={goBack} icon={<ArrowLeft />} style={{ color: '#49454F' }} />}
            <div>
              <Title level={2} style={{ margin: 0 }}>{viewMode === 'mvp' ? 'Exercises' : (specialty ? specialty.name : 'Exercises')}</Title>
              {specialty && viewMode === 'full' && <Text type="secondary" style={{ fontSize: 12 }}>{specialty.apta}</Text>}
            </div>
          </div>
          <Button type="primary" icon={<Plus />} onClick={() => router.push('/exercises/new')}>Create New</Button>
        </div>

        {!specialty && viewMode === 'full' && <SpecialtyGrid onSelect={selectSpecialty} />}
        {specialty && !specialty.available && <ComingSoonState sp={specialty} />}

        {specialty && specialty.available && (
          <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>

            {/* ── Left filter panel ── */}
            <div style={{ width: 232, flexShrink: 0, paddingRight: 24, borderRight: '1px solid #E0E0E0', marginRight: 28 }}>

              {/* Panel header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F0F0F0' }}>
                <Text strong style={{ fontSize: 14 }}>Filters</Text>
                {hasFilters && (
                  <Button type="text" size="small" onClick={clearFilters} style={{ fontSize: 12, color: '#6750A4', padding: '0 4px' }}>Clear all</Button>
                )}
              </div>

              {/* Favourites */}
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #F0F0F0' }}>
                <CheckRow label="Favourites only" checked={showFavoritesOnly} onChange={() => setShowFavoritesOnly((v) => !v)} />
              </div>

              {/* Condition */}
              {filterConfig && (
                <FilterSection title={filterConfig.conditionLabel} activeCount={filterConditions.length} onClear={() => setFilterConditions([])}>
                  {visibleConditions.map((c) => (
                    <CheckRow key={c} label={c} checked={filterConditions.includes(c)} onChange={() => toggleArr(filterConditions, c, setFilterConditions)} />
                  ))}
                  {filterConfig.conditions.length > 7 && (
                    <Button type="link" size="small" onClick={() => setShowMoreConditions((v) => !v)} style={{ padding: 0, fontSize: 12, height: 'auto' }}>
                      {showMoreConditions ? 'Show less' : `+${filterConfig.conditions.length - 7} more`}
                    </Button>
                  )}
                </FilterSection>
              )}

              {/* Category */}
              {filterConfig && (
                <FilterSection title="Category" activeCount={filterCategories.length} onClear={() => setFilterCategories([])}>
                  {filterConfig.categories.map((c) => (
                    <CheckRow key={c} label={c} checked={filterCategories.includes(c)} onChange={() => toggleArr(filterCategories, c, setFilterCategories)} />
                  ))}
                </FilterSection>
              )}

              {/* Level */}
              <FilterSection title="Level" activeCount={filterLevels.length} onClear={() => setFilterLevels([])}>
                {ALL_LEVELS.map((l) => (
                  <CheckRow key={l} label={l} checked={filterLevels.includes(l)} onChange={() => toggleArr(filterLevels, l, setFilterLevels)} />
                ))}
              </FilterSection>

              {/* Equipment */}
              <FilterSection title="Equipment" activeCount={filterEquipment.length} onClear={() => setFilterEquipment([])}>
                {ALL_EQUIPMENT.map((eq) => (
                  <CheckRow key={eq} label={eq} checked={filterEquipment.includes(eq)} onChange={() => toggleArr(filterEquipment, eq, setFilterEquipment)} />
                ))}
              </FilterSection>
            </div>

            {/* ── Right content ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Top bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                <Input
                  placeholder="Search exercises, SUI, OAB…"
                  style={{ flex: 1 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  prefix={<Search size={14} style={{ color: '#9E9E9E' }} />}
                  allowClear
                />
                <Select value={sortBy} onChange={setSortBy} style={{ minWidth: 140 }} options={SORT_OPTIONS.map((o) => ({ value: o, label: o }))} />
              </div>

              <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 12 }}>
                {filtered.length} exercise{filtered.length !== 1 ? 's' : ''} · {displayItems.length} card{displayItems.length !== 1 ? 's' : ''} shown
              </Text>

              {/* Grid */}
              {displayItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>No exercises match your filters.</Text>
                  <Button size="small" onClick={clearFilters}>Clear filters</Button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {displayItems.map((item) => {
                    if (item.kind === 'single') {
                      const ex = item.ex;
                      const lc = levelColor(ex.level);
                      return (
                        <Card key={ex.id} hoverable styles={{ body: { padding: 0 } }} style={{ overflow: 'hidden' }} onClick={() => router.push(`/exercises/${ex.id}`)}>
                          <div style={{ height: 130, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <Zap size={36} color="#6750A4" />
                            <div style={{ position: 'absolute', top: 8, right: 8 }} onClick={(e) => e.stopPropagation()}>
                              <Tooltip title={favorites.has(ex.id) ? 'Unfavourite' : 'Favourite'}>
                                <Button type="text" size="small" style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 6 }} icon={favorites.has(ex.id) ? <Heart size={14} style={{ color: '#E91E63' }} fill="#E91E63" /> : <Heart size={14} />} onClick={() => toggleFavorite(ex.id)} />
                              </Tooltip>
                            </div>
                          </div>
                          <div style={{ padding: '12px 14px 14px' }}>
                            <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13, lineHeight: 1.3 }}>{ex.name}</Text>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                              <Tag style={{ fontSize: 11, border: 'none', background: lc.bg, color: lc.color, margin: 0 }}>{ex.level}</Tag>
                              {ex.equipment !== 'None' && <Tag style={{ fontSize: 11, margin: 0 }}>{ex.equipment}</Tag>}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>{ex.category}</Text>
                              <div onClick={(e) => e.stopPropagation()}>
                                <Tooltip title="Preview"><Button type="text" size="small" icon={<Eye size={14} />} onClick={() => setPreviewExercise(ex)} /></Tooltip>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    }

                    // Group card
                    const { representative: rep, groupName: gName, totalCount } = item;
                    return (
                      <Card key={item.groupId} hoverable styles={{ body: { padding: 0 } }} style={{ overflow: 'hidden' }} onClick={() => router.push(`/exercises/${rep.id}`)}>
                        {/* Stacked thumbnail effect */}
                        <div style={{ height: 130, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 28px)', height: '100%', background: '#DDD6F3', borderRadius: '6px 6px 0 0', zIndex: 0 }} />
                          <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 16px)', height: '100%', background: '#E8E2F8', borderRadius: '6px 6px 0 0', zIndex: 1 }} />
                          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                            <Zap size={36} color="#6750A4" />
                          </div>
                          <Tag style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 3, background: '#6750A4', color: 'white', border: 'none', fontWeight: 600, fontSize: 11, margin: 0 }}>
                            {totalCount} variations
                          </Tag>
                          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 4 }} onClick={(e) => e.stopPropagation()}>
                            <Tooltip title={favorites.has(rep.id) ? 'Unfavourite' : 'Favourite'}>
                              <Button type="text" size="small" style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 6 }} icon={favorites.has(rep.id) ? <Heart size={14} style={{ color: '#E91E63' }} fill="#E91E63" /> : <Heart size={14} />} onClick={() => toggleFavorite(rep.id)} />
                            </Tooltip>
                          </div>
                        </div>
                        <div style={{ padding: '12px 14px 14px' }}>
                          <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13, lineHeight: 1.3 }}>{gName}</Text>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                            <Tag style={{ fontSize: 11, margin: 0 }}>{rep.category}</Tag>
                          </div>
                          <Text type="secondary" style={{ fontSize: 11 }}>Select a variation on the detail page</Text>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ExercisePreviewDrawer exercise={previewExercise} open={!!previewExercise} onClose={() => setPreviewExercise(null)} />
    </>
  );
}
