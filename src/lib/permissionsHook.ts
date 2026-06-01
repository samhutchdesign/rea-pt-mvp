import { useRole } from './roleStore';
import { getPermissions } from './permissions';
import type { Permissions } from './permissions';

export function usePermissions(): Permissions {
  const role = useRole();
  return getPermissions(role);
}
