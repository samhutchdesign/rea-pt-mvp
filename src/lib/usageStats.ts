import { mockPatients, mockPrograms } from './mock-data';

/**
 * How many times a given employee has personally prescribed each exercise — derived from the
 * current and past (hepHistory) programs of patients assigned to them, not clinic-wide usage.
 */
export function getUsageCountByEmployee(empId: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const bump = (exerciseId: string) => { counts[exerciseId] = (counts[exerciseId] ?? 0) + 1; };

  mockPatients
    .filter((p) => p.assignedEmployeeId === empId)
    .forEach((p) => {
      const activeProgram = p.programId ? mockPrograms.find((prog) => prog.id === p.programId) : null;
      activeProgram?.exercises.forEach((pe) => bump(pe.exerciseId));
      (p.hepHistory ?? []).forEach((entry) => entry.exercises.forEach((pe) => bump(pe.exerciseId)));
    });

  return counts;
}
