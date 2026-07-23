'use client';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Avatar } from '@/components/base/avatar/avatar';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Divider } from '@/components/ui/divider';
import { mockClinic } from '@/lib/mock-data';
import { roleLabel } from '@/lib/permissions';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { Building2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const can = usePermissions();
  const role = useRole();
  const identity = useCurrentIdentity();

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Your Profile' }]} />
      <div className="p-8 max-w-[640px]">
        <h2 className="text-xl font-semibold text-primary mt-0 mb-6">Your Profile</h2>

        <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5 mb-4">
          {/* Avatar + name row */}
          <div className="flex items-center gap-5 mb-6">
            <Avatar
              size="2xl"
              src={identity.avatarUrl}
              alt={`${identity.firstName} ${identity.lastName}`}
              initials={identity.avatarInitials}
              className="shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-sm text-primary">
                  {identity.firstName} {identity.lastName}
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand-700">
                  {roleLabel(role)}
                </span>
              </div>
              <span className="text-secondary text-sm">{identity.title}</span>
            </div>
            <Button color="secondary" size="xs" onPress={() => {}}>Change Photo</Button>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-5" key={identity.id}>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="mb-1 text-xs text-secondary">First Name</div>
                <Input defaultValue={identity.firstName} />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-xs text-secondary">Last Name</div>
                <Input defaultValue={identity.lastName} />
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-secondary">Title</div>
              <Input defaultValue={identity.title} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="mb-1 text-xs text-secondary">Email</div>
                <Input defaultValue={identity.email} />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-xs text-secondary">Phone</div>
                <Input defaultValue={identity.phone} />
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-secondary">Credentials</div>
              <Input defaultValue={identity.credentials} />
            </div>
            <div>
              <div className="mb-1 text-xs text-secondary">Specialty</div>
              <Input defaultValue={identity.specialties.join(', ')} />
            </div>
            <div>
              <div className="mb-1 text-xs text-secondary">Bio</div>
              <textarea
                rows={3}
                defaultValue={identity.bio}
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
