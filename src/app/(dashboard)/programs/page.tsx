'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Select, Tooltip, Checkbox } from 'antd';
import TopBar from '@/components/layout/TopBar';
import { mockPrograms } from '@/lib/mock-data';
import { Heart, Plus, Search, X, Zap } from 'lucide-react';

const { Title, Text } = Typography;

const ALL_TAGS = ['Pelvic Floor', 'Postpartum', 'Incontinence', 'Pelvic Pain', 'Beginner', 'Intermediate', 'Relaxation'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Exercises', 'Newest Added'];

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
      <Text style={{ fontSize: 13 }}>{label}</Text>
    </div>
  );
}

export default function ProgramsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockPrograms.filter((p) => p.isFavorite).map((p) => p.id)));

  const toggleFavorite = (id: string) => setFavorites((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleTag = (t: string) => setFilterTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  const clearFilters = () => { setSearch(''); setFilterTags([]); setShowFavoritesOnly(false); };
  const hasFilters = !!search || filterTags.length > 0 || showFavoritesOnly;

  const filtered = useMemo(() => {
    return mockPrograms.filter((p) => {
      if (showFavoritesOnly && !favorites.has(p.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (filterTags.length && !filterTags.some((t) => p.tags.includes(t))) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Exercises') return b.exercises.length - a.exercises.length;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [search, sortBy, filterTags, showFavoritesOnly, favorites]);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs' }]} />
      <div style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Programs</Title>
          <Button type="primary" icon={<Plus />} onClick={() => router.push('/programs/new')}>Create New Program</Button>
        </div>

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

            {/* Tags */}
            <FilterSection title="Tags" activeCount={filterTags.length} onClear={() => setFilterTags([])}>
              {ALL_TAGS.map((t) => (
                <CheckRow key={t} label={t} checked={filterTags.includes(t)} onChange={() => toggleTag(t)} />
              ))}
            </FilterSection>
          </div>

          {/* ── Right content ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Top bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <Input
                placeholder="Search programs…"
                style={{ flex: 1 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                prefix={<Search size={14} style={{ color: '#9E9E9E' }} />}
                allowClear
              />
              <Select value={sortBy} onChange={setSortBy} style={{ minWidth: 150 }} options={SORT_OPTIONS.map((o) => ({ value: o, label: o }))} />
            </div>

            <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 12 }}>
              {filtered.length} of {mockPrograms.length} programs
            </Text>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>No programs match your filters.</Text>
                <Button size="small" onClick={clearFilters}>Clear filters</Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {filtered.map((prog) => (
                  <Card
                    key={prog.id}
                    hoverable
                    styles={{ body: { padding: 0 } }}
                    style={{ overflow: 'hidden' }}
                    onClick={() => router.push(`/programs/${prog.id}`)}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: 110, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <Zap size={32} color="#6750A4" />
                      <div style={{ position: 'absolute', top: 8, right: 8 }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title={favorites.has(prog.id) ? 'Unfavourite' : 'Favourite'}>
                          <Button
                            type="text"
                            size="small"
                            style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 6 }}
                            icon={favorites.has(prog.id) ? <Heart size={14} style={{ color: '#E91E63' }} fill="#E91E63" /> : <Heart size={14} />}
                            onClick={() => toggleFavorite(prog.id)}
                          />
                        </Tooltip>
                      </div>
                      <Tag style={{ position: 'absolute', bottom: 8, left: 8, background: '#6750A4', color: 'white', border: 'none', fontWeight: 500, fontSize: 11, margin: 0 }}>
                        {prog.exercises.length} exercises
                      </Tag>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '12px 14px 14px' }}>
                      <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 13, lineHeight: 1.3 }}>{prog.name}</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 10, lineHeight: 1.4 }}>{prog.description}</Text>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {prog.tags.map((t) => <Tag key={t} style={{ fontSize: 11, margin: 0 }}>{t}</Tag>)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
