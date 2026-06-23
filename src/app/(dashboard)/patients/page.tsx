'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Avatar, Tabs, Select, App } from 'antd';
import type { ComponentType } from 'react';
import TopBar from '@/components/layout/TopBar';
import AddPatientDialog from '@/components/patients/AddPatientDialog';
import { mockChartSessions } from '@/lib/mock-data';
import { useLocationScope, useYourEmpId } from '@/lib/locationScope';
import type { Patient } from '@/lib/types';
import { Calendar, MapPin, Plus, RefreshCw, RotateCcw, Search, User } from 'lucide-react';

const { Title, Text } = Typography;

function computeEstimatedNext(patientId: string): number {
  const sessions = mockChartSessions[patientId] ?? [];
  if (sessions.length === 0) return Infinity;
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const lastTs = new Date(sorted[sorted.length - 1].date + 'T12:00:00').getTime();
  let avgGapDays: number;
  if (sorted.length === 1) {
    avgGapDays = 14;
  } else {
    let total = 0;
    for (let i = 1; i < sorted.length; i++) {
      total += (new Date(sorted[i].date + 'T12:00:00').getTime() - new Date(sorted[i - 1].date + 'T12:00:00').getTime()) / 86400000;
    }
    avgGapDays = total / (sorted.length - 1);
  }
  return lastTs + avgGapDays * 86400000;
}

function conditionChip(patient: Patient): string | null {
  const text = patient.injuryHistory?.mechanism;
  if (!text) return null;
  return text.length > 32 ? text.slice(0, 32).replace(/\s\S*$/, '') + '…' : text;
}

function sessionInfo(patient: Patient): { lastSeen: string | null; count: number } {
  const sessions = mockChartSessions[patient.id] ?? [];
  if (!sessions.length) return { lastSeen: null, count: 0 };
  const latest = sessions.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastSeen = new Date(latest.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { lastSeen, count: sessions.length };
}

const SORT_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'a-z', label: 'A → Z' },
  { value: 'z-a', label: 'Z → A' },
  { value: 'location', label: 'Location' },
];

