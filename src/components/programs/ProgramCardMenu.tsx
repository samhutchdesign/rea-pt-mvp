'use client';
import { useState } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { cx } from '@/utils/cx';
import { Copy, Heart, MoreVertical, Pencil, Trash2, UserPlus } from 'lucide-react';

interface ProgramCardMenuProps {
  isFavorite: boolean;
  canManage: boolean;
  onToggleFavorite: () => void;
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function ProgramCardMenu({ isFavorite, canManage, onToggleFavorite, onAssign, onEdit, onDelete, onDuplicate, onOpenChange }: ProgramCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const handleAction = (key: React.Key) => {
    if (key === 'favorite') onToggleFavorite();
    if (key === 'assign') onAssign();
    if (key === 'edit') onEdit();
    if (key === 'delete') onDelete();
    if (key === 'duplicate') onDuplicate();
  };

  return (
    <Dropdown.Root isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AriaButton
        aria-label="More actions"
        className={cx(
          'flex size-12 items-center justify-center rounded-full border border-primary bg-primary text-primary transition-colors outline-none hover:bg-secondary',
          isOpen && 'bg-secondary'
        )}
      >
        <MoreVertical size={24} />
      </AriaButton>
      <Dropdown.Popover className="w-[260px] rounded-lg border border-primary bg-primary shadow-[0px_0px_10px_3px_rgba(0,0,0,0.07)] ring-0">
        <Dropdown.Menu onAction={handleAction} className="flex flex-col gap-1 p-2">
          <Dropdown.Item size="lg" id="favorite" icon={Heart} label={isFavorite ? 'Unfavorite' : 'Favorite'} />
          <Dropdown.Item size="lg" id="assign" icon={UserPlus} label="Assign to Patient" />
          {canManage ? (
            <>
              <Dropdown.Item size="lg" id="edit" icon={Pencil} label="Edit" />
              <Dropdown.Item size="lg" id="delete" icon={Trash2} label="Delete" />
            </>
          ) : (
            <Dropdown.Item size="lg" id="duplicate" icon={Copy} label="Duplicate" />
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
