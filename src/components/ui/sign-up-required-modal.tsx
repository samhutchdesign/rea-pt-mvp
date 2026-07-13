'use client';
import { useRouter } from 'next/navigation';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { Lock } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  action?: string;
}

export function SignUpRequiredModal({ open, onClose, action = 'access this feature' }: Props) {
  const router = useRouter();
  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Modal className="w-full max-w-sm">
        <Dialog>
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                <Lock size={20} className="text-brand-600" />
              </div>
              <h2 className="text-lg font-semibold text-primary mb-1">Organization required</h2>
              <p className="text-sm text-tertiary leading-relaxed">
                You need to create or join an organization to {action}.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button color="primary" size="sm" onPress={() => { onClose(); router.push('/dashboard'); }}>
                Create an organization
              </Button>
              <Button color="secondary" size="sm" onPress={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
