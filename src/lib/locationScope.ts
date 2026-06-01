import { useRole } from './roleStore';
import { mockPatients, mockEmployees, mockPhysio, mockClinicLocations } from './mock-data';
import type { Patient, Employee } from './types';

// Role-dependent "your" employee ID for demo caseload
// owner → null (no personal caseload, "Yours" tab hidden)
// admin → emp1 (Emily Chen, 2 patients)
// staff → emp2 (James Wilson, 4 patients)
export function useYourEmpId(): string | null {
  const role = useRole();
  if (role === 'admin') return 'emp1';
  if (role === 'staff') return 'emp2';
  return null;
}

// Kept for backward compat in employees page (which doesn't need role-dependent ID)
export const YOUR_EMP_ID = 'emp1';

function getScopedData(role: string): { patients: Patient[]; employees: Employee[] } {
  if (role === 'owner') {
    return { patients: mockPatients, employees: mockEmployees };
  }
  const loc = mockClinicLocations.find((l) => l.id === mockPhysio.locationId);
  const locationEmpIds = new Set(loc?.employeeIds ?? []);
  const employees = mockEmployees.filter((e) => locationEmpIds.has(e.id));
  const patientIds = new Set(employees.flatMap((e) => e.patientIds));
  const patients = mockPatients.filter((p) => patientIds.has(p.id));
  return { patients, employees };
}

export function useLocationScope(): { patients: Patient[]; employees: Employee[] } {
  const role = useRole();
  return getScopedData(role);
}
