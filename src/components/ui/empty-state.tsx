'use client';
import { useRouter } from 'next/navigation';
import type { ComponentType } from 'react';
import { Button } from '@/components/base/buttons/button';

interface EmptyStateProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-8">
      <div className="flex flex-col items-center text-center max-w-xs">
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-5">
          <Icon size={24} className="text-quaternary" />
        </div>
        <h2 className="text-base font-semibold text-primary mb-2">{title}</h2>
        <p className="text-sm text-tertiary mb-6 leading-relaxed">{description}</p>
        <Button color="primary" size="sm" onPress={() => router.push('/dashboard')}>
          Create an organization
        </Button>
      </div>
    </div>
  );
}
