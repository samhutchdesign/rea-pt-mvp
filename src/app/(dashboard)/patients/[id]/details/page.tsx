'use client';
import { use, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { Alert } from '@/components/ui/alert';
import { mockPatients } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import type { PatientMetrics, InjuryHistory, ObstetricPelvicHealth, PMHx, SOHx, LifestyleHabits } from '@/lib/types';
import { Pencil, Star } from 'lucide-react';

function SectionCard({
  title,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  children,
}: {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex w-full max-w-[800px] flex-col gap-8 rounded-lg border border-secondary bg-primary p-10 mb-4">
      <span className="font-display text-md font-medium tracking-[0.1px] text-primary">{title}</span>
      {!isEditing && (
        <button onClick={onEdit} className="absolute right-6 top-6 text-tertiary hover:text-secondary transition-colors p-1">
          <Pencil size={24} strokeWidth={1.25} />
        </button>
      )}
      {children}
      {isEditing && (
        <div className="flex w-full justify-end gap-4">
          <Button color="secondary" size="sm" onPress={onCancel}>Cancel</Button>
          <Button color="primary" size="sm" onPress={onSave}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}

// Pairs two fields into a row of two equal-width columns, matching the design's
// 2-col grid. A hidden/empty field just leaves its column blank rather than
// stretching its sibling — and a row where both fields are hidden renders nothing,
// so sparse real patient data doesn't leave ragged empty columns like a naive
// left/right grouping would.
const fieldRow = (a: React.ReactNode, b?: React.ReactNode) => {
  if (!a && !b) return null;
  return <div className="grid w-full grid-cols-2 gap-8">{a}{b}</div>;
};

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);
  const uploaded = getUploadedData(id);

  const initialMetrics: PatientMetrics | undefined = uploaded
    ? { age: 36, sexAssignedAtBirth: 'Female', height: '', weight: '', handDominance: '' }
    : patient?.metrics;

  const initialInjury: InjuryHistory | undefined = uploaded
    ? {
        mechanism: uploaded.chiefComplaint,
        dateOfOnset: uploaded.symptomDuration,
        surgeryType: 'Emergency C-section',
        surgeryDate: 'January 14, 2026',
        symptomEvolution: uploaded.symptomEvolution,
        functionalMobility: uploaded.functionalMobility,
        management: 'Pelvic floor exercises at home, rest; no formal physiotherapy to date',
        homeEquipment: 'None',
        painLevel: uploaded.painLevel,
      }
    : patient?.injuryHistory;

  const initialObstetric: ObstetricPelvicHealth | undefined = uploaded
    ? {
        obstetricsHistory: uploaded.obstetricsHistory,
        bladderBowelSymptoms: uploaded.bladderBowelSymptoms,
      }
    : patient?.obstetricPelvicHealth;

  const initialPmhx: PMHx | undefined = uploaded
    ? {
        previousEpisode: 'None',
        pmhx: uploaded.medicalHistory,
        previousTreatments: uploaded.previousPhysio,
        medicationList: uploaded.medications,
        exams: 'OB clearance for physiotherapy — March 2026. No imaging ordered.',
        allergies: uploaded.allergies,
        referringPhysician: uploaded.referringPhysician,
        referralReason: uploaded.referralReason,
      }
    : patient?.pmhx;

  const initialSohx: SOHx | undefined = uploaded
    ? {
        job: uploaded.occupation,
        hobbies: '',
        socialEnvironment: uploaded.socialEnvironment,
        physicalEnvironment: '',
        clientGoals: uploaded.treatmentGoals,
      }
    : patient?.sohx;

  const initialLifestyle: LifestyleHabits | undefined = uploaded
    ? {
        diet: uploaded.diet,
        exercise: uploaded.exercise,
        smoker: uploaded.smoker,
        alcohol: uploaded.alcohol,
      }
    : patient?.lifestyle;

  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const [localMetrics, setLocalMetrics] = useState<PatientMetrics | undefined>(initialMetrics);
  const [localInjury, setLocalInjury] = useState<InjuryHistory | undefined>(initialInjury);
  const [localObstetric, setLocalObstetric] = useState<ObstetricPelvicHealth | undefined>(initialObstetric);
  const [localPmhx, setLocalPmhx] = useState<PMHx | undefined>(initialPmhx);
  const [localSohx, setLocalSohx] = useState<SOHx | undefined>(initialSohx);
  const [localLifestyle, setLocalLifestyle] = useState<LifestyleHabits | undefined>(initialLifestyle);

  if (!patient) return null;

  const isEditingSection = (section: string) => !!editing[section];

  const setDraft = (key: string, val: string) => setDraftValues((d) => ({ ...d, [key]: val }));

  const openEdit = (section: string) => {
    let values: Record<string, string> = {};
    if (section === 'metrics') {
      values = {
        age: localMetrics?.age?.toString() ?? '',
        sexAssignedAtBirth: localMetrics?.sexAssignedAtBirth ?? '',
        height: localMetrics?.height ?? '',
        weight: localMetrics?.weight ?? '',
        handDominance: localMetrics?.handDominance ?? '',
      };
    } else if (section === 'injury') {
      values = {
        mechanism: localInjury?.mechanism ?? '',
        dateOfOnset: localInjury?.dateOfOnset ?? '',
        surgeryType: localInjury?.surgeryType ?? '',
        surgeryDate: localInjury?.surgeryDate ?? '',
        painLevel: localInjury?.painLevel ?? '',
        symptomEvolution: localInjury?.symptomEvolution ?? '',
        functionalMobility: localInjury?.functionalMobility ?? '',
        management: localInjury?.management ?? '',
        homeEquipment: localInjury?.homeEquipment ?? '',
      };
    } else if (section === 'obstetric') {
      values = {
        obstetricsHistory: localObstetric?.obstetricsHistory ?? '',
        bladderBowelSymptoms: localObstetric?.bladderBowelSymptoms ?? '',
      };
    } else if (section === 'pmhx') {
      values = {
        referringPhysician: localPmhx?.referringPhysician ?? '',
        referralReason: localPmhx?.referralReason ?? '',
        previousEpisode: localPmhx?.previousEpisode ?? '',
        allergies: localPmhx?.allergies ?? '',
        pmhx: localPmhx?.pmhx ?? '',
        previousTreatments: localPmhx?.previousTreatments ?? '',
        medicationList: localPmhx?.medicationList ?? '',
        exams: localPmhx?.exams ?? '',
        otherConditions: localPmhx?.otherConditions ?? '',
      };
    } else if (section === 'sohx') {
      values = {
        job: localSohx?.job ?? '',
        hobbies: localSohx?.hobbies ?? '',
        socialEnvironment: localSohx?.socialEnvironment ?? '',
        physicalEnvironment: localSohx?.physicalEnvironment ?? '',
        clientGoals: localSohx?.clientGoals ?? '',
      };
    } else if (section === 'lifestyle') {
      values = {
        diet: localLifestyle?.diet ?? '',
        exercise: localLifestyle?.exercise ?? '',
        smoker: localLifestyle?.smoker ?? '',
        alcohol: localLifestyle?.alcohol ?? '',
      };
    }
    setDraftValues((d) => ({ ...d, ...values }));
    setEditing((e) => ({ ...e, [section]: true }));
  };

  const cancelEdit = (section: string) => {
    setEditing((e) => ({ ...e, [section]: false }));
  };

  const saveEdit = (section: string) => {
    if (section === 'metrics') {
      setLocalMetrics({
        age: parseInt(draftValues.age) || 0,
        sexAssignedAtBirth: draftValues.sexAssignedAtBirth,
        height: draftValues.height,
        weight: draftValues.weight,
        handDominance: draftValues.handDominance,
      });
    } else if (section === 'injury') {
      setLocalInjury({
        mechanism: draftValues.mechanism,
        dateOfOnset: draftValues.dateOfOnset,
        surgeryType: draftValues.surgeryType,
        surgeryDate: draftValues.surgeryDate,
        painLevel: draftValues.painLevel,
        symptomEvolution: draftValues.symptomEvolution,
        functionalMobility: draftValues.functionalMobility,
        management: draftValues.management,
        homeEquipment: draftValues.homeEquipment,
      });
    } else if (section === 'obstetric') {
      setLocalObstetric({
        obstetricsHistory: draftValues.obstetricsHistory,
        bladderBowelSymptoms: draftValues.bladderBowelSymptoms,
      });
    } else if (section === 'pmhx') {
      setLocalPmhx({
        previousEpisode: draftValues.previousEpisode,
        pmhx: draftValues.pmhx,
        previousTreatments: draftValues.previousTreatments,
        medicationList: draftValues.medicationList,
        exams: draftValues.exams,
        allergies: draftValues.allergies,
        referringPhysician: draftValues.referringPhysician,
        referralReason: draftValues.referralReason,
        otherConditions: draftValues.otherConditions,
      });
    } else if (section === 'sohx') {
      setLocalSohx({
        job: draftValues.job,
        hobbies: draftValues.hobbies,
        socialEnvironment: draftValues.socialEnvironment,
        physicalEnvironment: draftValues.physicalEnvironment,
        clientGoals: draftValues.clientGoals,
      });
    } else if (section === 'lifestyle') {
      setLocalLifestyle({
        diet: draftValues.diet,
        exercise: draftValues.exercise,
        smoker: draftValues.smoker,
        alcohol: draftValues.alcohol,
      });
    }
    setEditing((e) => ({ ...e, [section]: false }));
    toast.success('Changes saved.');
  };

  // Single field renderer shared by view and edit states, so the label sits the
  // same distance from the box either way — matches the Contact tab pattern.
  const field = (label: string, key: string, value: string | undefined, isEditing: boolean) => {
    if (!isEditing && (!value || value === 'N/A')) return null;
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs text-secondary">{label}</span>
        {isEditing ? (
          <input
            type="text"
            value={draftValues[key] ?? ''}
            onChange={(e) => setDraft(key, e.target.value)}
            className="w-full rounded-lg bg-primary ring-1 ring-inset ring-primary px-3 py-2 text-base text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        ) : (
          <span className="block text-base text-primary">{value}</span>
        )}
      </div>
    );
  };

  const area = (label: string, key: string, value: string | undefined, isEditing: boolean, rows = 2) => {
    if (!isEditing && (!value || value === 'N/A')) return null;
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs text-secondary">{label}</span>
        {isEditing ? (
          <textarea
            rows={rows}
            value={draftValues[key] ?? ''}
            onChange={(e) => setDraft(key, e.target.value)}
            className="w-full rounded-lg bg-primary ring-1 ring-inset ring-primary px-3 py-2 text-base text-primary focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
          />
        ) : (
          <p className="m-0 whitespace-pre-wrap text-base text-primary">{value}</p>
        )}
      </div>
    );
  };

  return (
    <>
      {uploaded && (
        <Alert type="info" className="mb-6">
          <Star className="size-4 shrink-0 mt-0.5" strokeWidth={1.25} />
          <div className="flex flex-1 items-center justify-between gap-4">
            <span>This profile was pre-filled from the uploaded intake form. Review and edit any fields as needed.</span>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 whitespace-nowrap shrink-0">
              From PDF Upload
            </span>
          </div>
        </Alert>
      )}

      <div className="mt-10">
        <SectionCard
          title="Patient Metrics"
          isEditing={isEditingSection('metrics')}
          onEdit={() => openEdit('metrics')}
          onCancel={() => cancelEdit('metrics')}
          onSave={() => saveEdit('metrics')}
        >
          <div className="flex w-full flex-col gap-7">
            {fieldRow(
              field('Age', 'age', localMetrics?.age?.toString(), isEditingSection('metrics')),
              field('Sex Assigned at Birth', 'sexAssignedAtBirth', localMetrics?.sexAssignedAtBirth, isEditingSection('metrics')),
            )}
            {fieldRow(
              field('Height', 'height', localMetrics?.height, isEditingSection('metrics')),
              field('Weight', 'weight', localMetrics?.weight, isEditingSection('metrics')),
            )}
            {fieldRow(field('Hand Dominance', 'handDominance', localMetrics?.handDominance, isEditingSection('metrics')))}
          </div>
        </SectionCard>

        <SectionCard
          title="Injury or Condition History"
          isEditing={isEditingSection('injury')}
          onEdit={() => openEdit('injury')}
          onCancel={() => cancelEdit('injury')}
          onSave={() => saveEdit('injury')}
        >
          <div className="flex w-full flex-col gap-7">
            {fieldRow(
              field('Mechanism of Injury / Condition', 'mechanism', localInjury?.mechanism, isEditingSection('injury')),
              field('Date of Onset', 'dateOfOnset', localInjury?.dateOfOnset, isEditingSection('injury')),
            )}
            {fieldRow(
              field('Type of Surgery / Procedure', 'surgeryType', localInjury?.surgeryType, isEditingSection('injury')),
              field('Date of Surgery', 'surgeryDate', localInjury?.surgeryDate, isEditingSection('injury')),
            )}
            {fieldRow(field('Starting Pain Level', 'painLevel', localInjury?.painLevel, isEditingSection('injury')))}
          </div>
          {area('Evolution of Symptoms', 'symptomEvolution', localInjury?.symptomEvolution, isEditingSection('injury'))}
          {area('Functional Mobility', 'functionalMobility', localInjury?.functionalMobility, isEditingSection('injury'))}
          {area('Management of Problem to Date', 'management', localInjury?.management, isEditingSection('injury'))}
          {field('Home Equipment', 'homeEquipment', localInjury?.homeEquipment, isEditingSection('injury'))}
        </SectionCard>

        <SectionCard
          title="PMHx (Past Medical / Hospitalization History)"
          isEditing={isEditingSection('pmhx')}
          onEdit={() => openEdit('pmhx')}
          onCancel={() => cancelEdit('pmhx')}
          onSave={() => saveEdit('pmhx')}
        >
          <div className="flex w-full flex-col gap-7">
            {fieldRow(
              field('Referring Physician', 'referringPhysician', localPmhx?.referringPhysician, isEditingSection('pmhx')),
              field('Referral Reason', 'referralReason', localPmhx?.referralReason, isEditingSection('pmhx')),
            )}
            {fieldRow(
              field('Previous Episode', 'previousEpisode', localPmhx?.previousEpisode, isEditingSection('pmhx')),
              field('Known Allergies', 'allergies', localPmhx?.allergies, isEditingSection('pmhx')),
            )}
            {fieldRow(field('PMHx', 'pmhx', localPmhx?.pmhx, isEditingSection('pmhx')))}
          </div>
          {area('Previous Treatments', 'previousTreatments', localPmhx?.previousTreatments, isEditingSection('pmhx'))}
          {area('Medication List', 'medicationList', localPmhx?.medicationList, isEditingSection('pmhx'))}
          {area('Exams, Diagnostics, Tests', 'exams', localPmhx?.exams, isEditingSection('pmhx'))}
          {area('Other Conditions', 'otherConditions', localPmhx?.otherConditions, isEditingSection('pmhx'), 3)}
        </SectionCard>

        <SectionCard
          title="SOHx (Social History)"
          isEditing={isEditingSection('sohx')}
          onEdit={() => openEdit('sohx')}
          onCancel={() => cancelEdit('sohx')}
          onSave={() => saveEdit('sohx')}
        >
          {fieldRow(
            field('Job', 'job', localSohx?.job, isEditingSection('sohx')),
            field('Hobbies', 'hobbies', localSohx?.hobbies, isEditingSection('sohx')),
          )}
          {area('Social Environment', 'socialEnvironment', localSohx?.socialEnvironment, isEditingSection('sohx'))}
          {area('Physical Environment', 'physicalEnvironment', localSohx?.physicalEnvironment, isEditingSection('sohx'))}
          {area('Client Goals', 'clientGoals', localSohx?.clientGoals, isEditingSection('sohx'))}
        </SectionCard>

        <SectionCard
          title="Lifestyle & Habits"
          isEditing={isEditingSection('lifestyle')}
          onEdit={() => openEdit('lifestyle')}
          onCancel={() => cancelEdit('lifestyle')}
          onSave={() => saveEdit('lifestyle')}
        >
          <div className="flex w-full flex-col gap-7">
            {fieldRow(
              field('Diet', 'diet', localLifestyle?.diet, isEditingSection('lifestyle')),
              field('Exercise', 'exercise', localLifestyle?.exercise, isEditingSection('lifestyle')),
            )}
            {fieldRow(
              field('Smoker?', 'smoker', localLifestyle?.smoker, isEditingSection('lifestyle')),
              field('Drink Alcohol?', 'alcohol', localLifestyle?.alcohol, isEditingSection('lifestyle')),
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Obstetric & Pelvic Health"
          isEditing={isEditingSection('obstetric')}
          onEdit={() => openEdit('obstetric')}
          onCancel={() => cancelEdit('obstetric')}
          onSave={() => saveEdit('obstetric')}
        >
          {area('Obstetric History', 'obstetricsHistory', localObstetric?.obstetricsHistory, isEditingSection('obstetric'), 3)}
          {area('Bladder & Bowel Symptoms', 'bladderBowelSymptoms', localObstetric?.bladderBowelSymptoms, isEditingSection('obstetric'), 3)}
        </SectionCard>
      </div>
    </>
  );
}
