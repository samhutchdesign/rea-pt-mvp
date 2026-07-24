'use client';
import { useState } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { cx } from '@/utils/cx';
import type { Program } from '@/lib/types';
import { Copy, Heart, MoreVertical, Pencil, Trash2, UserPlus } from 'lucide-react';

interface ProgramCardMenuProps {
  program: Program;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function ProgramCardMenu({ program, isFavorite, onToggleFavorite, onAssign, onEdit, onDelete, onDuplicate }: ProgramCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (key: React.Key) => {
    if (key === 'favorite') onToggleFavorite();
    if (key === 'assign') onAssign();
    if (key === 'edit') onEdit();
    if (key === 'delete') onDelete();
    if (key === 'duplicate') onDuplicate();
  };

  return (
    <Dropdown.Root isOpen={isOpen} onOpenChange={setIsOpen}>
      <AriaButton
        aria-label="More actions"
        className={cx(
          'flex h-7 w-7 items-center justify-center rounded-md text-tertiary transition-colors outline-none opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-secondary',
          isOpen && 'opacity-100 bg-secondary'
        )}
      >
        <MoreVertical size={15} />
      </AriaButton>
      <Dropdown.Popover className="w-52">
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="favorite" icon={Heart} label={isFavorite ? 'Unfavourite' : 'Favourite'} />
          <Dropdown.Item id="assign" icon={UserPlus} label="Assign to Patient" />
          {program.userCreated ? (
            <>
              <Dropdown.Item id="edit" icon={Pencil} label="Edit" />
              <Dropdown.Item id="delete" icon={Trash2} label="Delete" />
            </>
          ) : (
            <Dropdown.Item id="duplicate" icon={Copy} label="Duplicate" />
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
