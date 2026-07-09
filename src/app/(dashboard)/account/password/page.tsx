'use client';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';

export default function PasswordResetPage() {
  const router = useRouter();
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Password Reset' }]} />
      <div className="p-8 max-w-[500px]">
        <h2 className="text-xl font-semibold text-primary mt-0 mb-6">Reset Password</h2>
        <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5">
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-1 text-xs text-secondary">Current Password</div>
              <Input type="password" />
            </div>
            <div>
              <div className="mb-1 text-xs text-secondary">New Password</div>
              <Input type="password" />
            </div>
            <div>
              <div className="mb-1 text-xs text-secondary">Confirm New Password</div>
              <Input type="password" />
            </div>
            <div className="flex justify-end gap-4">
              <Button color="secondary" size="sm" onPress={() => router.back()}>Cancel</Button>
              <Button color="primary" size="sm" onPress={() => {}}>Save</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
