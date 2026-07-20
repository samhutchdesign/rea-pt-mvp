'use client';
import type { ReactNode } from 'react';
import { Dialog as AriaDialog, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from 'react-aria-components';
import { cx } from '@/utils/cx';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  className?: string;
}

export const Drawer = ({ open, onClose, children, width = 480, className }: DrawerProps) => {
  if (!open) return null;
  return (
    <AriaModalOverlay
      isOpen={open}
      isDismissable
      onOpenChange={(v) => { if (!v) onClose(); }}
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-overlay/50 backdrop-blur-sm data-[entering]:animate-in data-[entering]:fade-in data-[exiting]:animate-out data-[exiting]:fade-out duration-200"
    >
      <AriaModal
        style={{ width }}
        className={cx(
          'flex flex-col bg-primary shadow-xl outline-none h-full overflow-hidden',
          'data-[entering]:animate-in data-[entering]:slide-in-from-right data-[exiting]:animate-out data-[exiting]:slide-out-to-right duration-300',
          className
        )}
      >
        <AriaDialog className="flex flex-col flex-1 overflow-hidden outline-none">
          {children}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
};
