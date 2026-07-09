'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ComponentType } from 'react';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import { mockClinic, mockClinicLocations, mockEmployees, mockPatients } from '@/lib/mock-data';
import type { ClinicLocation } from '@/lib/types';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Divider } from '@/components/ui/divider';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { Building2, ChevronRight, Globe, Mail, MapPin, Pencil, Phone, Plus } from 'lucide-react';

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

const INITIAL_LOCATIONS: ClinicLocation[] = mockClinicLocations;

export default function ClinicPage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: mockClinic.name,
    address: mockClinic.address,
    phone: mockClinic.phone,
    email: mockClinic.email,
    website: mockClinic.website,
    description: mockClinic.description,
  });

  const [locations, setLocations] = useState<ClinicLocation[]>(INITIAL_LOCATIONS);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  const handleSave = () => {
    setEditing(false);
    toast.success('Organization profile updated successfully!');
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    const parts = newLocation.trim().split(',').map((s) => s.trim());
    const city = parts[0] ?? newLocation.trim();
    const regionCountry = parts.slice(1).join(', ') || '';
    setLocations((prev) => [
      ...prev,
      {
        id: `loc-${Date.now()}`,
        orgId: 'clinic1',
        name: `${city} Clinic`,
        city,
        regionCountry,
        address: '',
        phone: '',
        email: '',
        description: '',
        employeeIds: [],
      },
    ]);
    setNewLocation('');
    setAddLocationOpen(false);
    toast.success('Location added.');
  };

  const contactItems: { icon: ComponentType<{ size?: number; className?: string }>; label: string }[] = [
    { icon: Phone, label: mockClinic.phone },
    { icon: Mail, label: mockClinic.email },
    { icon: Globe, label: mockClinic.website },
    { icon: MapPin, label: mockClinic.address },
  ];

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Organization Profile' }]} />
      <div className="p-8 max-w-[900px]">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <Avatar initials={mockClinic.logoInitials} size="xl" className="shrink-0" />
          <div className="grow">
            <h2 className="text-xl font-semibold text-primary mt-0 mb-1">{mockClinic.name}</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin size={15} className="text-tertiary" />
                <span className="text-tertiary text-sm">{locations.length} location{locations.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 size={15} className="text-tertiary" />
                <span className="text-tertiary text-sm">{mockEmployees.length} physiotherapists</span>
              </div>
            </div>
          </div>
          {!editing ? (
            <Button color="secondary" size="sm" iconLeading={Pencil} onPress={() => setEditing(true)}>
              Edit Organization
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button color="secondary" size="sm" onPress={() => setEditing(false)}>Cancel</Button>
              <Button color="primary" size="sm" onPress={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Left column */}
          <div className="flex-[3] flex flex-col gap-4">
            <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
              <span className="block font-semibold text-primary mb-4">Organization Information</span>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-1 text-sm text-secondary">Organization Name</div>
                  <Input value={form.name} isReadOnly={!editing} onChange={(v) => setForm({ ...form, name: v })} />
                </div>
                <div>
                  <div className="mb-1 text-sm text-secondary">Primary Address</div>
                  <Input value={form.address} isReadOnly={!editing} onChange={(v) => setForm({ ...form, address: v })} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-secondary">Phone</div>
                    <Input value={form.phone} isReadOnly={!editing} onChange={(v) => setForm({ ...form, phone: v })} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-secondary">Email</div>
                    <Input value={form.email} isReadOnly={!editing} onChange={(v) => setForm({ ...form, email: v })} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-secondary">Website</div>
                  <Input value={form.website} isReadOnly={!editing} onChange={(v) => setForm({ ...form, website: v })} />
                </div>
                <div>
                  <div className="mb-1 text-sm text-secondary">About the Organization</div>
                  <textarea
                    rows={4}
                    value={form.description}
                    readOnly={!editing}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary placeholder:text-placeholder outline-none resize-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-primary">Locations</span>
                <Button color="tertiary" size="xs" iconLeading={Plus} onPress={() => setAddLocationOpen(true)}>
                  Add Location
                </Button>
              </div>
              {locations.length === 0 ? (
                <span className="text-tertiary text-sm">No locations added yet.</span>
              ) : (
                <div className="flex flex-col">
                  {locations.map((loc, i) => (
                    <div key={loc.id}>
                      <div className="flex items-center gap-3 py-2.5">
                        <MapPin size={18} className="text-tertiary shrink-0" />
                        <div
                          className="grow cursor-pointer"
                          onClick={() => router.push(`/clinic/${loc.id}`)}
                        >
                          <span className="block font-semibold text-primary text-sm">{loc.name}</span>
                          {loc.regionCountry && (
                            <span className="text-tertiary text-xs">{loc.city}, {loc.regionCountry}</span>
                          )}
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-tertiary cursor-pointer"
                          onClick={() => router.push(`/clinic/${loc.id}`)}
                        />
                      </div>
                      {i < locations.length - 1 && <Divider />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact summary */}
            {!editing && (
              <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
                <span className="block font-semibold text-primary mb-4">Contact</span>
                <div className="flex flex-col gap-3">
                  {contactItems.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon size={16} className="text-tertiary mt-0.5 shrink-0" />
                      <span className="text-tertiary text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Team */}
          <div className="flex-[2]">
            <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6 h-full">
              <span className="block font-semibold text-primary mb-4">Team ({mockEmployees.length} employees)</span>
              <div className="flex flex-col">
                {mockEmployees.map((emp, i) => {
                  const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';
                  const patientCount = mockPatients.filter((p) => emp.patientIds.includes(p.id)).length;
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
                      {i < mockEmployees.length - 1 && <Divider />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Location Dialog */}
      <ModalOverlay
        isOpen={addLocationOpen}
        onOpenChange={(open) => { if (!open) { setAddLocationOpen(false); setNewLocation(''); } }}
      >
        <Modal>
          <Dialog>
            <div className="p-6 w-full min-w-[400px]">
              <h3 className="text-lg font-semibold text-primary mb-4">Add Location</h3>
              <div
                className="mb-4"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddLocation(); }}
              >
                <div className="mb-1 text-sm text-secondary">Location</div>
                <Input
                  placeholder="e.g. Toronto, ON, Canada"
                  value={newLocation}
                  onChange={(v) => setNewLocation(v)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  color="secondary"
                  size="sm"
                  onPress={() => { setAddLocationOpen(false); setNewLocation(''); }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  isDisabled={!newLocation.trim()}
                  onPress={handleAddLocation}
                >
                  Add Location
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
