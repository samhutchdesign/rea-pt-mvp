'use client';
import Link from 'next/link';
import { ArrowLeft, Building2, Mail, Phone } from 'lucide-react';
import { Avatar } from '@/components/base/avatar/avatar';
import { getPatientPersona } from '@/lib/patientPersona';
import { mockEmployees, mockClinics, mockClinicLocations } from '@/lib/mock-data';
import PatientFooter from '@/components/patient/PatientFooter';

export default function PatientPractitionerPage() {
  const patient = getPatientPersona();
  const practitioner = mockEmployees.find((e) => e.id === patient.assignedEmployeeId);
  const clinic = practitioner ? mockClinics.find((c) => c.id === practitioner.clinicId) : undefined;
  const locations = practitioner
    ? mockClinicLocations.filter((l) => practitioner.locationIds.includes(l.id))
    : [];

  return (
    <div className="flex flex-col gap-6 pt-7">
      <Link
        href="/program"
        className="flex h-12 w-fit items-center gap-2 rounded-lg border border-tertiary bg-primary px-4 text-base text-primary hover:bg-secondary"
      >
        <ArrowLeft size={24} strokeWidth={1.25} />
        back
      </Link>

      <p className="font-display text-2xl font-normal text-primary">Your Practitioner</p>

      {!practitioner ? (
        <p className="text-secondary">No practitioner has been assigned yet.</p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Avatar
              size="xl"
              src={practitioner.avatarUrl}
              alt={`${practitioner.firstName} ${practitioner.lastName}`}
              initials={practitioner.avatarInitials}
            />
            <div className="flex flex-col gap-2">
              <p className="font-display text-lg font-medium tracking-[0.1px] text-primary">
                {practitioner.firstName} {practitioner.lastName}
                {practitioner.credentials && <span className="text-secondary">, {practitioner.credentials}</span>}
              </p>
              <p className="text-sm text-secondary">{practitioner.title}</p>
            </div>
          </div>

          {practitioner.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {practitioner.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-full border border-secondary bg-secondary_alt px-3 py-1 text-sm text-secondary"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-secondary" />

          {practitioner.bio && (
            <>
              <p className="text-base text-primary">{practitioner.bio}</p>
              <div className="border-t border-secondary" />
            </>
          )}

          <div className="flex flex-col gap-4">
            <p className="font-display text-xl font-medium text-primary">Contact</p>
            <div className="flex items-center gap-3 text-base text-secondary">
              <Mail size={20} strokeWidth={1.25} className="shrink-0" />
              <span>{practitioner.email}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-secondary">
              <Phone size={20} strokeWidth={1.25} className="shrink-0" />
              <span>{practitioner.phone}</span>
            </div>
          </div>

          <div className="border-t border-secondary" />

          <div className="flex flex-col gap-4">
            <p className="font-display text-xl font-medium text-primary">Clinic</p>
            {clinic && (
              <div className="flex items-center gap-3 text-base text-secondary">
                <Building2 size={20} strokeWidth={1.25} className="shrink-0" />
                <span>{clinic.name}</span>
              </div>
            )}
            {locations.map((loc) => (
              <p key={loc.id} className="pl-8 text-sm text-secondary">
                {loc.name} — {loc.address}
              </p>
            ))}
          </div>
        </>
      )}

      <PatientFooter />
    </div>
  );
}
