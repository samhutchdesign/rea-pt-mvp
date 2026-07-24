export interface Permissions {
  canEditPatientProfile: boolean;
  canArchivePatient: boolean;
  canTransferPatient: boolean;
  canEditContactInfo: boolean;
  canManageStaff: boolean;
  canManageBilling: boolean;
  canManageClinic: boolean;
  canManageLocation: boolean;
  canInviteUsers: boolean;
  canArchiveEmployees: boolean;
  canViewEmployeesTab: boolean;
}

const PERMISSIONS: Record<string, Permissions> = {
  // Organization / Clinic Owner / Solo Practitioner — creator of any account, manages billing,
  // manages all accounts and content under them.
  owner: {
    canEditPatientProfile: true,
    canArchivePatient: true,
    canTransferPatient: true,
    canEditContactInfo: true,
    canManageStaff: true,
    canManageBilling: true,
    canManageClinic: true,
    canManageLocation: false,
    canInviteUsers: true,
    canArchiveEmployees: true,
    canViewEmployeesTab: true,
  },
  // Clinic Manager — invited by Owner, manages accounts and content under their clinic location only.
  admin: {
    canEditPatientProfile: true,
    canArchivePatient: true,
    canTransferPatient: true,
    canEditContactInfo: true,
    canManageStaff: true,
    canManageBilling: false,
    canManageClinic: false,
    canManageLocation: true,
    canInviteUsers: true,
    canArchiveEmployees: true,
    canViewEmployeesTab: true,
  },
  // User - Editor: Practitioner — invited by Owner or Admin, only manages accounts assigned to
  // them and content they create.
  editor: {
    canEditPatientProfile: true,
    canArchivePatient: true,
    canTransferPatient: true,
    canEditContactInfo: true,
    canManageStaff: false,
    canManageBilling: false,
    canManageClinic: false,
    canManageLocation: false,
    canInviteUsers: false,
    canArchiveEmployees: false,
    canViewEmployeesTab: false,
  },
  // User - Limited Access: Staff — invited by Owner or Admin. Can invite/archive Practitioners,
  // Patients & Staff; view-only on all profiles except patient contact info; manages billing.
  limited: {
    canEditPatientProfile: false,
    canArchivePatient: true,
    canTransferPatient: false,
    canEditContactInfo: true,
    canManageStaff: false,
    canManageBilling: true,
    canManageClinic: false,
    canManageLocation: false,
    canInviteUsers: true,
    canArchiveEmployees: true,
    canViewEmployeesTab: true,
  },
};

export function getPermissions(role: string): Permissions {
  return PERMISSIONS[role] ?? PERMISSIONS.editor;
}

export function roleLabel(role: string): string {
  if (role === 'owner') return 'Clinic Owner';
  if (role === 'admin') return 'Admin';
  if (role === 'limited') return 'Staff';
  return 'Practitioner';
}
