import { useRole } from './roleStore';
import { mockPatients, mockEmployees, mockPhysio, mockClinicLocations } from './mock-data';
import type { Patient, Employee } from './types';

// The employee ID that represents "your" direct caseload in the demo
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
