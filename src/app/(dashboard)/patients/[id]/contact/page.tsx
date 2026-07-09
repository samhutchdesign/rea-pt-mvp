'use client';
import { use, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { mockPatients } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import { usePermissions } from '@/lib/permissionsHook';
import { Pencil } from 'lucide-react';

export default function PatientContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);
  const uploaded = getUploadedData(id);

  const [editingContact, setEditingContact] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState(false);

  const [savedContact, setSavedContact] = useState({
    firstName: patient?.firstName ?? '',
    lastName: patient?.lastName ?? '',
    phone: uploaded?.phone || patient?.phone || '',
    email: patient?.email ?? '',
    address: uploaded?.address || patient?.address || '',
  });
  const [savedEmergency, setSavedEmergency] = useState({
    firstName: uploaded?.emergencyFirstName || patient?.emergencyContact?.firstName || '',
    lastName: uploaded?.emergencyLastName || patient?.emergencyContact?.lastName || '',
    phone: uploaded?.emergencyPhone || patient?.emergencyContact?.phone || '',
    email: patient?.emergencyContact?.email ?? '',
    address: patient?.emergencyContact?.address ?? '',
    relationship: uploaded?.emergencyRelationship || patient?.emergencyContact?.relationship || '',
  });
  const [contactDraft, setContactDraft] = useState({ ...savedContact });
  const [emergencyDraft, setEmergencyDraft] = useState({ ...savedEmergency });

  const can = usePermissions();

  if (!patient) return null;

  const handleEditContact = () => {
    setContactDraft({ ...savedContact });
    setEditingContact(true);
  };

  const handleSaveContact = () => {
    setSavedContact({ ...contactDraft });
    setEditingContact(false);
    toast.success('Contact information updated.');
  };

  const handleEditEmergency = () => {
    setEmergencyDraft({ ...savedEmergency });
    setEditingEmergency(true);
  };

  const handleSaveEmergency = () => {
    setSavedEmergency({ ...emergencyDraft });
    setEditingEmergency(false);
    toast.success('Emergency contact updated.');
  };

  const field = (label: string, value: string, editing: boolean, onChange: (v: string) => void) => (
    <div className="flex-1">
      <span className="block mb-1 text-xs text-secondary">{label}</span>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-primary shadow-xs ring-1 ring-inset ring-primary px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      ) : (
        <div className="rounded-lg border border-secondary bg-secondary_alt px-3 py-2 text-sm text-primary min-h-[38px]">
          {value || <span className="text-tertiary">—</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Contact Information */}
      <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5">
        <div className="flex justify-between items-center mb-5">
          <span className="text-sm font-semibold text-primary">Contact Information</span>
          {can.canEditContactInfo && !editingContact && (
            <Button color="tertiary" size="xs" onPress={handleEditContact} iconLeading={Pencil} />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            {field('First Name', editingContact ? contactDraft.firstName : savedContact.firstName, editingContact, (v) => setContactDraft((d) => ({ ...d, firstName: v })))}
            {field('Last Name', editingContact ? contactDraft.lastName : savedContact.lastName, editingContact, (v) => setContactDraft((d) => ({ ...d, lastName: v })))}
          </div>
          <div className="flex gap-4">
            {field('Phone Number', editingContact ? contactDraft.phone : savedContact.phone, editingContact, (v) => setContactDraft((d) => ({ ...d, phone: v })))}
            {field('Email Address', editingContact ? contactDraft.email : savedContact.email, editingContact, (v) => setContactDraft((d) => ({ ...d, email: v })))}
          </div>
          {field('Home Address', editingContact ? contactDraft.address : savedContact.address, editingContact, (v) => setContactDraft((d) => ({ ...d, address: v })))}
        </div>
        {editingContact && (
          <div className="flex justify-end gap-3 mt-5">
            <Button color="secondary" size="sm" onPress={() => setEditingContact(false)}>Cancel</Button>
            <Button color="primary" size="sm" onPress={handleSaveContact}>Save Changes</Button>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5">
        <div className="flex justify-between items-center mb-5">
          <span className="text-sm font-semibold text-primary">Emergency Contact</span>
          {can.canEditContactInfo && !editingEmergency && (
            <Button color="tertiary" size="xs" onPress={handleEditEmergency} iconLeading={Pencil} />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            {field('First Name', editingEmergency ? emergencyDraft.firstName : savedEmergency.firstName, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, firstName: v })))}
            {field('Last Name', editingEmergency ? emergencyDraft.lastName : savedEmergency.lastName, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, lastName: v })))}
          </div>
          <div className="flex gap-4">
            {field('Phone Number', editingEmergency ? emergencyDraft.phone : savedEmergency.phone, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, phone: v })))}
            {field('Email Address', editingEmergency ? emergencyDraft.email : savedEmergency.email, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, email: v })))}
          </div>
          {field('Home Address', editingEmergency ? emergencyDraft.address : savedEmergency.address, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, address: v })))}
          {field('Relationship', editingEmergency ? emergencyDraft.relationship : savedEmergency.relationship, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, relationship: v })))}
        </div>
        {editingEmergency && (
          <div className="flex justify-end gap-3 mt-5">
            <Button color="secondary" size="sm" onPress={() => setEditingEmergency(false)}>Cancel</Button>
            <Button color="primary" size="sm" onPress={handleSaveEmergency}>Save Changes</Button>
          </div>
        )}
      </div>
    </div>
  );
}
