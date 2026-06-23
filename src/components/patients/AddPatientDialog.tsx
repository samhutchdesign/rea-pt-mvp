'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Input, Typography, Steps, Divider, Select } from 'antd';
import { mockClinicLocations } from '@/lib/mock-data';
import { useRole } from '@/lib/roleStore';

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddPatientDialog({ open, onClose }: Props) {
  const router = useRouter();
  const role = useRole();
  const isOwner = role === 'owner';

  const [activeStep, setActiveStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [locationId, setLocationId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = isOwner ? ['Patient Info', 'Select Location'] : [];

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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1 && !validateStep1()) return;
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleCreate = () => {
    if (!validateStep0()) return;
    onClose();
    router.push('/patients/pat4/overview?welcome=1');
    reset();
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
    setFirstName(''); setLastName(''); setEmail(''); setLocationId('');
  };

  const handleClose = () => { onClose(); reset(); };

  const isLastStep = isOwner ? activeStep === steps.length - 1 : true;

  const fieldLabel = (label: string, required?: boolean) => (
    <div style={{ marginBottom: 4, fontSize: 13 }}>
      {label}{required && <span style={{ color: '#D32F2F' }}> *</span>}
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={560}
      title={<Title level={3} style={{ margin: 0 }}>Add New Patient</Title>}
      footer={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button type="text" onClick={handleClose} style={{ color: '#49454F' }}>Cancel</Button>
          <div style={{ flexGrow: 1 }} />
          {isOwner && activeStep > 0 && <Button onClick={handleBack} style={{ marginRight: 8 }}>Back</Button>}
          {isOwner ? (
            isLastStep
              ? <Button type="primary" onClick={handleConfirm}>Create Patient</Button>
              : <Button type="primary" onClick={handleNext}>Next</Button>
          ) : (
            <Button type="primary" onClick={handleCreate}>Create Patient</Button>
          )}
        </div>
      }
    >
      <Divider style={{ marginTop: 0 }} />

      <div style={{ paddingTop: 8 }}>
        {isOwner && (
          <Steps
            current={activeStep}
            style={{ marginBottom: 32 }}
            items={steps.map((label) => ({ title: label }))}
          />
        )}

        {activeStep === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                {fieldLabel('First Name', true)}
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  status={errors.firstName ? 'error' : undefined}
                />
                {errors.firstName && <Text type="danger" style={{ fontSize: 12 }}>{errors.firstName}</Text>}
              </div>
              <div style={{ flex: 1 }}>
                {fieldLabel('Last Name', true)}
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  status={errors.lastName ? 'error' : undefined}
                />
                {errors.lastName && <Text type="danger" style={{ fontSize: 12 }}>{errors.lastName}</Text>}
              </div>
            </div>
            <div>
              {fieldLabel('Email Address', true)}
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                status={errors.email ? 'error' : undefined}
              />
              {errors.email && <Text type="danger" style={{ fontSize: 12 }}>{errors.email}</Text>}
            </div>
          </div>
        )}

        {isOwner && activeStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Text type="secondary">
              Which clinic location will {firstName} be seen at?
            </Text>
            <div>
              {fieldLabel('Location')}
              <Select
                style={{ width: '100%' }}
                placeholder="Select a location"
                value={locationId || undefined}
                onChange={(val) => setLocationId(val)}
                status={errors.location ? 'error' : undefined}
                options={mockClinicLocations.map((loc) => ({
                  value: loc.id,
                  label: `${loc.name} — ${loc.city}, ${loc.regionCountry}`,
                }))}
              />
              {errors.location && <Text type="danger" style={{ fontSize: 12 }}>{errors.location}</Text>}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
