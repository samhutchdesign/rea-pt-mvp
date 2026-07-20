'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import { mockPatients } from '@/lib/mock-data';
import { useLocationScope } from '@/lib/locationScope';
import type { Employee } from '@/lib/types';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { cx } from '@/utils/cx';
import { useDataState } from '@/lib/dataStateStore';
import { EmptyState } from '@/components/ui/empty-state';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { Mail, Plus, RotateCcw, Search, Users } from 'lucide-react';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

export default function EmployeesPage() {
  const router = useRouter();
  const dataState = useDataState();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('0');
  const [addOpen, setAddOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Practitioner');
  const { employees: scopedEmployees } = useLocationScope();
  const [overrides, setOverrides] = useState<Record<string, Partial<Employee>>>({});

  const employees = scopedEmployees.map((e) => overrides[e.id] ? { ...e, ...overrides[e.id] } : e);

  const activeEmployees = employees.filter((e) => !e.archived);
  const archivedEmployees = employees.filter((e) => e.archived);

  const applySearch = (list: Employee[]) => {
    const q = search.toLowerCase();
    return list.filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.credentials.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q)
    );
  };

  const displayed = applySearch(tab === '0' ? activeEmployees : archivedEmployees);

  const restore = (emp: Employee) => {
    setOverrides((prev) => ({ ...prev, [emp.id]: { archived: false } }));
    toast.success(`${emp.firstName} ${emp.lastName} restored to active.`);
  };

  const empty = displayed.length === 0;

  if (dataState === 'empty') {
    return (
      <>
        <TopBar breadcrumbs={[{ label: 'Employees' }]} />
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Create your organization to start building your team and managing staff access."
        />
      </>
    );
  }

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Employees' }]} />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary m-0">Employees</h2>
          <Button color="primary" size="sm" iconLeading={Plus} onPress={() => { setInviteEmail(''); setInviteRole('Practitioner'); setAddOpen(true); }}>Add Employee</Button>
        </div>

        <div className="flex border-b border-secondary mb-6">
          {[
            { key: '0', label: 'Active', count: activeEmployees.length },
            { key: '1', label: 'Archived', count: archivedEmployees.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cx(
                'flex items-center gap-2 px-1 pb-3 pt-0 mr-6 text-sm font-semibold border-b-2 -mb-px transition-colors duration-100',
                tab === key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-tertiary hover:text-secondary hover:border-secondary'
              )}
            >
              {label}
              <span className={cx(
                'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                tab === key
                  ? 'bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200'
                  : 'bg-utility-neutral-50 text-utility-neutral-600 ring-utility-neutral-200'
              )}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-6 w-[340px]">
          <Input
            placeholder={tab === '0' ? 'Search active employees…' : 'Search archived employees…'}
            value={search}
            onChange={(v) => setSearch(v)}
            icon={Search}
          />
        </div>

        {empty ? (
          <div className="text-center py-16">
            <Users size={48} className="text-quaternary mx-auto mb-3" />
            <span className="text-tertiary text-sm">
              {tab === '0' ? 'No active employees found' : 'No archived employees found'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayed.map((emp) => {
              const patientCount = mockPatients.filter((p) => emp.patientIds.includes(p.id)).length;
              const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';
              return (
                <div
                  key={emp.id}
                  className={cx(
                    'rounded-xl border border-secondary bg-primary shadow-xs cursor-pointer hover:bg-secondary_alt transition-colors',
                    emp.archived && 'opacity-75'
                  )}
                  onClick={() => router.push(`/employees/${emp.id}`)}
                >
                  <div className="flex items-center gap-5 px-6 py-4">
                    <div
                      className="w-13 h-13 rounded-full flex items-center justify-center shrink-0 font-bold text-base"
                      style={{ width: 52, height: 52, background: bgColor + '18', color: bgColor }}
                    >
                      {emp.avatarInitials}
                    </div>
                    <div className="grow">
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className="font-semibold text-primary text-sm">{emp.firstName} {emp.lastName}</span>
                        <span className="text-tertiary text-sm">{emp.credentials}</span>
                      </div>
                      <span className="block text-tertiary text-sm mb-1.5">{emp.title}</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {emp.specialties.map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 rounded-full border border-secondary text-secondary bg-secondary_alt"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: '#EDE7F6', color: '#6750A4' }}
                      >
                        {`${patientCount} patient${patientCount !== 1 ? 's' : ''}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <Mail size={13} className="text-tertiary" />
                        <span className="text-tertiary text-xs">{emp.email}</span>
                      </div>
                    </div>
                    {tab === '1' && (
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0 ml-2">
                        <Button
                          color="secondary"
                          size="xs"
                          iconLeading={RotateCcw}
                          onPress={() => restore(emp)}
                        >
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
      <ModalOverlay isOpen={addOpen} onOpenChange={(o) => { if (!o) setAddOpen(false); }}>
        <Modal><Dialog>
          <div className="p-6 w-[440px]">
            <h3 className="mb-1 text-lg font-semibold text-primary">Add Employee</h3>
            <p className="text-sm text-tertiary mb-5">Send an invite link to add a new team member.</p>

            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1 text-xs font-medium text-secondary">Email address <span className="text-error-500">*</span></div>
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
                />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-secondary">Role</div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <option value="Admin">Admin</option>
                  <option value="Practitioner">Practitioner</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button color="secondary" size="sm" onPress={() => setAddOpen(false)}>Cancel</Button>
              <Button
                color="primary"
                size="sm"
                isDisabled={!inviteEmail.trim()}
                onPress={() => {
                  toast.success(`Invite sent to ${inviteEmail}`);
                  setAddOpen(false);
                }}
              >
                Send Invite
              </Button>
            </div>
          </div>
        </Dialog></Modal>
      </ModalOverlay>
    </>
  );
}
