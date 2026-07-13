'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Users, Heart, Zap } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { Avatar } from '@/components/base/avatar/avatar';
import { mockPatients, mockEmployees, mockClinicLocations, mockPrograms, mockChartSessions } from '@/lib/mock-data';
import { useRole } from '@/lib/roleStore';
import { useDataState } from '@/lib/dataStateStore';
import { useYourEmpId, useLocationScope } from '@/lib/locationScope';
import { useLocationId } from '@/lib/locationStore';
import { useOrgId } from '@/lib/orgStore';

import type { ClinicLocation } from '@/lib/types';

const THIS_YEAR = '2026';

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

function formatNext(ts: number): string {
  if (!isFinite(ts)) return 'No sessions';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
      <p className="text-xs font-medium text-tertiary mb-1">{label}</p>
      <p className="text-3xl font-bold text-primary leading-none">{value}</p>
      {sub && <p className="text-xs text-secondary mt-1.5">{sub}</p>}
    </div>
  );
}

function LocationRow({ loc }: { loc: ClinicLocation }) {
  const empCount = mockEmployees.filter(
    (e) => !e.archived && e.locationIds.includes(loc.id)
  ).length;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-secondary last:border-0">
      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
        <MapPin size={14} className="text-brand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary">{loc.name}</p>
        <p className="text-xs text-tertiary truncate">{loc.address}</p>
      </div>
      <span className="text-xs text-secondary shrink-0 ml-2">{empCount} staff</span>
    </div>
  );
}

