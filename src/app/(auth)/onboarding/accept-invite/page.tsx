'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/base/buttons/button';
import { setRole } from '@/lib/roleStore';
import { Building2 } from 'lucide-react';

function AcceptInviteContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  function acceptInvite() {
    setRole('admin');
    router.push('/patients');
  }

  return (
    <div className="w-full max-w-sm px-4">
      <div className="rounded-2xl border border-secondary bg-primary shadow-xs p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4">
            <Building2 size={24} className="text-brand-600" />
          </div>
          <h1 className="text-xl font-semibold text-primary mb-1">You've been invited</h1>
          <p className="text-sm text-tertiary">
            You've been added to the following organization
          </p>
        </div>

        <div className="rounded-xl border border-secondary bg-secondary_alt p-4 mb-6">
          <p className="text-sm font-semibold text-primary mb-0.5">Westside Physiotherapy</p>
          <p className="text-xs text-tertiary mb-3">westside-physio.com</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary">Your role:</span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand-700">
              Admin
            </span>
          </div>
          {email && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-secondary">Invited as:</span>
              <span className="text-xs text-primary">{email}</span>
            </div>
          )}
        </div>

        <Button color="primary" size="md" onPress={acceptInvite}>
          Accept &amp; join
        </Button>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteContent />
    </Suspense>
  );
}
