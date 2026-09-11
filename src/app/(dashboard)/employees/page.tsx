'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar } from '@/components/base/avatar/avatar';
import { mockPatients, mockClinicLocations } from '@/lib/mock-data';
import { useLocationScope, useCurrentIdentity } from '@/lib/locationScope';
import { useRole } from '@/lib/roleStore';
import { usePermissions } from '@/lib/permissionsHook';
import type { Employee, UserRole } from '@/lib/types';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { NativeSelect } from '@/components/ui/native-select';
import { cx } from '@/utils/cx';
import { useDataState } from '@/lib/dataStateStore';
import { EmptyState } from '@/components/ui/empty-state';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { ChevronRight, Plus, RotateCcw, Search, Users } from 'lucide-react';

export default function EmployeesPage() {
  const router = useRouter();
  const dataState = useDataState();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'az' | 'za'>('az');
  const [tab, setTab] = useState('0');
  const [addOpen, setAddOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Practitioner');
  const { employees: scopedEmployees } = useLocationScope();
  const [overrides, setOverrides] = useState<Record<string, Partial<Employee>>>({});
  const role = useRole();
  const can = usePermissions();
  const currentIdentity = useCurrentIdentity();

  const employees = scopedEmployees
    .filter((e) => e.id !== currentIdentity.id)
    .map((e) => overrides[e.id] ? { ...e, ...overrides[e.id] } : e);

  const changeRole = (emp: Employee, newRole: UserRole) => {
    setOverrides((prev) => ({ ...prev, [emp.id]: { ...prev[emp.id], role: newRole } }));
    const label = newRole === 'admin' ? 'Manager' : newRole === 'limited' ? 'Staff' : 'Practitioner';
    toast.success(`${emp.firstName} ${emp.lastName}'s permissions updated to ${label}.`);
  };

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

  const applySort = (list: Employee[]) => {
    const sorted = [...list].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    return sort === 'za' ? sorted.reverse() : sorted;
  };

  const displayed = applySort(applySearch(tab === '0' ? activeEmployees : archivedEmployees));

  const restore = (emp: Employee) => {
    setOverrides((prev) => ({ ...prev, [emp.id]: { archived: false } }));
    toast.success(`${emp.firstName} ${emp.lastName} restored to active.`);
  };

  const empty = displayed.length === 0;

  if (dataState === 'empty') {
    return (
      <>
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
      <div className="p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-display text-[40px] leading-[48px] font-normal text-primary m-0">Employees</h1>
          {can.canInviteUsers && (
            <Button color="primary" size="lg" iconLeading={Plus} onPress={() => { setInviteEmail(''); setInviteRole('Practitioner'); setAddOpen(true); }}>Add New Employee</Button>
          )}
        </div>

        <div className="flex gap-10 border-b border-secondary mb-10">
          {[
            { key: '0', label: 'All Employees', count: activeEmployees.length },
            { key: '1', label: 'Archived', count: archivedEmployees.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cx(
                'flex items-center gap-2 pb-4 pt-0 text-base -mb-px border-b-[3px] transition-colors duration-100',
                tab === key
                  ? 'border-b-[#9b9897] text-primary font-medium'
                  : 'border-transparent text-primary font-normal hover:text-secondary'
              )}
            >
              {label}
              <span className="inline-flex items-center justify-center rounded-full bg-secondary_alt px-3 py-1 text-xs text-primary">
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-5 flex gap-4 items-start">
          <div className="flex-1">
            <Input
              size="lg"
              wrapperClassName="h-12 shadow-none ring-secondary"
              placeholder="Search by name or email"
              value={search}
              onChange={(v) => setSearch(v)}
              icon={Search}
            />
          </div>
          <NativeSelect
            wrapperClassName="w-[200px] shrink-0"
            className="h-12"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'az' | 'za')}
          >
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </NativeSelect>
        </div>

        {empty ? (
          <div className="text-center py-16">
            <Users size={48} className="text-quaternary mx-auto mb-3" />
            <span className="text-tertiary text-sm">
              {tab === '0' ? 'No active employees found' : 'No archived employees found'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-[minmax(0,1fr)_100px_140px_180px_24px] gap-4 border-b border-secondary px-5 pb-3">
              <span className="text-xs text-primary">Practitioner</span>
              <span className="text-xs text-primary"># of Patients</span>
              <span className="text-xs text-primary">Location</span>
              <span className="text-xs text-primary">Assigned Role</span>
              <span />
            </div>
            <div className="flex flex-col gap-5">
              {displayed.map((emp) => {
                const patientCount = mockPatients.filter((p) => emp.patientIds.includes(p.id)).length;
                const location = mockClinicLocations.find((l) => emp.locationIds.includes(l.id));
                return (
                  <div
                    key={emp.id}
                    className={cx(
                      'grid grid-cols-[minmax(0,1fr)_100px_140px_180px_24px] items-center gap-4 rounded-lg border border-secondary bg-primary pl-5 pr-7 py-5 cursor-pointer hover:bg-secondary_alt transition-colors',
                      emp.archived && 'opacity-75'
                    )}
                    onClick={() => router.push(`/employees/${emp.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        size="lg"
                        src={emp.avatarUrl}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        initials={emp.avatarInitials}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-md font-medium text-primary">{emp.firstName} {emp.lastName}</span>
                          <span className="text-xs text-primary">{emp.credentials}</span>
                        </div>
                        <span className="block text-xs text-primary">{emp.title}</span>
                      </div>
                    </div>

                    <span className="text-xs text-primary">{`${patientCount} Patient${patientCount !== 1 ? 's' : ''}`}</span>

                    <span className="w-fit rounded-full bg-secondary_alt px-3 py-1.5 text-xs text-primary">
                      {location?.city ?? '—'}
                    </span>

                    {role === 'owner' && emp.role !== 'owner' ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <NativeSelect
                          wrapperClassName="w-40"
                          className="h-12 text-base"
                          value={emp.role}
                          onChange={(e) => changeRole(emp, e.target.value as UserRole)}
                        >
                          <option value="admin">Manager</option>
                          <option value="editor">Practitioner</option>
                          <option value="limited">Staff</option>
                        </NativeSelect>
                      </div>
                    ) : tab === '1' && can.canArchiveEmployees ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Button
                          color="secondary"
                          size="xs"
                          iconLeading={RotateCcw}
                          onPress={() => restore(emp)}
                        >
                          Restore
                        </Button>
                      </div>
                    ) : (
                      <span className="text-base text-primary capitalize">
                        {emp.role === 'admin' ? 'Manager' : emp.role === 'editor' ? 'Practitioner' : emp.role === 'limited' ? 'Staff' : emp.role}
                      </span>
                    )}

                    <ChevronRight size={20} className="text-primary shrink-0 justify-self-end" />
                  </div>
                );
              })}
            </div>
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
                <NativeSelect
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="Manager">Manager</option>
                  <option value="Practitioner">Practitioner</option>
                  <option value="Staff">Staff</option>
                </NativeSelect>
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
