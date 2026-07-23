'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';
import { cx } from '@/utils/cx';

interface ExerciseThumbnailProps {
  src?: string;
  alt: string;
  className?: string;
  iconSize?: number;
}

export function ExerciseThumbnail({ src, alt, className, iconSize = 36 }: ExerciseThumbnailProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cx('flex size-full items-center justify-center bg-brand-50', className)}>
        <Zap size={iconSize} className="text-brand-600" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cx('size-full object-cover', className)}
      onError={() => setFailed(true)}
    />
  );
}