function SectionCard({ title, action, onAction, children }: {
  title: string; action?: string; onAction?: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-secondary bg-primary shadow-xs">
      <div className="flex items-center justify-between px-5 py-4 border-b border-secondary">
        <h3 className="text-sm font-semibold text-primary m-0">{title}</h3>
        {action && (
          <button onClick={onAction} className="text-xs text-brand-700 hover:text-brand-600 font-medium">
            {action}
          </button>
        )}
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

// ── Owner dashboard ───────────────────────────────────────────────────────────

function OwnerDashboard() {
  const { patients: scopedPatients, employees: scopedEmployees } = useLocationScope();
  const locationId = useLocationId();

  const active = scopedPatients.filter((p) => !p.archived);
  const ytd = active.filter((p) => p.createdAt.startsWith(THIS_YEAR));
  const employees = scopedEmployees.filter((e) => !e.archived);

  const visibleLocations = locationId === 'all'
    ? mockClinicLocations
    : mockClinicLocations.filter((l) => l.id === locationId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <StatCard label="Patients This Year" value={ytd.length} />
        <StatCard label="Current Patients" value={active.length} />
        <StatCard label="Current Employees" value={employees.length} />
      </div>

      <SectionCard title={`Locations (${visibleLocations.length})`}>
        {visibleLocations.map((loc) => (
          <LocationRow key={loc.id} loc={loc} />
        ))}
      </SectionCard>
    </div>
  );
}

// ── Admin dashboard ───────────────────────────────────────────────────────────

function AdminDashboard() {
  const { patients: scopedPatients, employees: scopedEmployees } = useLocationScope();

  const active = scopedPatients.filter((p) => !p.archived);
  const ytd = active.filter((p) => p.createdAt.startsWith(THIS_YEAR));
  const employees = scopedEmployees.filter((e) => !e.archived);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
      <StatCard label="Patients This Year" value={ytd.length} />
      <StatCard label="Current Employees" value={employees.length} />
    </div>
  );
}

// ── Staff dashboard ───────────────────────────────────────────────────────────

function StaffDashboard({ empId }: { empId: string }) {
  const router = useRouter();
  const locationId = useLocationId();
  const activeOrgId = useOrgId();
  const emp = mockEmployees.find((e) => e.id === empId);

  const myPatients = useMemo(() => {
    if (!emp) return [];
    const loc = locationId !== 'all' ? mockClinicLocations.find((l) => l.id === locationId) : null;
    return mockPatients
      .filter((p) => !p.archived && emp.patientIds.includes(p.id) && p.clinicId === activeOrgId)
      .filter((p) => !loc || p.location.includes(loc.city))
      .sort((a, b) => computeEstimatedNext(a.id) - computeEstimatedNext(b.id));
  }, [emp, locationId, activeOrgId]);

  const myLocations = useMemo(() => {
    if (!emp) return [];
    return mockClinicLocations.filter((l) => emp.locationIds.includes(l.id) && l.orgId === activeOrgId);
  }, [emp, activeOrgId]);

  const myPrograms = useMemo(() => {
    if (!emp) return [];
    // Count how many of my patients are assigned each program
    const counts: Record<string, number> = {};
    for (const p of myPatients) {
      if (p.programId) counts[p.programId] = (counts[p.programId] ?? 0) + 1;
    }
    return mockPrograms
      .filter((prog) => counts[prog.id] !== undefined)
      .sort((a, b) => {
        // Favorites first, then by patient count descending
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return (counts[b.id] ?? 0) - (counts[a.id] ?? 0);
      })
      .map((prog) => ({ ...prog, patientCount: counts[prog.id] ?? 0 }));
  }, [emp, myPatients]);

  if (!emp) return null;

  return (
    <div className="space-y-6">
      <SectionCard
        title={`My Patients (${myPatients.length})`}
        action="View all"
        onAction={() => router.push('/patients')}
      >
        {myPatients.length === 0 ? (
          <p className="py-4 text-sm text-tertiary text-center">No patients assigned.</p>
        ) : (
          myPatients.map((p) => {
            const next = computeEstimatedNext(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 py-3 border-b border-secondary last:border-0 cursor-pointer hover:bg-secondary -mx-5 px-5 transition-colors"
                onClick={() => router.push(`/patients/${p.id}/overview`)}
              >
                <Avatar initials={p.avatarInitials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary leading-tight">
                    {p.firstName} {p.lastName}
                  </p>
                  {p.injuryHistory?.mechanism && (
                    <p className="text-xs text-tertiary truncate">{p.injuryHistory.mechanism}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-secondary">Next appt</p>
                  <p className="text-xs font-medium text-primary">{formatNext(next)}</p>
                </div>
              </div>
            );
          })
        )}
      </SectionCard>

      <SectionCard title="My Locations">
        {myLocations.length === 0 ? (
          <p className="py-4 text-sm text-tertiary text-center">No locations assigned.</p>
        ) : (
          myLocations.map((loc) => <LocationRow key={loc.id} loc={loc} />)
        )}
      </SectionCard>

      <SectionCard
        title="Programs"
        action="Browse all"
        onAction={() => router.push('/programs')}
      >
        {myPrograms.length === 0 ? (
          <p className="py-4 text-sm text-tertiary text-center">No programs assigned to your patients yet.</p>
        ) : (
          myPrograms.map((prog) => (
            <div
              key={prog.id}
              className="flex items-center gap-3 py-3 border-b border-secondary last:border-0 cursor-pointer hover:bg-secondary -mx-5 px-5 transition-colors"
              onClick={() => router.push(`/programs/${prog.id}`)}
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <Zap size={14} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-primary leading-tight">{prog.name}</p>
                  {prog.isFavorite && <Heart size={12} className="text-pink-500 shrink-0" fill="currentColor" />}
                </div>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {prog.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] rounded-full bg-brand-50 px-1.5 py-0.5 text-brand-700 font-medium">{t}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-secondary flex items-center gap-1">
                  <Users size={11} />
                  {prog.patientCount} patient{prog.patientCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </SectionCard>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const role = useRole();
  const empId = useYourEmpId();
  const dataState = useDataState();

  if (dataState === 'empty') {
    return (
      <>
        <TopBar breadcrumbs={[{ label: 'Dashboard' }]} />
        <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-56px)]">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <h1 className="text-xl font-semibold text-primary mb-1">Welcome to Rea</h1>
              <p className="text-sm text-tertiary">Set up your organization to get started.</p>
            </div>
            <button
              onClick={() => {}}
              className="w-full flex items-start gap-5 rounded-2xl border border-secondary bg-primary shadow-xs p-6 text-left hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                <Building2 size={20} className="text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-primary mb-1">Create an organization</p>
                <p className="text-sm text-tertiary leading-relaxed">
                  Set up your practice or clinic, choose your plan, and invite your team.
                </p>
                <span className="mt-2 inline-block text-xs text-tertiary border border-secondary rounded-full px-2.5 py-0.5">
                  Coming soon
                </span>
              </div>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Dashboard' }]} />
      <div className="p-8 max-w-4xl">
        <h2 className="text-xl font-semibold text-primary mb-6 mt-0">
          {role === 'owner' ? 'Practice Overview' : role === 'admin' ? 'Clinic Overview' : 'My Dashboard'}
        </h2>
        {role === 'owner' && <OwnerDashboard />}
        {role === 'admin' && <AdminDashboard />}
        {role === 'staff' && empId && <StaffDashboard empId={empId} />}
      </div>
    </>
  );
}
