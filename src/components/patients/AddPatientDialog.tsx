'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { NativeSelect } from '@/components/ui/native-select';
import { ProgramStepper } from '@/components/programs/ProgramStepper';
import { mockClinicLocations, mockEmployees } from '@/lib/mock-data';
import { useAvailableLocationIds } from '@/lib/locationScope';

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = ['Patient Info', 'Assign Location & PT'];

export default function AddPatientDialog({ open, onClose }: Props) {
  const router = useRouter();
  const availableLocationIds = useAvailableLocationIds();
  const availableLocations = mockClinicLocations.filter((l) => availableLocationIds.includes(l.id));

  const [activeStep, setActiveStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [locationId, setLocationId] = useState('');
  const [ptId, setPtId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const destinationLocation = mockClinicLocations.find((l) => l.id === locationId) ?? null;
  const eligiblePts = destinationLocation
    ? mockEmployees.filter((e) => destinationLocation.employeeIds.includes(e.id) && !e.archived)
    : [];

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!locationId) e.location = 'Please select a location';
    if (!ptId) e.pt = 'Please select a treating PT';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep0()) return;
    setActiveStep(1);
  };

  const handleBack = () => setActiveStep(0);

  const handleSelectLocation = (id: string) => {
    setLocationId(id);
    setPtId('');
  };

  const handleConfirm = () => {
    if (!validateStep1()) return;
    onClose();
    router.push('/patients/pat4/overview?welcome=1');
    reset();
  };

  const reset = () => {
    setActiveStep(0);
    setErrors({});
    setFirstName(''); setLastName(''); setEmail(''); setLocationId(''); setPtId('');
  };

  const handleClose = () => { onClose(); reset(); };

  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <Modal className="w-full max-w-[480px]">
        <Dialog>
          <div className="flex w-full flex-col gap-10 p-8">
            <div className="flex w-full flex-col gap-6">
              <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Add New Patient</h2>
              <ProgramStepper
                steps={STEPS}
                currentStep={activeStep}
                maxReachedStep={activeStep}
                onStepClick={(step) => { if (step === 0) handleBack(); }}
              />
            </div>

            {activeStep === 0 && (
              <div className="flex flex-col gap-5">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      size="lg"
                      label="First Name"
                      value={firstName}
                      onChange={setFirstName}
                      hint={errors.firstName}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      size="lg"
                      label="Last Name"
                      value={lastName}
                      onChange={setLastName}
                      hint={errors.lastName}
                    />
                  </div>
                </div>
                <Input
                  size="lg"
                  label="Email Address"
                  value={email}
                  onChange={setEmail}
                  hint={errors.email}
                />
              </div>
            )}

            {activeStep === 1 && (
              <div className="flex flex-col gap-5">
                <p className="m-0 text-base text-primary">Which clinic location and PT will {firstName} be seen by?</p>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-secondary">Location</label>
                  <NativeSelect
                    className="h-12"
                    value={locationId}
                    onChange={(e) => handleSelectLocation(e.target.value)}
                  >
                    <option value="">Select a location</option>
                    {availableLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name} — {loc.city}, {loc.regionCountry}</option>
                    ))}
                  </NativeSelect>
                  {errors.location && <p className="m-0 text-xs text-error-600">{errors.location}</p>}
                </div>
                {destinationLocation && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-secondary">Assigned Practitioner</label>
                    <NativeSelect
                      className="h-12"
                      value={ptId}
                      onChange={(e) => setPtId(e.target.value)}
                    >
                      <option value="">Select a PT</option>
                      {eligiblePts.map((e) => (
                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.credentials}</option>
                      ))}
                    </NativeSelect>
                    {errors.pt && <p className="m-0 text-xs text-error-600">{errors.pt}</p>}
                    {destinationLocation && eligiblePts.length === 0 && !errors.pt && (
                      <p className="m-0 text-xs text-tertiary">No physiotherapists are staffed at this location yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex w-full justify-end gap-4">
              <Button color="secondary" size="lg" onPress={handleClose}>Cancel</Button>
              {activeStep > 0 && (
                <Button color="secondary" size="lg" onPress={handleBack}>Back</Button>
              )}
              {activeStep === 0
                ? <Button color="primary" size="lg" onPress={handleNext}>Next</Button>
                : <Button color="primary" size="lg" onPress={handleConfirm}>Create Patient</Button>}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
