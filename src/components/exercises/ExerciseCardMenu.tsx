'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button as AriaButton } from 'react-aria-components';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { cx } from '@/utils/cx';
import type { Exercise } from '@/lib/types';
import { Copy, Heart, ListPlus, Mic, MoreVertical, Pencil, Share2, UserPlus } from 'lucide-react';

interface ExerciseCardMenuProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToProgram: () => void;
  onAssign: () => void;
  onRecordAudio?: () => void;
  /** 'full' shows every exercise-page action (matches the detail page); 'mvp' shows only what's visible on the MVP exercises page today. */
  variant: 'full' | 'mvp';
}

export default function ExerciseCardMenu({ exercise, isFavorite, onToggleFavorite, onAddToProgram, onAssign, onRecordAudio, variant }: ExerciseCardMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (key: React.Key) => {
    if (key === 'favorite') onToggleFavorite();
    if (key === 'add-to-program') onAddToProgram();
    if (key === 'assign') onAssign();
    if (key === 'record-audio') onRecordAudio?.();
    if (key === 'edit') router.push(`/exercises/new?edit=${exercise.id}`);
    if (key === 'duplicate') router.push(`/exercises/new?duplicate=${exercise.id}`);
    if (key === 'share') toast.success('Link copied!');
    if (key === 'report') toast.info('Report submitted. Thank you!');
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
      <Dropdown.Popover className="w-56">
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="favorite" icon={Heart} label={isFavorite ? 'Unfavorite' : 'Favorite'} />
          <Dropdown.Item id="add-to-program" icon={ListPlus} label="Add to Program" />
          <Dropdown.Item id="assign" icon={UserPlus} label="Assign to Patient" />
          {variant === 'full' && onRecordAudio && <Dropdown.Item id="record-audio" icon={Mic} label="Record Audio Cue" />}
          {variant === 'full' && (
            exercise.userUploaded
              ? <Dropdown.Item id="edit" icon={Pencil} label="Edit" />
              : <Dropdown.Item id="duplicate" icon={Copy} label="Duplicate" />
          )}
          {variant === 'full' && <Dropdown.Item id="share" icon={Share2} label="Share" />}
          {variant === 'full' && <Dropdown.Item id="report" label="Report an issue" />}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
