import { useRole } from './roleStore';
import { useLocationId } from './locationStore';
import { useStaffPersona } from './staffPersonaStore';
import { useOrgId } from './orgStore';
import { mockPatients, mockEmployees, mockClinicLocations } from './mock-data';
import type { Patient, Employee } from './types';

export function useYourEmpId(): string | null {
  const role = useRole();
  const persona = useStaffPersona();
  if (role === 'admin') return 'emp1';
  if (role === 'staff') return persona;
  return null;
}

export const YOUR_EMP_ID = 'emp1';

function employeesAtLoc(locId: string): Employee[] {
  const loc = mockClinicLocations.find((l) => l.id === locId);
  const ids = new Set(loc?.employeeIds ?? []);
  return mockEmployees.filter((e) => ids.has(e.id));
}

function patientsOf(employees: Employee[]): Patient[] {
  const ids = new Set(employees.flatMap((e) => e.patientIds));
  return mockPatients.filter((p) => ids.has(p.id));
}

export function useLocationScope(): { patients: Patient[]; employees: Employee[] } {
  const role = useRole();
  const locationId = useLocationId();
  const persona = useStaffPersona();
  const activeOrgId = useOrgId();

  if (role === 'owner') {
    // Owner sees all data — org filter only applies when a specific org is active
    const orgPatients = mockPatients.filter((p) => p.clinicId === activeOrgId);
    const orgEmployees = mockEmployees.filter((e) =>
      e.locationIds.some((l) => mockClinicLocations.find((loc) => loc.id === l)?.orgId === activeOrgId)
    );
    if (locationId === 'all') return { patients: orgPatients, employees: orgEmployees };
    const loc = mockClinicLocations.find((l) => l.id === locationId && l.orgId === activeOrgId);
    const emps = employeesAtLoc(locationId);
    const patients = loc ? patientsOf(emps).filter((p) => p.location.includes(loc.city) && p.clinicId === activeOrgId) : [];
    return { patients, employees: emps };
  }

  // admin or staff: constrain to their locations within the active org
  const empId = role === 'admin' ? 'emp1' : persona;
  const yourEmp = mockEmployees.find((e) => e.id === empId);

  // Locations this user works at that belong to the active org
  const orgLocIds = new Set(
    mockClinicLocations
      .filter((l) => l.orgId === activeOrgId && yourEmp?.locationIds.includes(l.id))
      .map((l) => l.id)
  );

  const targetLocId = orgLocIds.has(locationId) ? locationId : 'all';

  if (targetLocId === 'all') {
    const emps = mockEmployees.filter((e) => e.locationIds.some((l) => orgLocIds.has(l)));
    const allPats = patientsOf(emps);
    return {
      patients: allPats.filter((p) => p.clinicId === activeOrgId),
      employees: emps,
    };
  }

  const loc = mockClinicLocations.find((l) => l.id === targetLocId);
  const emps = employeesAtLoc(targetLocId);
  const allPats = patientsOf(emps);
  const patients = loc
    ? allPats.filter((p) => p.location.includes(loc.city) && p.clinicId === activeOrgId)
    : allPats;
  return { patients, employees: emps };
}

export function useAvailableLocationIds(): string[] {
  const role = useRole();
  const persona = useStaffPersona();
  const activeOrgId = useOrgId();
  if (role === 'owner') return mockClinicLocations.filter((l) => l.orgId === activeOrgId).map((l) => l.id);
  const empId = role === 'admin' ? 'emp1' : persona;
  const emp = mockEmployees.find((e) => e.id === empId);
  return (emp?.locationIds ?? []).filter(
    (locId) => mockClinicLocations.find((l) => l.id === locId)?.orgId === activeOrgId
  );
}
