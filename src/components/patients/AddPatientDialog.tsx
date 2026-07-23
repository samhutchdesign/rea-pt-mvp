'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Divider } from '@/components/ui/divider';
import { NativeSelect } from '@/components/ui/native-select';
import { mockClinicLocations, mockEmployees } from '@/lib/mock-data';
import { useAvailableLocationIds } from '@/lib/locationScope';
import { cx } from '@/utils/cx';

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
      <Modal className="w-full max-w-lg">
        <Dialog>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-primary mb-5">Add New Patient</h2>
            <Divider className="mb-5" />

            {/* Stepper */}
            <div className="flex items-center gap-0 mb-6">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cx(
                      'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                      i < activeStep ? 'bg-brand-600 text-white' :
                      i === activeStep ? 'border-2 border-brand-600 text-brand-700' :
                      'border-2 border-secondary text-tertiary'
                    )}>
                      {i < activeStep ? '✓' : i + 1}
                    </div>
                    <span className={cx('text-xs whitespace-nowrap', i === activeStep ? 'font-semibold text-brand-700' : 'text-tertiary')}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cx('flex-1 h-px mx-3 mb-5', i < activeStep ? 'bg-brand-600' : 'bg-secondary')} />
                  )}
                </div>
              ))}
            </div>

            {activeStep === 0 && (
              <div className="flex flex-col gap-5">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      label="First Name"
                      value={firstName}
                      onChange={setFirstName}
                      hint={errors.firstName}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Last Name"
                      value={lastName}
                      onChange={setLastName}
                      hint={errors.lastName}
                    />
                  </div>
                </div>
                <Input
                  label="Email Address"
                  value={email}
                  onChange={setEmail}
                  hint={errors.email}
                />
              </div>
            )}

            {activeStep === 1 && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-secondary">Which clinic location and PT will {firstName} be seen by?</p>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Location</label>
                  <NativeSelect
                    value={locationId}
                    onChange={(e) => handleSelectLocation(e.target.value)}
                    className={errors.location ? 'border-error-300' : undefined}
                  >
                    <option value="">Select a location</option>
                    {availableLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name} — {loc.city}, {loc.regionCountry}</option>
                    ))}
                  </NativeSelect>
                  {errors.location && <p className="mt-1 text-xs text-error-600">{errors.location}</p>}
                </div>
                {destinationLocation && (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">Treating PT</label>
                    <NativeSelect
                      value={ptId}
                      onChange={(e) => setPtId(e.target.value)}
                      className={errors.pt ? 'border-error-300' : undefined}
                    >
                      <option value="">Select a PT</option>
                      {eligiblePts.map((e) => (
                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.credentials}</option>
                      ))}
                    </NativeSelect>
                    {errors.pt && <p className="mt-1 text-xs text-error-600">{errors.pt}</p>}
                    {destinationLocation && eligiblePts.length === 0 && !errors.pt && (
                      <p className="mt-1 text-xs text-tertiary">No physiotherapists are staffed at this location yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center mt-6">
              <button onClick={handleClose} className="text-sm text-tertiary hover:text-secondary transition-colors">
                Cancel
              </button>
              <div className="flex-1" />
              {activeStep > 0 && (
                <Button color="secondary" onPress={handleBack} className="mr-3">Back</Button>
              )}
              {activeStep === 0
                ? <Button color="primary" onPress={handleNext}>Next</Button>
                : <Button color="primary" onPress={handleConfirm}>Create Patient</Button>}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
