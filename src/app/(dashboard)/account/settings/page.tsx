'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import { Toggle } from '@/components/base/toggle/toggle';
import { Button } from '@/components/base/buttons/button';
import { Divider } from '@/components/ui/divider';
import { Alert } from '@/components/ui/alert';
import { NativeSelect } from '@/components/ui/native-select';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { SignatureFontPicker } from '@/components/ui/signature-font-picker';
import { useThemeMode, setThemeMode } from '@/lib/themeStore';
import { useRole } from '@/lib/roleStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { useSignatureFontId, setSignatureFontId, SIGNATURE_FONTS } from '@/lib/employeeSignatureStore';
import { mockEmployees } from '@/lib/mock-data';
import type { UserRole } from '@/lib/types';
import { Crown } from 'lucide-react';

type NewOwnerMode = 'existing' | 'invite';
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

  const [mode, setMode] = useState<NewOwnerMode>('existing');
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [outgoingChoice, setOutgoingChoice] = useState<OutgoingChoice | ''>('');

  const reset = () => {
    setMode('existing');
    setTargetEmployeeId('');
    setInviteEmail('');
    setOutgoingChoice('');
  };

  const handleClose = () => { onClose(); reset(); };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail);
  const newOwnerValid = mode === 'existing' ? !!targetEmployeeId : emailValid;
  const canConfirm = newOwnerValid && !!outgoingChoice;

  const handleConfirm = () => {
    const targetEmployee = mode === 'existing' ? mockEmployees.find((e) => e.id === targetEmployeeId) : null;
    const newOwnerName = mode === 'existing' ? `${targetEmployee?.firstName} ${targetEmployee?.lastName}` : inviteEmail;

    if (mode === 'invite') {
      toast.success(`Invite sent to ${inviteEmail} to become the new Owner.`);
    } else {
      toast.success(`Ownership transferred to ${newOwnerName}.`);
    }

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
      <Modal className="w-full max-w-lg">
        <Dialog>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-1">Transfer Ownership</h2>
            <p className="text-sm text-secondary mb-4">
              Hand off full control of this organization — billing, all accounts, and all content — to someone else.
            </p>

            <Alert type="warning" className="mb-5">
              This gives the new Owner complete control of the organization and cannot be undone.
            </Alert>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">New Owner</label>
                <div className="flex gap-2 mb-3">
                  <Button
                    color={mode === 'existing' ? 'primary' : 'secondary'}
                    size="xs"
                    onPress={() => { setMode('existing'); setInviteEmail(''); }}
                  >
                    Existing Employee
                  </Button>
                  <Button
                    color={mode === 'invite' ? 'primary' : 'secondary'}
                    size="xs"
                    onPress={() => { setMode('invite'); setTargetEmployeeId(''); }}
                  >
                    Invite by Email
                  </Button>
                </div>

                {mode === 'existing' ? (
                  <NativeSelect
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
                ) : (
                  <input
                    type="email"
                    placeholder="newowner@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
                  />
                )}
              </div>

              <Divider />

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Your New Role</label>
                <NativeSelect
                  value={outgoingChoice}
                  onChange={(e) => setOutgoingChoice(e.target.value as OutgoingChoice)}
                >
                  <option value="">Select what happens to your account…</option>
                  {OUTGOING_ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button color="secondary" size="sm" onPress={handleClose}>Cancel</Button>
              <Button color="primary-destructive" size="sm" isDisabled={!canConfirm} onPress={handleConfirm}>
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
      <Modal className="w-full max-w-lg">
        <Dialog>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-1">Choose Your Signature</h2>
            <p className="text-sm text-secondary mb-5">
              This is stamped on every chart you sign and lock. Pick a style below.
            </p>

            <SignatureFontPicker name={fullName} value={selected} onChange={setSelected} />

            <div className="flex justify-end gap-3 mt-6">
              <Button color="secondary" size="sm" onPress={handleClose}>Cancel</Button>
              <Button color="primary" size="sm" onPress={handleSave}>Save Signature</Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function SettingsContent() {
  const mode = useThemeMode();
  const role = useRole();
  const searchParams = useSearchParams();
  const [transferOpen, setTransferOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const currentIdentity = useCurrentIdentity();
  const signatureFontId = useSignatureFontId(currentIdentity.id);
  const signatureFont = SIGNATURE_FONTS.find((f) => f.id === signatureFontId);

  useEffect(() => {
    if (searchParams.get('transfer') === '1' && role === 'owner') setTransferOpen(true);
  }, [searchParams, role]);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Settings' }]} />
      <div className="p-8 max-w-[600px]">
        <h2 className="text-xl font-semibold text-primary mt-0 mb-6">Settings</h2>
        <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5 mb-4">
          <span className="font-semibold text-sm text-primary block mb-4">Preferences</span>
          <div className="flex items-center gap-2">
            <Toggle
              isSelected={mode === 'dark'}
              onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
              size="sm"
            />
            <span className="text-sm text-primary">Dark mode</span>
          </div>
        </div>

        <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5 mb-4">
          <span className="font-semibold text-sm text-primary block mb-4">Signature</span>
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
              <p className="text-sm text-secondary mb-3">No signature saved yet. You&apos;ll need one before you can sign and lock charts.</p>
              <Button color="secondary" size="sm" onPress={() => setSignatureOpen(true)}>Add Signature</Button>
            </>
          )}
        </div>

        {role === 'owner' && (
          <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5">
            <span className="font-semibold text-sm text-primary block mb-4">Organization</span>
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
