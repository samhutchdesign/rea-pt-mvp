'use client';
import { use, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { mockPatients } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import { usePermissions } from '@/lib/permissionsHook';
import { useContactOverrides, setContactInfo, getEffectiveContactInfo } from '@/lib/patientContactStore';
import { Pencil } from 'lucide-react';

export default function PatientContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);
  const uploaded = getUploadedData(id);
  const contactOverrides = useContactOverrides();
  const searchParams = useSearchParams();

  const [editingContact, setEditingContact] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState(false);

  const effectiveContact = patient ? getEffectiveContactInfo(patient, contactOverrides) : null;
  const savedContact = {
    firstName: effectiveContact?.firstName ?? '',
    lastName: effectiveContact?.lastName ?? '',
    pronouns: effectiveContact?.pronouns ?? '',
    phone: uploaded?.phone || effectiveContact?.phone || '',
    email: effectiveContact?.email ?? '',
    address: uploaded?.address || effectiveContact?.address || '',
  };
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

  // Intentionally omits `savedContact` from deps — it's a fresh object every render, and
  // including it would re-seed (and wipe) the draft on every keystroke while editing.
  useEffect(() => {
    if (searchParams.get('edit') === '1') {
      setContactDraft({ ...savedContact });
      setEditingContact(true);
    }
  }, [searchParams]);

  const can = usePermissions();

  if (!patient) return null;

  const handleEditContact = () => {
    setContactDraft({ ...savedContact });
    setEditingContact(true);
  };

  const handleSaveContact = () => {
    setContactInfo(id, { ...contactDraft });
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

  // Matches the Details tab's field pattern: hidden entirely when empty and not
  // editing, plain text (no box) in view mode, bordered input in edit mode.
  const field = (label: string, value: string, editing: boolean, onChange: (v: string) => void) => {
    if (!editing && !value) return null;
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs text-secondary">{label}</span>
        {editing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg bg-primary ring-1 ring-inset ring-primary px-3 py-2 text-base text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        ) : (
          <span className="block text-base text-primary">{value}</span>
        )}
      </div>
    );
  };

  // Same row-pairing as the Details tab — a hidden/empty field just leaves its
  // column blank, and a row where both fields are hidden renders nothing.
  const fieldRow = (a: React.ReactNode, b?: React.ReactNode) => {
    if (!a && !b) return null;
    return <div className="grid w-full grid-cols-2 gap-8">{a}{b}</div>;
  };

  return (
    <div className="flex flex-col gap-4 mt-10">
      {/* Contact Information */}
      <div className="relative flex w-full max-w-[800px] flex-col gap-8 rounded-lg border border-secondary bg-primary p-10">
        <span className="font-display text-md font-medium tracking-[0.1px] text-primary">Contact Information</span>
        {can.canEditContactInfo && !editingContact && (
          <button onClick={handleEditContact} className="absolute right-6 top-6 text-tertiary hover:text-secondary transition-colors p-1">
            <Pencil size={24} strokeWidth={1.25} />
          </button>
        )}
        <div className="flex w-full flex-col gap-7">
          {fieldRow(
            field('First Name', editingContact ? contactDraft.firstName : savedContact.firstName, editingContact, (v) => setContactDraft((d) => ({ ...d, firstName: v }))),
            field('Last Name', editingContact ? contactDraft.lastName : savedContact.lastName, editingContact, (v) => setContactDraft((d) => ({ ...d, lastName: v }))),
          )}
          {fieldRow(
            field('Pronouns', editingContact ? contactDraft.pronouns : savedContact.pronouns, editingContact, (v) => setContactDraft((d) => ({ ...d, pronouns: v }))),
            field('Email Address', editingContact ? contactDraft.email : savedContact.email, editingContact, (v) => setContactDraft((d) => ({ ...d, email: v }))),
          )}
          {fieldRow(field('Phone Number', editingContact ? contactDraft.phone : savedContact.phone, editingContact, (v) => setContactDraft((d) => ({ ...d, phone: v }))))}
          {field('Home Address', editingContact ? contactDraft.address : savedContact.address, editingContact, (v) => setContactDraft((d) => ({ ...d, address: v })))}
        </div>
        {editingContact && (
          <div className="flex w-full justify-end gap-4">
            <Button color="secondary" size="sm" onPress={() => setEditingContact(false)}>Cancel</Button>
            <Button color="primary" size="sm" onPress={handleSaveContact}>Save Changes</Button>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="relative flex w-full max-w-[800px] flex-col gap-8 rounded-lg border border-secondary bg-primary p-10">
        <span className="font-display text-md font-medium tracking-[0.1px] text-primary">Emergency Contact</span>
        {can.canEditContactInfo && !editingEmergency && (
          <button onClick={handleEditEmergency} className="absolute right-6 top-6 text-tertiary hover:text-secondary transition-colors p-1">
            <Pencil size={24} strokeWidth={1.25} />
          </button>
        )}
        <div className="flex w-full flex-col gap-7">
          {fieldRow(
            field('First Name', editingEmergency ? emergencyDraft.firstName : savedEmergency.firstName, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, firstName: v }))),
            field('Last Name', editingEmergency ? emergencyDraft.lastName : savedEmergency.lastName, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, lastName: v }))),
          )}
          {fieldRow(
            field('Phone Number', editingEmergency ? emergencyDraft.phone : savedEmergency.phone, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, phone: v }))),
            field('Email Address', editingEmergency ? emergencyDraft.email : savedEmergency.email, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, email: v }))),
          )}
          {fieldRow(field('Relationship', editingEmergency ? emergencyDraft.relationship : savedEmergency.relationship, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, relationship: v }))))}
          {field('Home Address', editingEmergency ? emergencyDraft.address : savedEmergency.address, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, address: v })))}
        </div>
        {editingEmergency && (
          <div className="flex w-full justify-end gap-4">
            <Button color="secondary" size="sm" onPress={() => setEditingEmergency(false)}>Cancel</Button>
            <Button color="primary" size="sm" onPress={handleSaveEmergency}>Save Changes</Button>
          </div>
        )}
      </div>
    </div>
  );
}
