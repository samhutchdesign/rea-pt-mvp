'use client';
import { use, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { mockPatients } from '@/lib/mock-data';
import type { PatientMetrics, InjuryHistory, PMHx, SOHx, LifestyleHabits, MedicalHistory } from '@/lib/types';

function InfoField({ label, value, hideEmpty }: { label: string; value?: string; hideEmpty: boolean }) {
  if (hideEmpty && (!value || value === 'N/A')) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.3}>{label}</Typography>
      <Box sx={{ border: '1px solid #E0E0E0', borderRadius: 1, px: 1.5, py: 1, bgcolor: '#FAFAFA' }}>
        <Typography variant="body2">{value || 'N/A'}</Typography>
      </Box>
    </Box>
  );
}

function SectionCard({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
          <IconButton size="small" onClick={onEdit}><EditOutlinedIcon fontSize="small" /></IconButton>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

const SECTION_TITLES: Record<string, string> = {
  metrics: 'Patient Metrics',
  injury: 'Injury or Condition History',
  pmhx: 'PMHx (Past Medical / Hospitalization History)',
  sohx: 'SOHx (Social History)',
  lifestyle: 'Lifestyle & Habits',
  medical: 'Medical History',
};

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);

  const [hideEmpty, setHideEmpty] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [snackOpen, setSnackOpen] = useState(false);

  const [localMetrics, setLocalMetrics] = useState<PatientMetrics | undefined>(patient?.metrics);
  const [localInjury, setLocalInjury] = useState<InjuryHistory | undefined>(patient?.injuryHistory);
  const [localPmhx, setLocalPmhx] = useState<PMHx | undefined>(patient?.pmhx);
  const [localSohx, setLocalSohx] = useState<SOHx | undefined>(patient?.sohx);
  const [localLifestyle, setLocalLifestyle] = useState<LifestyleHabits | undefined>(patient?.lifestyle);
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
        symptomEvolution: localInjury?.symptomEvolution ?? '',
        functionalMobility: localInjury?.functionalMobility ?? '',
        management: localInjury?.management ?? '',
        homeEquipment: localInjury?.homeEquipment ?? '',
      };
    } else if (section === 'pmhx') {
      values = {
        previousEpisode: localPmhx?.previousEpisode ?? '',
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
      values = {
        otherConditions: localMedical?.otherConditions ?? '',
      };
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
        symptomEvolution: draftValues.symptomEvolution,
        functionalMobility: draftValues.functionalMobility,
        management: draftValues.management,
        homeEquipment: draftValues.homeEquipment,
      });
    } else if (editSection === 'pmhx') {
      setLocalPmhx({
        previousEpisode: draftValues.previousEpisode,
        pmhx: draftValues.pmhx,
        previousTreatments: draftValues.previousTreatments,
        medicationList: draftValues.medicationList,
        exams: draftValues.exams,
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
    setSnackOpen(true);
  };

  const renderDialogFields = () => {
    if (editSection === 'metrics') return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Age" size="small" fullWidth value={draftValues.age ?? ''} onChange={(e) => setDraft('age', e.target.value)} />
          <TextField label="Sex Assigned at Birth" size="small" fullWidth value={draftValues.sexAssignedAtBirth ?? ''} onChange={(e) => setDraft('sexAssignedAtBirth', e.target.value)} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Height" size="small" fullWidth value={draftValues.height ?? ''} onChange={(e) => setDraft('height', e.target.value)} />
          <TextField label="Weight" size="small" fullWidth value={draftValues.weight ?? ''} onChange={(e) => setDraft('weight', e.target.value)} />
        </Box>
        <TextField label="Hand Dominance" size="small" fullWidth value={draftValues.handDominance ?? ''} onChange={(e) => setDraft('handDominance', e.target.value)} />
      </Box>
    );

    if (editSection === 'injury') return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Mechanism of Injury / Condition" size="small" fullWidth value={draftValues.mechanism ?? ''} onChange={(e) => setDraft('mechanism', e.target.value)} />
          <TextField label="Date of Onset" size="small" fullWidth value={draftValues.dateOfOnset ?? ''} onChange={(e) => setDraft('dateOfOnset', e.target.value)} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Type of Surgery / Procedure" size="small" fullWidth value={draftValues.surgeryType ?? ''} onChange={(e) => setDraft('surgeryType', e.target.value)} />
          <TextField label="Date of Surgery" size="small" fullWidth value={draftValues.surgeryDate ?? ''} onChange={(e) => setDraft('surgeryDate', e.target.value)} />
        </Box>
        <TextField label="Evolution of Symptoms" size="small" fullWidth multiline rows={2} value={draftValues.symptomEvolution ?? ''} onChange={(e) => setDraft('symptomEvolution', e.target.value)} />
        <TextField label="Functional Mobility" size="small" fullWidth multiline rows={2} value={draftValues.functionalMobility ?? ''} onChange={(e) => setDraft('functionalMobility', e.target.value)} />
        <TextField label="Management of Problem to Date" size="small" fullWidth multiline rows={2} value={draftValues.management ?? ''} onChange={(e) => setDraft('management', e.target.value)} />
        <TextField label="Home Equipment" size="small" fullWidth value={draftValues.homeEquipment ?? ''} onChange={(e) => setDraft('homeEquipment', e.target.value)} />
      </Box>
    );

    if (editSection === 'pmhx') return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Previous Episode" size="small" fullWidth value={draftValues.previousEpisode ?? ''} onChange={(e) => setDraft('previousEpisode', e.target.value)} />
          <TextField label="PMHx" size="small" fullWidth value={draftValues.pmhx ?? ''} onChange={(e) => setDraft('pmhx', e.target.value)} />
        </Box>
        <TextField label="Previous Treatments" size="small" fullWidth multiline rows={2} value={draftValues.previousTreatments ?? ''} onChange={(e) => setDraft('previousTreatments', e.target.value)} />
        <TextField label="Medication List" size="small" fullWidth multiline rows={2} value={draftValues.medicationList ?? ''} onChange={(e) => setDraft('medicationList', e.target.value)} />
        <TextField label="Exams, Diagnostics, Tests" size="small" fullWidth multiline rows={2} value={draftValues.exams ?? ''} onChange={(e) => setDraft('exams', e.target.value)} />
      </Box>
    );

    if (editSection === 'sohx') return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Job" size="small" fullWidth value={draftValues.job ?? ''} onChange={(e) => setDraft('job', e.target.value)} />
          <TextField label="Hobbies" size="small" fullWidth value={draftValues.hobbies ?? ''} onChange={(e) => setDraft('hobbies', e.target.value)} />
        </Box>
        <TextField label="Social Environment" size="small" fullWidth multiline rows={2} value={draftValues.socialEnvironment ?? ''} onChange={(e) => setDraft('socialEnvironment', e.target.value)} />
        <TextField label="Physical Environment" size="small" fullWidth multiline rows={2} value={draftValues.physicalEnvironment ?? ''} onChange={(e) => setDraft('physicalEnvironment', e.target.value)} />
        <TextField label="Client Goals" size="small" fullWidth multiline rows={2} value={draftValues.clientGoals ?? ''} onChange={(e) => setDraft('clientGoals', e.target.value)} />
      </Box>
    );

    if (editSection === 'lifestyle') return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Other Conditions" size="small" fullWidth multiline rows={2} value={draftValues.otherConditions ?? ''} onChange={(e) => setDraft('otherConditions', e.target.value)} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Diet" size="small" fullWidth value={draftValues.diet ?? ''} onChange={(e) => setDraft('diet', e.target.value)} />
          <TextField label="Exercise" size="small" fullWidth value={draftValues.exercise ?? ''} onChange={(e) => setDraft('exercise', e.target.value)} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Smoker?" size="small" fullWidth value={draftValues.smoker ?? ''} onChange={(e) => setDraft('smoker', e.target.value)} />
          <TextField label="Drink Alcohol?" size="small" fullWidth value={draftValues.alcohol ?? ''} onChange={(e) => setDraft('alcohol', e.target.value)} />
        </Box>
      </Box>
    );

    if (editSection === 'medical') return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Other Conditions" size="small" fullWidth multiline rows={3} value={draftValues.otherConditions ?? ''} onChange={(e) => setDraft('otherConditions', e.target.value)} />
      </Box>
    );

    return null;
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
        <FormControlLabel
          control={<Switch checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} size="small" />}
          label={<Typography variant="body2">Remove N/A or Empty States</Typography>}
          sx={{ mr: 2 }}
        />
        <Button variant="outlined" size="small" disabled>Reorder Sections</Button>
      </Box>

      <SectionCard title="Patient Metrics" onEdit={() => openEdit('metrics')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <InfoField label="Age" value={localMetrics?.age?.toString()} hideEmpty={hideEmpty} />
          <InfoField label="Sex Assigned at Birth" value={localMetrics?.sexAssignedAtBirth} hideEmpty={hideEmpty} />
          <InfoField label="Height" value={localMetrics?.height} hideEmpty={hideEmpty} />
          <InfoField label="Weight" value={localMetrics?.weight} hideEmpty={hideEmpty} />
          <InfoField label="Hand Dominance" value={localMetrics?.handDominance} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="Injury or Condition History" onEdit={() => openEdit('injury')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <InfoField label="Mechanism of Injury / Condition" value={localInjury?.mechanism} hideEmpty={hideEmpty} />
          <InfoField label="Date of Onset" value={localInjury?.dateOfOnset} hideEmpty={hideEmpty} />
          <InfoField label="Type of Surgery / Procedure" value={localInjury?.surgeryType} hideEmpty={hideEmpty} />
          <InfoField label="Date of Surgery" value={localInjury?.surgeryDate} hideEmpty={hideEmpty} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 2 }}>
          <InfoField label="Evolution of Symptoms" value={localInjury?.symptomEvolution} hideEmpty={hideEmpty} />
          <InfoField label="Functional Mobility" value={localInjury?.functionalMobility} hideEmpty={hideEmpty} />
          <InfoField label="Management of Problem to Date" value={localInjury?.management} hideEmpty={hideEmpty} />
          <InfoField label="Home Equipment" value={localInjury?.homeEquipment} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="PMHx (Past Medical / Hospitalization History)" onEdit={() => openEdit('pmhx')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <InfoField label="Previous Episode" value={localPmhx?.previousEpisode} hideEmpty={hideEmpty} />
          <InfoField label="PMHx" value={localPmhx?.pmhx} hideEmpty={hideEmpty} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 2 }}>
          <InfoField label="Previous Treatments" value={localPmhx?.previousTreatments} hideEmpty={hideEmpty} />
          <InfoField label="Medication List" value={localPmhx?.medicationList} hideEmpty={hideEmpty} />
          <InfoField label="Exams, Diagnostics, Tests" value={localPmhx?.exams} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="SOHx (Social History)" onEdit={() => openEdit('sohx')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <InfoField label="Job" value={localSohx?.job} hideEmpty={hideEmpty} />
          <InfoField label="Hobbies" value={localSohx?.hobbies} hideEmpty={hideEmpty} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 2 }}>
          <InfoField label="Social Environment" value={localSohx?.socialEnvironment} hideEmpty={hideEmpty} />
          <InfoField label="Physical Environment" value={localSohx?.physicalEnvironment} hideEmpty={hideEmpty} />
          <InfoField label="Client Goals" value={localSohx?.clientGoals} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="Lifestyle & Habits" onEdit={() => openEdit('lifestyle')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
          <InfoField label="Other Conditions" value={localLifestyle?.otherConditions} hideEmpty={hideEmpty} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
          <InfoField label="Diet" value={localLifestyle?.diet} hideEmpty={hideEmpty} />
          <InfoField label="Exercise" value={localLifestyle?.exercise} hideEmpty={hideEmpty} />
          <InfoField label="Smoker?" value={localLifestyle?.smoker} hideEmpty={hideEmpty} />
          <InfoField label="Drink Alcohol?" value={localLifestyle?.alcohol} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="Medical History" onEdit={() => openEdit('medical')}>
        <InfoField label="Other Conditions" value={localMedical?.otherConditions} hideEmpty={hideEmpty} />
        {localMedical?.attachments && localMedical.attachments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {localMedical.attachments.map((file) => (
              <Typography key={file} variant="body2" color="primary" sx={{ cursor: 'pointer' }}>📎 {file}</Typography>
            ))}
          </Box>
        )}
      </SectionCard>

      {/* Edit Dialog */}
      <Dialog open={!!editSection} onClose={() => setEditSection(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Edit {editSection ? SECTION_TITLES[editSection] : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          {renderDialogFields()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditSection(null)}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={saveEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>Changes saved.</Alert>
      </Snackbar>
    </>
  );
}
