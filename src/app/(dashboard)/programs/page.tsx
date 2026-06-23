'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Select, Tooltip } from 'antd';
import TopBar from '@/components/layout/TopBar';
import FilterMenu from '@/components/exercises/FilterMenu';
import { mockPrograms } from '@/lib/mock-data';
import { Heart, Plus, Search, Zap } from 'lucide-react';

const { Title, Text } = Typography;

const ALL_TAGS = ['Pelvic Floor', 'Postpartum', 'Incontinence', 'Pelvic Pain', 'Beginner', 'Intermediate', 'Relaxation'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Exercises', 'Newest Added'];

export default function ProgramsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockPrograms.filter((p) => p.isFavorite).map((p) => p.id)));

  const toggleFavorite = (id: string) => setFavorites((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const filtered = useMemo(() => {
    let progs = mockPrograms.filter((p) => {
      if (showFavoritesOnly && !favorites.has(p.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (filterTags.length && !filterTags.some((t) => p.tags.includes(t))) return false;
      return true;
    });
    progs = progs.sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Exercises') return b.exercises.length - a.exercises.length;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
    return progs;
  }, [search, sortBy, filterTags, showFavoritesOnly, favorites]);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs' }]} />
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Programs</Title>
          <Button type="primary" icon={<Plus />} onClick={() => router.push('/programs/new')}>Create New Program</Button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Search programs…"
            style={{ width: 280 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search style={{ color: '#9E9E9E' }} />}
          />
          <Tag.CheckableTag
            checked={showFavoritesOnly}
            onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{ border: '1px solid #E0E0E0', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Heart size={14} fill="currentColor" /> Favorites
          </Tag.CheckableTag>
          <FilterMenu label="Tag" options={ALL_TAGS} selected={filterTags} onChange={setFilterTags} />
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ minWidth: 150, marginLeft: 'auto' }}
            options={SORT_OPTIONS.map((o) => ({ value: o, label: o }))}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 ? (
            <Text type="secondary" style={{ padding: '32px 0', textAlign: 'center' }}>No programs match your filters.</Text>
          ) : filtered.map((prog) => (
            <Card
              key={prog.id}
              hoverable
              styles={{ body: { padding: 0 } }}
              onClick={() => router.push(`/programs/${prog.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={22} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text strong>{prog.name}</Text>
                    {favorites.has(prog.id) && <Heart size={14} fill="currentColor" />}
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>{prog.description}</Text>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {prog.tags.map((t) => <Tag key={t} style={{ fontSize: 11 }}>{t}</Tag>)}
                  </div>
                </div>
                <Tag style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontWeight: 500 }}>{`${prog.exercises.length} exercises`}</Tag>
                <Tooltip title={favorites.has(prog.id) ? 'Unfavorite' : 'Favorite'}>
                  <Button
                    type="text"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(prog.id); }}
                    icon={favorites.has(prog.id) ? <Heart style={{ color: '#E91E63' }} fill="currentColor" /> : <Heart />}
                  />
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