export default function PatientsPage() {
  const router = useRouter();
  const { message: messageApi } = App.useApp();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [sort, setSort] = useState('newest');
  const [addOpen, setAddOpen] = useState(false);
  const [localPatients, setLocalPatients] = useState<Record<string, boolean>>({});

  const { patients: scopedPatients } = useLocationScope();
  const yourEmpId = useYourEmpId();

  // Apply local archived overrides
  const patients = scopedPatients.map((p) =>
    p.id in localPatients ? { ...p, archived: localPatients[p.id] } : p
  );

  const yourPatients = yourEmpId
    ? patients.filter((p) => !p.archived && p.assignedEmployeeIds.includes(yourEmpId))
    : [];
  const allActive = patients.filter((p) => !p.archived);
  const archived = patients.filter((p) => p.archived);

  const showYoursTab = yourEmpId !== null;
  const tabList = showYoursTab ? [yourPatients, allActive, archived] : [allActive, archived];

  // Reset to tab 0 when role changes and tab count changes to avoid out-of-range index
  useEffect(() => { setTab(0); }, [showYoursTab]);
  const currentList = tabList[tab] ?? allActive;

  const applySearch = (list: Patient[]) => {
    const q = search.toLowerCase();
    if (!q) return list;
    return list.filter((p) =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  };

  const applySort = (list: Patient[]) => {
    const sorted = [...list];
    if (sort === 'upcoming') sorted.sort((a, b) => computeEstimatedNext(a.id) - computeEstimatedNext(b.id));
    else if (sort === 'a-z') sorted.sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName));
    else if (sort === 'z-a') sorted.sort((a, b) => b.firstName.localeCompare(a.firstName) || b.lastName.localeCompare(a.lastName));
    else if (sort === 'location') sorted.sort((a, b) => a.location.localeCompare(b.location));
    else if (sort === 'oldest') sorted.sort((a, b) => a.id.localeCompare(b.id));
    else sorted.sort((a, b) => b.id.localeCompare(a.id));
    return sorted;
  };

  const displayed = applySort(applySearch(currentList));

  const restore = (patient: Patient) => {
    setLocalPatients((prev) => ({ ...prev, [patient.id]: false }));
    messageApi.success(`${patient.firstName} ${patient.lastName} restored to active.`);
  };

  const searchPlaceholders = showYoursTab
    ? ['Search your patients…', 'Search all patients…', 'Search archived patients…']
    : ['Search all patients…', 'Search archived patients…'];
  const empty = displayed.length === 0;
  const emptyMessages = showYoursTab
    ? ['No patients assigned to you yet', 'No active patients found', 'No archived patients found']
    : ['No active patients found', 'No archived patients found'];

  const tabItems = [
    ...(showYoursTab ? [{ key: '0', label: `Your Patients (${yourPatients.length})` }] : []),
    { key: showYoursTab ? '1' : '0', label: `All (${allActive.length})` },
    { key: showYoursTab ? '2' : '1', label: `Archived (${archived.length})` },
  ];

  const archivedTabIndex = showYoursTab ? 2 : 1;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Patients' }]} />
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Patients</Title>
          <Button type="primary" icon={<Plus />} onClick={() => setAddOpen(true)}>
            Add New Patient
          </Button>
        </div>

        <Tabs
          activeKey={String(tab)}
          onChange={(k) => { setTab(Number(k)); setSearch(''); }}
          style={{ marginBottom: 24 }}
          items={tabItems}
        />

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <Input
            placeholder={searchPlaceholders[tab]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 340 }}
            prefix={<Search style={{ color: '#9E9E9E' }} />}
          />
          {tab !== archivedTabIndex && (
            <Select
              value={sort}
              onChange={setSort}
              style={{ minWidth: 140 }}
              options={SORT_OPTIONS}
            />
          )}
        </div>

        {empty ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <User size={48} />
            <div><Text type="secondary">{emptyMessages[tab]}</Text></div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayed.map((patient) => (
              <Card
                key={patient.id}
                hoverable
                styles={{ body: { padding: 0 } }}
                style={{ opacity: patient.archived ? 0.75 : 1 }}
                onClick={() => router.push(`/patients/${patient.id}/overview`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px' }}>
                  <Avatar style={{ background: '#EDE7F6', color: '#6750A4', fontWeight: 600, width: 44, height: 44 }}>
                    {patient.avatarInitials}
                  </Avatar>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <Text strong style={{ display: 'block' }}>{patient.firstName} {patient.lastName}</Text>
                    <Text type="secondary">{patient.email}</Text>
                    {conditionChip(patient) && (
                      <div style={{ marginTop: 6 }}>
                        <Tag style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontSize: '0.72rem', fontWeight: 500 }}>
                          {conditionChip(patient)}
                        </Tag>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    {(() => {
                      const { lastSeen, count } = sessionInfo(patient);
                      const rows: { icon: ComponentType<{ style?: React.CSSProperties; size?: number; color?: string }>; text: string }[] = [
                        { icon: MapPin, text: patient.location },
                        { icon: Calendar, text: lastSeen ? `Last seen ${lastSeen}` : 'No sessions yet' },
                        { icon: RefreshCw, text: count > 0 ? `${count} session${count !== 1 ? 's' : ''}` : '—' },
                      ];
                      return rows.map(({ icon: Icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon size={12} color={'#BDBDBD'} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{text}</Text>
                        </div>
                      ));
                    })()}
                    {tab === archivedTabIndex && (
                      <Button
                        size="small"
                        icon={<RotateCcw />}
                        onClick={(e) => { e.stopPropagation(); restore(patient); }}
                        style={{ marginTop: 4 }}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddPatientDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
