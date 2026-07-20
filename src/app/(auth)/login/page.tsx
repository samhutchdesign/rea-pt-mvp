'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const valid = email.includes('@') && email.includes('.');

  return (
    <div className="w-full max-w-sm px-4">
      <div className="rounded-2xl border border-secondary bg-primary shadow-xs p-8">
        <h1 className="text-xl font-semibold text-primary mb-1">Sign in to Rea</h1>
        <p className="text-sm text-tertiary mb-6">
          Enter your email and we'll send you a link to sign in.
        </p>
        <div className="mb-5">
          <div className="mb-1 text-xs font-medium text-secondary">Email address</div>
          <Input
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
        </div>
        <Button
          color="primary"
          size="md"
          isDisabled={!valid}
          onPress={() => router.push(`/login/verify?email=${encodeURIComponent(email)}`)}
        >
          Continue with email
        </Button>
      </div>
    </div>
  );
}
