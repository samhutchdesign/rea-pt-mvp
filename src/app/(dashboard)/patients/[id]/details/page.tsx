'use client';
import { use, useState } from 'react';
import { Typography, Card, Button, Switch, Input, Modal, Alert, Tag, Flex, App } from 'antd';
import { EditOutlined, StarOutlined } from '@ant-design/icons';
import { mockPatients } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import type { PatientMetrics, InjuryHistory, ObstetricPelvicHealth, PMHx, SOHx, LifestyleHabits, MedicalHistory } from '@/lib/types';

const { Text } = Typography;

function InfoField({ label, value, hideEmpty }: { label: string; value?: string; hideEmpty: boolean }) {
  if (hideEmpty && (!value || value === 'N/A')) return null;
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 2, fontSize: 12 }}>{label}</Text>
      <div style={{ border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.04)' }}>
        <Text>{value || 'N/A'}</Text>
      </div>
    </div>
  );
}

function SectionCard({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text strong>{title}</Text>
        <Button type="text" size="small" onClick={onEdit} icon={<EditOutlined />} />
      </div>
      {children}
    </Card>
  );
}

const SECTION_TITLES: Record<string, string> = {
  metrics: 'Patient Metrics',
  injury: 'Injury or Condition History',
  obstetric: 'Obstetric & Pelvic Health',
  pmhx: 'PMHx (Past Medical / Hospitalization History)',
  sohx: 'SOHx (Social History)',
  lifestyle: 'Lifestyle & Habits',
  medical: 'Medical History',
};

