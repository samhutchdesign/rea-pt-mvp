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
      <Modal className="w-full max-w-[480px]">
        <Dialog>
          <div className="flex w-full flex-col gap-10 p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                <Lock size={20} className="text-brand-600" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="font-display m-0 text-[24px] leading-[32px] font-normal text-primary">Organization required</h2>
                <p className="m-0 text-base text-primary">
                  You need to create or join an organization to {action}.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3">
              <Button color="primary" size="lg" onPress={() => { onClose(); router.push('/dashboard'); }}>
                Create an organization
              </Button>
              <Button color="secondary" size="lg" onPress={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
