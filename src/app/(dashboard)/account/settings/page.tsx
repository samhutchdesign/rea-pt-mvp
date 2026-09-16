'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Toggle } from '@/components/base/toggle/toggle';
import { Button } from '@/components/base/buttons/button';
import { Divider } from '@/components/ui/divider';
import { NativeSelect } from '@/components/ui/native-select';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { ModalWarningMessage } from '@/components/application/modals/modal-warning';
import { SignatureFontPicker } from '@/components/ui/signature-font-picker';
import { useThemeMode, setThemeMode } from '@/lib/themeStore';
import { useRole } from '@/lib/roleStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { useSignatureFontId, setSignatureFontId, SIGNATURE_FONTS } from '@/lib/employeeSignatureStore';
import { mockEmployees } from '@/lib/mock-data';
import type { UserRole } from '@/lib/types';
import { Crown } from 'lucide-react';

type OutgoingChoice = UserRole | 'remove';

const OUTGOING_ROLE_OPTIONS: { value: OutgoingChoice; label: string }[] = [
  { value: 'admin', label: 'Manager' },
  { value: 'editor', label: 'Practitioner' },
  { value: 'limited', label: 'Staff' },
  { value: 'remove', label: 'Remove me from the organization' },
];

function TransferOwnershipModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const currentIdentity = useCurrentIdentity();
  const eligibleEmployees = mockEmployees.filter((e) => !e.archived && e.id !== currentIdentity.id);

  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [outgoingChoice, setOutgoingChoice] = useState<OutgoingChoice | ''>('');

  const reset = () => {
    setTargetEmployeeId('');
    setOutgoingChoice('');
  };

  const handleClose = () => { onClose(); reset(); };

  const canConfirm = !!targetEmployeeId && !!outgoingChoice;

  const handleConfirm = () => {
    const targetEmployee = mockEmployees.find((e) => e.id === targetEmployeeId);
    const newOwnerName = `${targetEmployee?.firstName} ${targetEmployee?.lastName}`;

    toast.success(`Ownership transferred to ${newOwnerName}.`);

    if (outgoingChoice === 'remove') {
      toast.success(`${currentIdentity.firstName} ${currentIdentity.lastName} has been removed from the organization.`);
    } else {
      const label = OUTGOING_ROLE_OPTIONS.find((o) => o.value === outgoingChoice)?.label;
      toast.success(`${currentIdentity.firstName} ${currentIdentity.lastName}'s role updated to ${label}.`);
    }

    handleClose();
  };

  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <Modal className="w-full max-w-[480px]">
        <Dialog>
          <div className="flex w-full flex-col gap-10 p-8">
            <div className="flex w-full flex-col gap-4">
              <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Transfer Ownership</h2>
              <p className="m-0 text-base text-primary">
                Hand off full control of the organization to someone else. This includes billing, account permissions, and all content viewing and edit capabilities.
              </p>
              <ModalWarningMessage>
                This gives the new Owner complete control of the organization and cannot be undone.
              </ModalWarningMessage>
            </div>

            <NativeSelect
              className="h-12"
              value={targetEmployeeId}
              onChange={(e) => setTargetEmployeeId(e.target.value)}
            >
              <option value="">Select an employee…</option>
              {eligibleEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} — {e.role === 'admin' ? 'Manager' : e.role === 'limited' ? 'Staff' : 'Practitioner'}
                </option>
              ))}
            </NativeSelect>

            <div className="flex flex-col gap-2">
              <label className="block text-xs text-secondary">Your New Role</label>
              <NativeSelect
                className="h-12"
                value={outgoingChoice}
                onChange={(e) => setOutgoingChoice(e.target.value as OutgoingChoice)}
              >
                <option value="">Select what happens to your account…</option>
                {OUTGOING_ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </NativeSelect>
            </div>

            <div className="flex w-full justify-end gap-4">
              <Button color="secondary" size="lg" onPress={handleClose}>Cancel</Button>
              <Button color="warning" size="lg" isDisabled={!canConfirm} onPress={handleConfirm}>
                Transfer Ownership
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function SignatureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const currentIdentity = useCurrentIdentity();
  const savedFontId = useSignatureFontId(currentIdentity.id);
  const fullName = `${currentIdentity.firstName} ${currentIdentity.lastName}`;

  const [selected, setSelected] = useState(savedFontId ?? SIGNATURE_FONTS[0].id);

  const handleClose = () => {
    onClose();
    setSelected(savedFontId ?? SIGNATURE_FONTS[0].id);
  };

  const handleSave = () => {
    setSignatureFontId(currentIdentity.id, selected);
    toast.success('Signature saved.');
    handleClose();
  };

  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <Modal className="w-full max-w-[480px]">
        <Dialog>
          <div className="flex w-full flex-col gap-10 p-8">
            <div className="flex w-full flex-col gap-4">
              <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Choose Your Signature</h2>
            </div>

            <SignatureFontPicker name={fullName} value={selected} onChange={setSelected} />

            <div className="flex w-full justify-end gap-4">
              <Button color="secondary" size="lg" onPress={handleClose}>Cancel</Button>
              <Button color="primary" size="lg" onPress={handleSave}>Update Signature</Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function SettingsContent() {
  const router = useRouter();
  const mode = useThemeMode();
  const role = useRole();
  const searchParams = useSearchParams();
  const [transferOpen, setTransferOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const currentIdentity = useCurrentIdentity();
  const signatureFontId = useSignatureFontId(currentIdentity.id);
  const signatureFont = SIGNATURE_FONTS.find((f) => f.id === signatureFontId);
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    if (searchParams.get('transfer') === '1' && role === 'owner') setTransferOpen(true);
  }, [searchParams, role]);

  return (
    <>
      <div className="p-8 max-w-[600px]">
        <h2 className="text-xl font-semibold text-primary mt-0 mb-6">Settings</h2>

        <div className="rounded-xl border border-secondary bg-primary p-5 mb-4">
          <span className="font-semibold text-base text-primary block mb-4">Account</span>
          <div className="flex flex-wrap gap-3">
            <Button color="secondary" size="sm" onPress={() => router.push('/account/email')}>Change Email</Button>
            <Button color="secondary" size="sm" onPress={() => router.push('/account/password')}>Reset Password</Button>
          </div>
        </div>

        <div className="rounded-xl border border-secondary bg-primary p-5 mb-4">
          <span className="font-semibold text-base text-primary block mb-4">Preferences</span>
          <div className="flex items-center gap-2 mb-4">
            <Toggle
              isSelected={mode === 'dark'}
              onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
              size="sm"
            />
            <span className="text-base text-primary">Dark mode</span>
          </div>
          <div>
            <label className="block text-base text-primary mb-2">Language</label>
            <NativeSelect value={language} onChange={(e) => setLanguage(e.target.value)} wrapperClassName="max-w-[220px]">
              <option value="English">English</option>
              <option value="French">French</option>
            </NativeSelect>
          </div>
        </div>

        <div className="rounded-xl border border-secondary bg-primary p-5 mb-4">
          <span className="font-semibold text-base text-primary block mb-4">Signature</span>
          {signatureFont ? (
            <>
              <div className="rounded-lg border border-secondary bg-secondary_alt px-4 py-3 mb-3">
                <span style={{ fontFamily: signatureFont.variable }} className="text-3xl text-primary">
                  {currentIdentity.firstName} {currentIdentity.lastName}
                </span>
              </div>
              <Button color="secondary" size="sm" onPress={() => setSignatureOpen(true)}>Change Signature</Button>
            </>
          ) : (
            <>
              <p className="text-base text-secondary mb-3">No signature saved yet. You&apos;ll need one before you can sign and lock charts.</p>
              <Button color="secondary" size="sm" onPress={() => setSignatureOpen(true)}>Add Signature</Button>
            </>
          )}
        </div>

        {role === 'owner' && (
          <div className="rounded-xl border border-secondary bg-primary p-5">
            <span className="font-semibold text-base text-primary block mb-4">Organization</span>
            <Divider className="mb-4" />
            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary mb-2">Danger Zone</p>
            <Button color="secondary" size="sm" iconLeading={Crown} onPress={() => setTransferOpen(true)}>
              Transfer Ownership
            </Button>
          </div>
        )}
      </div>

      <TransferOwnershipModal open={transferOpen} onClose={() => setTransferOpen(false)} />
      <SignatureModal open={signatureOpen} onClose={() => setSignatureOpen(false)} />
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
