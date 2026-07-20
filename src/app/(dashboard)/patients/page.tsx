'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import AddPatientDialog from '@/components/patients/AddPatientDialog';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Input } from '@/components/base/input/input';
import { cx } from '@/utils/cx';
import { mockChartSessions } from '@/lib/mock-data';
import { useLocationScope, useYourEmpId } from '@/lib/locationScope';
import { useRole } from '@/lib/roleStore';
import { useViewMode } from '@/lib/viewModeStore';
import { useDataState } from '@/lib/dataStateStore';
import { EmptyState } from '@/components/ui/empty-state';
import { NativeSelect } from '@/components/ui/native-select';
import type { Patient } from '@/lib/types';
import { Calendar, Map01, Plus, RefreshCw01, RefreshCcw01, SearchMd, User01 } from '@untitledui/icons';

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
  const dataState = useDataState();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [sort, setSort] = useState('newest');
  const [addOpen, setAddOpen] = useState(false);
  const [localPatients, setLocalPatients] = useState<Record<string, boolean>>({});

  const { patients: scopedPatients } = useLocationScope();
  const yourEmpId = useYourEmpId();
  const viewMode = useViewMode();
  const role = useRole();

  const MVP_HIDDEN = new Set(['pat8', 'pat1']);
  const patients = scopedPatients
    .filter((p) => !(viewMode === 'mvp' && MVP_HIDDEN.has(p.id)))
    .map((p) => p.id in localPatients ? { ...p, archived: localPatients[p.id] } : p);

  const yourPatients = yourEmpId
    ? patients.filter((p) => !p.archived && p.assignedEmployeeIds.includes(yourEmpId))
    : [];
  const allActive = patients.filter((p) => !p.archived);
  const archived = patients.filter((p) => p.archived);

  const showYoursTab = yourEmpId !== null;
  // Practitioners (staff role) only see patients assigned to them — no "All" tab.
  const showAllTab = role !== 'staff';

  const sections = [
    ...(showYoursTab ? [{ list: yourPatients, label: 'Your Patients', searchPlaceholder: 'Search your patients…', emptyMessage: 'No patients assigned to you yet' }] : []),
    ...(showAllTab ? [{ list: allActive, label: 'All', searchPlaceholder: 'Search all patients…', emptyMessage: 'No active patients found' }] : []),
    { list: archived, label: 'Archived', searchPlaceholder: 'Search archived patients…', emptyMessage: 'No archived patients found' },
  ];
  const tabList = sections.map((s) => s.list);

  useEffect(() => { setTab(0); }, [showYoursTab, showAllTab]);
  useEffect(() => { if (viewMode === 'mvp' && sort === 'upcoming') setSort('newest'); }, [viewMode, sort]);
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
    toast.success(`${patient.firstName} ${patient.lastName} restored to active.`);
  };

  const searchPlaceholders = sections.map((s) => s.searchPlaceholder);
  const emptyMessages = sections.map((s) => s.emptyMessage);
  const tabItems = sections.map((s, i) => ({ key: i, label: s.label, count: s.list.length }));
  const archivedTabIndex = sections.length - 1;
  const empty = displayed.length === 0;

  if (dataState === 'empty') {
    return (
      <>
        <TopBar breadcrumbs={[{ label: 'All Patients' }]} />
        <EmptyState
          icon={User01}
          title="No patients yet"
          description="Create your organization to start managing patients and tracking their care."
        />
      </>
    );
  }

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Patients' }]} />
      <div className="px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-primary m-0">Patients</h1>
          <Button color="primary" iconLeading={Plus} onPress={() => setAddOpen(true)}>
            Add New Patient
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-secondary mb-6">
          {tabItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setSearch(''); }}
              className={cx(
                'flex items-center gap-2 px-1 pb-3 pt-0 mr-6 text-sm font-semibold border-b-2 -mb-px transition-colors duration-100',
                tab === item.key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-tertiary hover:text-secondary hover:border-secondary'
              )}
            >
              {item.label}
              <span className={cx(
                'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                tab === item.key
                  ? 'bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200'
                  : 'bg-utility-neutral-50 text-utility-neutral-600 ring-utility-neutral-200'
              )}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex gap-3 mb-6">
          <Input
            icon={SearchMd}
            placeholder={searchPlaceholders[tab]}
            value={search}
            onChange={setSearch}
            size="sm"
            wrapperClassName="max-w-xs"
          />
          {tab !== archivedTabIndex && (
            <NativeSelect
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              wrapperClassName="w-36 shrink-0"
              className="font-medium text-secondary"
            >
              {SORT_OPTIONS.filter((o) => viewMode === 'full' || o.value !== 'upcoming').map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </NativeSelect>
          )}
        </div>

        {/* Patient list */}
        {empty ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex items-center justify-center size-14 rounded-full bg-secondary">
              <User01 className="size-7 text-quaternary" />
            </div>
            <p className="text-sm text-secondary">{emptyMessages[tab]}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayed.map((patient) => {
              const { lastSeen, count } = sessionInfo(patient);
              const condition = conditionChip(patient);
              return (
                <div
                  key={patient.id}
                  onClick={() => router.push(`/patients/${patient.id}/overview`)}
                  className={cx(
                    'flex items-center gap-5 px-6 py-5 bg-primary rounded-xl border border-secondary shadow-xs cursor-pointer',
                    'hover:bg-primary_hover transition-colors duration-100',
                    patient.archived && 'opacity-60'
                  )}
                >
                  <Avatar initials={patient.avatarInitials} size="md" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-tertiary mt-0.5">{patient.email}</p>
                    {condition && (
                      <div className="mt-2">
                        <Badge type="pill-color" color="brand" size="sm">{condition}</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Map01 className="size-3.5 text-quaternary" />
                      <span className="text-xs text-tertiary">{patient.location}</span>
                    </div>
                    {viewMode === 'full' && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-quaternary" />
                        <span className="text-xs text-tertiary">
                          {lastSeen ? `Last seen ${lastSeen}` : 'No sessions yet'}
                        </span>
                      </div>
                    )}
                    {viewMode === 'full' && (
                    <div className="flex items-center gap-1.5">
                      <RefreshCw01 className="size-3.5 text-quaternary" />
                      <span className="text-xs text-tertiary">
                        {count > 0 ? `${count} session${count !== 1 ? 's' : ''}` : '—'}
                      </span>
                    </div>
                    )}
                    {tab === archivedTabIndex && (
                      <div onClick={(e) => e.stopPropagation()} className="mt-1">
                        <Button size="xs" color="secondary" iconLeading={RefreshCcw01} onPress={() => restore(patient)}>
                          Restore
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddPatientDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
