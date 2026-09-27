'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { getPatientPersona } from '@/lib/patientPersona';
import {
  usePatientSelfContactOverrides,
  getEffectivePatientSelfContactInfo,
  setPatientSelfContactInfo,
} from '@/lib/patientSelfContactStore';
import PatientFooter from '@/components/patient/PatientFooter';

export default function PatientProfilePage() {
  const patient = getPatientPersona();
  const contactOverrides = usePatientSelfContactOverrides();
  const savedContact = getEffectivePatientSelfContactInfo(patient, contactOverrides);

  const [draft, setDraft] = useState(savedContact);
  const isDirty =
    draft.email !== savedContact.email || draft.phone !== savedContact.phone || draft.address !== savedContact.address;

  const handleSave = () => {
    setPatientSelfContactInfo(patient.id, draft);
    toast.success('Contact info updated.');
  };

  return (
    <div className="flex flex-col gap-6 pt-7">
      <Link
        href="/program"
        className="flex h-12 w-fit items-center gap-2 rounded-lg border border-tertiary bg-primary px-4 text-base text-primary hover:bg-secondary"
      >
        <ArrowLeft size={24} strokeWidth={1.25} />
        back
      </Link>

      <p className="font-display text-2xl font-normal text-primary">Your Profile</p>

      <div className="flex items-center gap-3">
        <Avatar size="xl" initials={patient.avatarInitials} />
        <div className="flex flex-col">
          <p className="font-display text-lg font-medium tracking-[0.1px] text-primary">
            {patient.firstName} {patient.lastName}
          </p>
        </div>
      </div>

      <div className="border-t border-secondary" />

      <div className="flex flex-col gap-5">
        <p className="font-display text-xl font-medium text-primary">Contact Info</p>

        <Input
          label="Email"
          type="email"
          value={draft.email}
          onChange={(value) => setDraft((d) => ({ ...d, email: value }))}
        />
        <Input
          label="Phone"
          type="tel"
          value={draft.phone}
          onChange={(value) => setDraft((d) => ({ ...d, phone: value }))}
        />
        <Input
          label="Address"
          value={draft.address}
          onChange={(value) => setDraft((d) => ({ ...d, address: value }))}
        />

        <Button color="primary" size="lg" isDisabled={!isDirty} onPress={handleSave} className="w-fit">
          Save Changes
        </Button>
      </div>

      <PatientFooter />
    </div>
  );
}
