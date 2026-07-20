'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  useEffect(() => {
    const t = setTimeout(() => {
      router.push(`/onboarding?email=${encodeURIComponent(email)}`);
    }, 2000);
    return () => clearTimeout(t);
  }, [email, router]);

  return (
    <div className="w-full max-w-sm px-4">
      <div className="rounded-2xl border border-secondary bg-primary shadow-xs p-8 text-center">
        <div className="mb-5 flex justify-center">
          <div className="size-10 animate-spin rounded-full border-2 border-secondary border-t-brand-600" />
        </div>
        <h1 className="text-xl font-semibold text-primary mb-2">Check your inbox</h1>
        <p className="text-sm text-tertiary mb-1">We sent a sign-in link to</p>
        <p className="text-sm font-semibold text-primary mb-6 break-all">{email}</p>
        <p className="text-xs text-tertiary">Signing you in automatically…</p>
        <button className="mt-4 text-xs text-brand-600 hover:text-brand-700 transition-colors">
          Didn't receive it? Resend
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
