'use client';
import { useState } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { cx } from '@/utils/cx';
import { Inbox, MoreHorizontal, Repeat } from 'lucide-react';

interface PatientHeaderMenuProps {
  onArchive: () => void;
  onReassign: () => void;
  canArchive?: boolean;
}

export function PatientHeaderMenu({ onArchive, onReassign, canArchive = true }: PatientHeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (key: React.Key) => {
    if (key === 'archive') onArchive();
    if (key === 'reassign') onReassign();
  };

  return (
    <Dropdown.Root isOpen={isOpen} onOpenChange={setIsOpen}>
      <AriaButton
        aria-label="More actions"
        className={cx(
          'flex h-9 w-9 items-center justify-center rounded-lg border border-secondary text-secondary transition-colors outline-none hover:bg-secondary_alt',
          isOpen && 'bg-secondary_alt',
        )}
      >
        <MoreHorizontal size={18} />
      </AriaButton>
      <Dropdown.Popover className="w-52">
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="reassign" icon={Repeat} label="Reassign" />
          {canArchive && <Dropdown.Item id="archive" icon={Inbox} label="Archive Patient" />}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
