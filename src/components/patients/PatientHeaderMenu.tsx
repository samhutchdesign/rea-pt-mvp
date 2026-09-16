'use client';
import { useState } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { cx } from '@/utils/cx';
import { Inbox, MoreHorizontal, Pencil, Repeat } from 'lucide-react';

interface PatientHeaderMenuProps {
  onEditProfile: () => void;
  onArchive: () => void;
  onReassign: () => void;
  canArchive?: boolean;
}

export function PatientHeaderMenu({ onEditProfile, onArchive, onReassign, canArchive = true }: PatientHeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (key: React.Key) => {
    if (key === 'edit') onEditProfile();
    if (key === 'archive') onArchive();
    if (key === 'reassign') onReassign();
  };

  return (
    <Dropdown.Root isOpen={isOpen} onOpenChange={setIsOpen}>
      <AriaButton
        aria-label="More actions"
        className={cx(
          'flex size-12 items-center justify-center rounded-full border border-primary bg-primary text-primary transition-colors outline-none hover:bg-secondary',
          isOpen && 'bg-secondary',
        )}
      >
        <MoreHorizontal size={24} strokeWidth={1.25} />
      </AriaButton>
      <Dropdown.Popover className="w-52">
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="edit" icon={(p) => <Pencil {...p} strokeWidth={1.25} />} label="Edit Profile" />
          <Dropdown.Item id="reassign" icon={(p) => <Repeat {...p} strokeWidth={1.25} />} label="Transfer Patient" />
          {canArchive && <Dropdown.Item id="archive" icon={(p) => <Inbox {...p} strokeWidth={1.25} />} label="Archive Patient" />}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
