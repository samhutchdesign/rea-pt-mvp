'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { NativeSelect } from '@/components/ui/native-select';
import { mockClinicLocations } from '@/lib/mock-data';
import { useAvailableLocationIds } from '@/lib/locationScope';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddPatientDialog({ open, onClose }: Props) {
  const router = useRouter();
  const availableLocationIds = useAvailableLocationIds();
  const availableLocations = mockClinicLocations.filter((l) => availableLocationIds.includes(l.id));

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [locationId, setLocationId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!locationId) e.location = 'Please select a location';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onClose();
    router.push('/patients/pat4/overview?welcome=1');
    reset();
  };

  const reset = () => {
    setErrors({});
    setFirstName(''); setLastName(''); setEmail(''); setLocationId('');
  };

  const handleClose = () => { onClose(); reset(); };

  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <Modal className="w-full max-w-[480px]">
        <Dialog>
          <div className="flex w-full flex-col gap-10 p-8">
            <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Add New Patient</h2>

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
                label="Email"
                value={email}
                onChange={setEmail}
                hint={errors.email}
              />
              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary">Location</label>
                <NativeSelect
                  className="h-12"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                >
                  <option value="">Select a location</option>
                  {availableLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} — {loc.city}, {loc.regionCountry}</option>
                  ))}
                </NativeSelect>
                {errors.location && <p className="m-0 text-xs text-error-600">{errors.location}</p>}
              </div>
            </div>

            <div className="flex w-full justify-end gap-4">
              <Button color="secondary" size="lg" onPress={handleClose}>Cancel</Button>
              <Button color="primary" size="lg" onPress={handleConfirm}>Add New Patient</Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
