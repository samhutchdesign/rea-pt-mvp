'use client';
import { useState } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { cx } from '@/utils/cx';
import { ListPlus, MoreVertical, UserPlus } from 'lucide-react';

interface ExerciseCardMenuProps {
  onAddToProgram: () => void;
  onAssign: () => void;
  onOpenChange?: (isOpen: boolean) => void;
  /** 'sm' (default) is the compact button used on the MVP exercises page; 'lg' matches ProgramCardMenu's 48px circular button. */
  size?: 'sm' | 'lg';
}

export default function ExerciseCardMenu({ onAddToProgram, onAssign, onOpenChange, size = 'sm' }: ExerciseCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const handleAction = (key: React.Key) => {
    if (key === 'add-to-program') onAddToProgram();
    if (key === 'assign') onAssign();
  };

  return (
    <Dropdown.Root isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AriaButton
        aria-label="More actions"
        className={
          size === 'lg'
            ? cx(
                'flex size-12 items-center justify-center rounded-full border border-primary bg-primary text-primary transition-colors outline-none hover:bg-secondary',
                isOpen && 'bg-secondary'
              )
            : cx(
                'flex h-7 w-7 items-center justify-center rounded-md bg-white/85 text-tertiary transition-colors outline-none hover:bg-white',
                isOpen && 'bg-white'
              )
        }
      >
        <MoreVertical size={size === 'lg' ? 24 : 15} strokeWidth={1.25} />
      </AriaButton>
      <Dropdown.Popover className="w-[260px] rounded-lg border border-primary bg-primary shadow-[0px_0px_10px_3px_rgba(0,0,0,0.07)] ring-0">
        <Dropdown.Menu onAction={handleAction} className="flex flex-col gap-1 p-2">
          <Dropdown.Item size="lg" id="add-to-program" icon={(p) => <ListPlus {...p} strokeWidth={1.25} />} label="Add to Program" />
          <Dropdown.Item size="lg" id="assign" icon={(p) => <UserPlus {...p} strokeWidth={1.25} />} label="Assign to Patient" />
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
