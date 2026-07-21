'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import { mockClinicLocations, mockClinic, mockEmployees } from '@/lib/mock-data';
import { usePermissions } from '@/lib/permissionsHook';
import { useLocationOverrides, getEffectivePatientIdsForEmployee } from '@/lib/patientLocationStore';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Divider } from '@/components/ui/divider';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { ArrowLeft, MapPin, Pencil, Trash2, Users } from 'lucide-react';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

export default function ClinicLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const can = usePermissions();

  const location = mockClinicLocations.find((l) => l.id === id);

  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    name: location?.name ?? '',
    city: location?.city ?? '',
    regionCountry: location?.regionCountry ?? '',
    address: location?.address ?? '',
    phone: location?.phone ?? '',
    email: location?.email ?? '',
    description: location?.description ?? '',
  });
  const [saved, setSaved] = useState({ ...form });
  const locationOverrides = useLocationOverrides();

  if (!location) return null;

  const teamMembers = mockEmployees.filter((e) => location.employeeIds.includes(e.id) && !e.archived);

  const handleSave = () => {
    setSaved({ ...form });
    setEditing(false);
    toast.success('Clinic profile updated.');
  };

  const handleCancel = () => {
    setForm({ ...saved });
    setEditing(false);
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    router.push('/clinic');
  };

  const readOnly = !editing;

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'Organization Profile', href: '/clinic' },
          { label: saved.name },
        ]}
      />
      <div className="p-8 max-w-[900px]">
        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          <Avatar initials={mockClinic.logoInitials} size="xl" className="shrink-0" />
          <div className="grow">
            <span className="block text-tertiary text-xs uppercase tracking-widest mb-0.5">{mockClinic.name}</span>
            <h2 className="text-xl font-semibold text-primary mt-0.5 mb-1">{saved.name}</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin size={15} className="text-tertiary" />
                <span className="text-tertiary text-sm">{saved.city}, {saved.regionCountry}</span>
              </div>
              {teamMembers.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users size={15} className="text-tertiary" />
                  <span className="text-tertiary text-sm">
                    {teamMembers.length} physiotherapist{teamMembers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button color="secondary" size="xs" iconLeading={ArrowLeft} onPress={() => router.push('/clinic')}>
              Organization
            </Button>
            {(can.canManageClinic || can.canManageLocation) && !editing && (
              <Button color="secondary" size="xs" iconLeading={Pencil} onPress={() => setEditing(true)}>
                Edit Clinic
              </Button>
            )}
            {editing && (
              <>
                <Button color="secondary" size="xs" onPress={handleCancel}>Cancel</Button>
                <Button color="primary" size="xs" onPress={handleSave}>Save Changes</Button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left: About + Contact + Danger Zone */}
          <div className="flex-[3] flex flex-col gap-4">
            <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
              <span className="block font-semibold text-primary mb-4">About This Location</span>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-1 text-sm text-secondary">Clinic Name</div>
                  <Input value={form.name} isReadOnly={readOnly} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-secondary">City</div>
                    <Input value={form.city} isReadOnly={readOnly} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-secondary">Region / Country</div>
                    <Input value={form.regionCountry} isReadOnly={readOnly} onChange={(v) => setForm((f) => ({ ...f, regionCountry: v }))} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-secondary">Description</div>
                  <textarea
                    rows={4}
                    value={form.description}
                    readOnly={readOnly}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary placeholder:text-placeholder outline-none resize-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
              <span className="block font-semibold text-primary mb-4">Contact</span>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-1 text-sm text-secondary">Address</div>
                  <Input value={form.address} isReadOnly={readOnly} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-secondary">Phone</div>
                    <Input value={form.phone} isReadOnly={readOnly} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-secondary">Email</div>
                    <Input value={form.email} isReadOnly={readOnly} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
                  </div>
                </div>
              </div>
            </div>

            {can.canManageClinic && (
              <div className="rounded-xl border border-utility-red-200 bg-primary shadow-xs p-6">
                <span className="block text-tertiary text-xs font-semibold uppercase tracking-wide mb-2">Danger Zone</span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block font-semibold text-primary text-sm">Delete this clinic location</span>
                    <span className="text-tertiary text-xs">This will remove the location from the organization permanently.</span>
                  </div>
                  <Button color="secondary-destructive" size="xs" iconLeading={Trash2} onPress={() => setDeleteOpen(true)}>
                    Delete Location
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Team */}
          <div className="flex-[2]">
            <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
              <span className="block font-semibold text-primary mb-4">
                Team {teamMembers.length > 0 ? `(${teamMembers.length})` : ''}
              </span>
              {teamMembers.length === 0 ? (
                <span className="text-tertiary text-sm">No staff assigned to this location yet.</span>
              ) : (
                <div className="flex flex-col">
                  {teamMembers.map((emp, i) => {
                    const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';
                    const patientCount = getEffectivePatientIdsForEmployee(emp, locationOverrides).length;
                    return (
                      <div key={emp.id}>
                        <div
                          className="flex items-center gap-3 py-3 px-1 cursor-pointer rounded-lg hover:bg-secondary_alt transition-colors"
                          onClick={() => router.push(`/employees/${emp.id}`)}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                            style={{ background: bgColor + '18', color: bgColor }}
                          >
                            {emp.avatarInitials}
                          </div>
                          <div className="grow min-w-0">
                            <span className="block font-semibold text-primary text-sm truncate">{emp.firstName} {emp.lastName}</span>
                            <span className="text-tertiary text-xs truncate">{emp.credentials} · {emp.title}</span>
                          </div>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: '#EDE7F6', color: '#6750A4' }}
                          >
                            {`${patientCount}p`}
                          </span>
                        </div>
                        {i < teamMembers.length - 1 && <Divider />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ModalOverlay isOpen={deleteOpen} onOpenChange={(open) => { if (!open) setDeleteOpen(false); }}>
        <Modal>
          <Dialog>
            <div className="p-6 w-full min-w-[400px]">
              <h3 className="text-lg font-semibold text-primary mb-3">Delete Clinic Location?</h3>
              <p className="text-tertiary text-sm mb-6">
                This will permanently remove <strong className="text-primary">{saved.name}</strong> from the organization. This cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button color="secondary" size="sm" onPress={() => setDeleteOpen(false)}>Cancel</Button>
                <Button color="primary-destructive" size="sm" onPress={handleDelete}>Delete Location</Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
