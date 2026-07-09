'use client';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Divider } from '@/components/ui/divider';
import { mockPhysio, mockClinic } from '@/lib/mock-data';
import { roleLabel } from '@/lib/permissions';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';
import { Building2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const can = usePermissions();
  const role = useRole();

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Your Profile' }]} />
      <div className="p-8 max-w-[640px]">
        <h2 className="text-xl font-semibold text-primary mt-0 mb-6">Your Profile</h2>

        <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5 mb-4">
          {/* Avatar + name row */}
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
              <span className="text-brand-700 font-bold text-2xl">{mockPhysio.avatarInitials}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-sm text-primary">
                  {mockPhysio.firstName} {mockPhysio.lastName}
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand-700">
                  {roleLabel(role)}
                </span>
              </div>
              <span className="text-secondary text-sm">{mockPhysio.title}</span>
            </div>
            <Button color="secondary" size="xs" onPress={() => {}}>Change Photo</Button>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="mb-1 text-xs text-secondary">First Name</div>
                <Input defaultValue={mockPhysio.firstName} />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-xs text-secondary">Last Name</div>
                <Input defaultValue={mockPhysio.lastName} />
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-secondary">Title</div>
              <Input defaultValue={mockPhysio.title} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="mb-1 text-xs text-secondary">Email</div>
                <Input defaultValue={mockPhysio.email} />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-xs text-secondary">Phone</div>
                <Input defaultValue={mockPhysio.phone} />
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-secondary">Credentials</div>
              <Input defaultValue={mockPhysio.credentials} />
            </div>
            <div>
              <div className="mb-1 text-xs text-secondary">Bio</div>
              <textarea
                rows={3}
                defaultValue={mockPhysio.bio}
                className="w-full resize-none rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 bg-primary"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button color="primary" size="sm" onPress={() => {}}>Save Changes</Button>
          </div>
        </div>

        {can.canManageClinic && (
          <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5">
            <span className="font-semibold text-sm text-primary block mb-4">Organization</span>
            <Divider className="mb-4" />
            <div
              className="flex items-center gap-4 cursor-pointer p-3 border border-secondary rounded-lg transition-all hover:bg-secondary_alt"
              onClick={() => router.push('/clinic')}
            >
              <div className="w-11 h-11 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-base">{mockClinic.logoInitials}</span>
              </div>
              <div className="flex-1">
                <span className="font-semibold text-sm text-primary block">{mockClinic.name}</span>
                <span className="text-secondary text-xs">{mockClinic.address}</span>
              </div>
              <Building2 size={18} className="text-secondary" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