const fieldLabel = (label: string) => <div style={{ marginBottom: 4, fontSize: 13 }}>{label}</div>;

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { message: messageApi } = App.useApp();
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
        otherConditions: '',
        diet: uploaded.diet,
        exercise: uploaded.exercise,
        smoker: uploaded.smoker,
        alcohol: uploaded.alcohol,
      }
    : patient?.lifestyle;

  const [hideEmpty, setHideEmpty] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const [localMetrics, setLocalMetrics] = useState<PatientMetrics | undefined>(initialMetrics);
  const [localInjury, setLocalInjury] = useState<InjuryHistory | undefined>(initialInjury);
  const [localObstetric, setLocalObstetric] = useState<ObstetricPelvicHealth | undefined>(initialObstetric);
  const [localPmhx, setLocalPmhx] = useState<PMHx | undefined>(initialPmhx);
  const [localSohx, setLocalSohx] = useState<SOHx | undefined>(initialSohx);
  const [localLifestyle, setLocalLifestyle] = useState<LifestyleHabits | undefined>(initialLifestyle);
  const [localMedical, setLocalMedical] = useState<MedicalHistory | undefined>(patient?.medicalHistory);

  if (!patient) return null;

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
        otherConditions: localLifestyle?.otherConditions ?? '',
        diet: localLifestyle?.diet ?? '',
        exercise: localLifestyle?.exercise ?? '',
        smoker: localLifestyle?.smoker ?? '',
        alcohol: localLifestyle?.alcohol ?? '',
      };
    } else if (section === 'medical') {
      values = { otherConditions: localMedical?.otherConditions ?? '' };
    }
    setDraftValues(values);
    setEditSection(section);
  };

  const saveEdit = () => {
    if (editSection === 'metrics') {
      setLocalMetrics({
        age: parseInt(draftValues.age) || 0,
        sexAssignedAtBirth: draftValues.sexAssignedAtBirth,
        height: draftValues.height,
        weight: draftValues.weight,
        handDominance: draftValues.handDominance,
      });
    } else if (editSection === 'injury') {
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
    } else if (editSection === 'obstetric') {
      setLocalObstetric({
        obstetricsHistory: draftValues.obstetricsHistory,
        bladderBowelSymptoms: draftValues.bladderBowelSymptoms,
      });
    } else if (editSection === 'pmhx') {
      setLocalPmhx({
        previousEpisode: draftValues.previousEpisode,
        pmhx: draftValues.pmhx,
        previousTreatments: draftValues.previousTreatments,
        medicationList: draftValues.medicationList,
        exams: draftValues.exams,
        allergies: draftValues.allergies,
        referringPhysician: draftValues.referringPhysician,
        referralReason: draftValues.referralReason,
      });
    } else if (editSection === 'sohx') {
      setLocalSohx({
        job: draftValues.job,
        hobbies: draftValues.hobbies,
        socialEnvironment: draftValues.socialEnvironment,
        physicalEnvironment: draftValues.physicalEnvironment,
        clientGoals: draftValues.clientGoals,
      });
    } else if (editSection === 'lifestyle') {
      setLocalLifestyle({
        otherConditions: draftValues.otherConditions,
        diet: draftValues.diet,
        exercise: draftValues.exercise,
        smoker: draftValues.smoker,
        alcohol: draftValues.alcohol,
      });
    } else if (editSection === 'medical') {
      setLocalMedical((prev) => ({ otherConditions: draftValues.otherConditions, attachments: prev?.attachments ?? [] }));
    }
    setEditSection(null);
    messageApi.success('Changes saved.');
  };

  const txt = (label: string, key: string) => (
    <div style={{ flex: 1 }}>
      {fieldLabel(label)}
      <Input value={draftValues[key] ?? ''} onChange={(e) => setDraft(key, e.target.value)} />
    </div>
  );
  const area = (label: string, key: string, rows = 2) => (
    <div>
      {fieldLabel(label)}
      <Input.TextArea rows={rows} value={draftValues[key] ?? ''} onChange={(e) => setDraft(key, e.target.value)} />
    </div>
  );

  const renderDialogFields = () => {
    if (editSection === 'metrics') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16 }}>{txt('Age', 'age')}{txt('Sex Assigned at Birth', 'sexAssignedAtBirth')}</div>
        <div style={{ display: 'flex', gap: 16 }}>{txt('Height', 'height')}{txt('Weight', 'weight')}</div>
        {txt('Hand Dominance', 'handDominance')}
      </div>
    );

    if (editSection === 'injury') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16 }}>{txt('Mechanism of Injury / Condition', 'mechanism')}{txt('Date of Onset', 'dateOfOnset')}</div>
        <div style={{ display: 'flex', gap: 16 }}>{txt('Type of Surgery / Procedure', 'surgeryType')}{txt('Date of Surgery', 'surgeryDate')}</div>
        {txt('Starting Pain Level', 'painLevel')}
        {area('Evolution of Symptoms', 'symptomEvolution')}
        {area('Functional Mobility', 'functionalMobility')}
        {area('Management of Problem to Date', 'management')}
        {txt('Home Equipment', 'homeEquipment')}
      </div>
    );

    if (editSection === 'obstetric') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {area('Obstetric History', 'obstetricsHistory', 3)}
        {area('Bladder & Bowel Symptoms', 'bladderBowelSymptoms', 3)}
      </div>
    );

    if (editSection === 'pmhx') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16 }}>{txt('Referring Physician', 'referringPhysician')}{txt('Referral Reason', 'referralReason')}</div>
        <div style={{ display: 'flex', gap: 16 }}>{txt('Previous Episode', 'previousEpisode')}{txt('Known Allergies', 'allergies')}</div>
        {txt('PMHx', 'pmhx')}
        {area('Previous Treatments', 'previousTreatments')}
        {area('Medication List', 'medicationList')}
        {area('Exams, Diagnostics, Tests', 'exams')}
      </div>
    );

    if (editSection === 'sohx') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16 }}>{txt('Job', 'job')}{txt('Hobbies', 'hobbies')}</div>
        {area('Social Environment', 'socialEnvironment')}
        {area('Physical Environment', 'physicalEnvironment')}
        {area('Client Goals', 'clientGoals')}
      </div>
    );

    if (editSection === 'lifestyle') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {area('Other Conditions', 'otherConditions')}
        <div style={{ display: 'flex', gap: 16 }}>{txt('Diet', 'diet')}{txt('Exercise', 'exercise')}</div>
        <div style={{ display: 'flex', gap: 16 }}>{txt('Smoker?', 'smoker')}{txt('Drink Alcohol?', 'alcohol')}</div>
      </div>
    );

    if (editSection === 'medical') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {area('Other Conditions', 'otherConditions', 3)}
      </div>
    );

    return null;
  };

  return (
    <>
      {uploaded && (
        <Alert
          icon={<StarOutlined />}
          showIcon
          type="info"
          style={{ marginBottom: 24, alignItems: 'center' }}
          message="This profile was pre-filled from the uploaded intake form. Review and edit any fields as needed."
          action={<Tag style={{ background: '#E3F2FD', color: '#1565C0', fontWeight: 500, border: 'none' }}>From PDF Upload</Tag>}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginBottom: 24 }}>
        <Flex align="center" gap={8}>
          <Switch checked={hideEmpty} onChange={setHideEmpty} size="small" />
          <Text>Remove N/A or Empty States</Text>
        </Flex>
      </div>

      <SectionCard title="Patient Metrics" onEdit={() => openEdit('metrics')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InfoField label="Age" value={localMetrics?.age?.toString()} hideEmpty={hideEmpty} />
          <InfoField label="Sex Assigned at Birth" value={localMetrics?.sexAssignedAtBirth} hideEmpty={hideEmpty} />
          <InfoField label="Height" value={localMetrics?.height} hideEmpty={hideEmpty} />
          <InfoField label="Weight" value={localMetrics?.weight} hideEmpty={hideEmpty} />
          <InfoField label="Hand Dominance" value={localMetrics?.handDominance} hideEmpty={hideEmpty} />
        </div>
      </SectionCard>

      <SectionCard title="Injury or Condition History" onEdit={() => openEdit('injury')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InfoField label="Mechanism of Injury / Condition" value={localInjury?.mechanism} hideEmpty={hideEmpty} />
          <InfoField label="Date of Onset" value={localInjury?.dateOfOnset} hideEmpty={hideEmpty} />
          <InfoField label="Type of Surgery / Procedure" value={localInjury?.surgeryType} hideEmpty={hideEmpty} />
          <InfoField label="Date of Surgery" value={localInjury?.surgeryDate} hideEmpty={hideEmpty} />
          <InfoField label="Starting Pain Level" value={localInjury?.painLevel} hideEmpty={hideEmpty} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 }}>
          <InfoField label="Evolution of Symptoms" value={localInjury?.symptomEvolution} hideEmpty={hideEmpty} />
          <InfoField label="Functional Mobility" value={localInjury?.functionalMobility} hideEmpty={hideEmpty} />
          <InfoField label="Management of Problem to Date" value={localInjury?.management} hideEmpty={hideEmpty} />
          <InfoField label="Home Equipment" value={localInjury?.homeEquipment} hideEmpty={hideEmpty} />
        </div>
      </SectionCard>

      <SectionCard title="Obstetric & Pelvic Health" onEdit={() => openEdit('obstetric')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <InfoField label="Obstetric History" value={localObstetric?.obstetricsHistory} hideEmpty={hideEmpty} />
          <InfoField label="Bladder & Bowel Symptoms" value={localObstetric?.bladderBowelSymptoms} hideEmpty={hideEmpty} />
        </div>
      </SectionCard>

      <SectionCard title="PMHx (Past Medical / Hospitalization History)" onEdit={() => openEdit('pmhx')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InfoField label="Referring Physician" value={localPmhx?.referringPhysician} hideEmpty={hideEmpty} />
          <InfoField label="Referral Reason" value={localPmhx?.referralReason} hideEmpty={hideEmpty} />
          <InfoField label="Previous Episode" value={localPmhx?.previousEpisode} hideEmpty={hideEmpty} />
          <InfoField label="Known Allergies" value={localPmhx?.allergies} hideEmpty={hideEmpty} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 }}>
          <InfoField label="PMHx" value={localPmhx?.pmhx} hideEmpty={hideEmpty} />
          <InfoField label="Previous Treatments" value={localPmhx?.previousTreatments} hideEmpty={hideEmpty} />
          <InfoField label="Medication List" value={localPmhx?.medicationList} hideEmpty={hideEmpty} />
          <InfoField label="Exams, Diagnostics, Tests" value={localPmhx?.exams} hideEmpty={hideEmpty} />
        </div>
      </SectionCard>

      <SectionCard title="SOHx (Social History)" onEdit={() => openEdit('sohx')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InfoField label="Job" value={localSohx?.job} hideEmpty={hideEmpty} />
          <InfoField label="Hobbies" value={localSohx?.hobbies} hideEmpty={hideEmpty} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 }}>
          <InfoField label="Social Environment" value={localSohx?.socialEnvironment} hideEmpty={hideEmpty} />
          <InfoField label="Physical Environment" value={localSohx?.physicalEnvironment} hideEmpty={hideEmpty} />
          <InfoField label="Client Goals" value={localSohx?.clientGoals} hideEmpty={hideEmpty} />
        </div>
      </SectionCard>

      <SectionCard title="Lifestyle & Habits" onEdit={() => openEdit('lifestyle')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <InfoField label="Other Conditions" value={localLifestyle?.otherConditions} hideEmpty={hideEmpty} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <InfoField label="Diet" value={localLifestyle?.diet} hideEmpty={hideEmpty} />
          <InfoField label="Exercise" value={localLifestyle?.exercise} hideEmpty={hideEmpty} />
          <InfoField label="Smoker?" value={localLifestyle?.smoker} hideEmpty={hideEmpty} />
          <InfoField label="Drink Alcohol?" value={localLifestyle?.alcohol} hideEmpty={hideEmpty} />
        </div>
      </SectionCard>

      <SectionCard title="Medical History" onEdit={() => openEdit('medical')}>
        <InfoField label="Other Conditions" value={localMedical?.otherConditions} hideEmpty={hideEmpty} />
        {localMedical?.attachments && localMedical.attachments.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {localMedical.attachments.map((file) => (
              <Text key={file} style={{ color: '#6750A4', cursor: 'pointer', display: 'block' }}>📎 {file}</Text>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal
        open={!!editSection}
        onCancel={() => setEditSection(null)}
        title={`Edit ${editSection ? SECTION_TITLES[editSection] : ''}`}
        footer={[
          <Button key="cancel" onClick={() => setEditSection(null)}>Cancel</Button>,
          <Button key="save" type="primary" onClick={saveEdit}>Save Changes</Button>,
        ]}
      >
        {renderDialogFields()}
      </Modal>
    </>
  );
}
