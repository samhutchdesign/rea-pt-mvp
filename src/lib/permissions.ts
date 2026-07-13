export interface Permissions {
  canEditPatientProfile: boolean;
  canArchivePatient: boolean;
  canTransferPatient: boolean;
  canEditContactInfo: boolean;
  canManageStaff: boolean;
  canManageBilling: boolean;
  canManageClinic: boolean;
  canManageLocation: boolean;
}

const PERMISSIONS: Record<string, Permissions> = {
  owner: {
    canEditPatientProfile: true,
    canArchivePatient: true,
    canTransferPatient: true,
    canEditContactInfo: true,
    canManageStaff: true,
    canManageBilling: true,
    canManageClinic: true,
    canManageLocation: false,
  },
  admin: {
    canEditPatientProfile: true,
    canArchivePatient: true,
    canTransferPatient: true,
    canEditContactInfo: true,
    canManageStaff: true,
    canManageBilling: false,
    canManageClinic: false,
    canManageLocation: true,
  },
  staff: {
    canEditPatientProfile: true,
    canArchivePatient: true,
    canTransferPatient: true,
    canEditContactInfo: true,
    canManageStaff: false,
    canManageBilling: false,
    canManageClinic: false,
    canManageLocation: false,
  },
};

export function getPermissions(role: string): Permissions {
  return PERMISSIONS[role] ?? PERMISSIONS.staff;
}

export function roleLabel(role: string): string {
  if (role === 'owner') return 'Clinic Owner';
  if (role === 'admin') return 'Admin';
  return 'User';
}

