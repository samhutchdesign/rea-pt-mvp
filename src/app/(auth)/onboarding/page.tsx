'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { UserCircle } from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  return (
    <div className="w-full max-w-lg px-4 pb-12">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-primary mb-1">Welcome to Rea</h1>
        <p className="text-sm text-tertiary">Let's set up your profile before you get started.</p>
      </div>

      <div className="rounded-2xl border border-secondary bg-primary shadow-xs p-8">
        {/* Photo upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-3">
            <UserCircle size={40} className="text-quaternary" />
          </div>
          <Button color="secondary" size="xs" onPress={() => {}}>
            Upload photo
          </Button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="mb-1 text-xs font-medium text-secondary">First Name</div>
              <Input placeholder="First name" />
            </div>
            <div className="flex-1">
              <div className="mb-1 text-xs font-medium text-secondary">Last Name</div>
              <Input placeholder="Last name" />
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-medium text-secondary">Title</div>
            <Input placeholder="e.g. Pelvic Floor Physiotherapist" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="mb-1 text-xs font-medium text-secondary">Email</div>
              <div className="w-full rounded-lg border border-secondary bg-secondary_alt px-3 py-2 text-sm text-tertiary shadow-xs">
                {email || 'your@email.com'}
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-1 text-xs font-medium text-secondary">Phone</div>
              <Input placeholder="(000) 000-0000" />
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-medium text-secondary">Credentials</div>
            <Input placeholder="e.g. PT, DPT, PRPC" />
          </div>

          <div>
            <div className="mb-1 text-xs font-medium text-secondary">Specialty</div>
            <Input placeholder="e.g. Pelvic Health, Sports Rehab" />
          </div>

          <div>
            <div className="mb-1 text-xs font-medium text-secondary">Bio</div>
            <textarea
              rows={3}
              placeholder="Tell patients a little about yourself…"
              className="w-full resize-none rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 bg-primary placeholder:text-tertiary"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            color="primary"
            size="sm"
            onPress={() => {
              if (email.toLowerCase().endsWith('@organization.com')) {
                router.push(`/onboarding/accept-invite?email=${encodeURIComponent(email)}`);
              } else {
                router.push('/dashboard');
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
