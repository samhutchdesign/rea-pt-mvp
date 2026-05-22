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
import Divider from '@mui/material/Divider';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { mockPatients } from '@/lib/mock-data';

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

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);
  const [hideEmpty, setHideEmpty] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);

  if (!patient) return null;
  const { metrics, injuryHistory, pmhx, sohx, lifestyle, medicalHistory } = patient;

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

      <SectionCard title="Patient Metrics" onEdit={() => setEditSection('metrics')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <InfoField label="Age" value={metrics?.age?.toString()} hideEmpty={hideEmpty} />
          <InfoField label="Sex Assigned at Birth" value={metrics?.sexAssignedAtBirth} hideEmpty={hideEmpty} />
          <InfoField label="Height" value={metrics?.height} hideEmpty={hideEmpty} />
          <InfoField label="Weight" value={metrics?.weight} hideEmpty={hideEmpty} />
          <InfoField label="Hand Dominance" value={metrics?.handDominance} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="Injury or Condition History" onEdit={() => setEditSection('injury')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <InfoField label="Mechanism of Injury / Condition" value={injuryHistory?.mechanism} hideEmpty={hideEmpty} />
          <InfoField label="Date of Onset" value={injuryHistory?.dateOfOnset} hideEmpty={hideEmpty} />
          <InfoField label="Type of Surgery / Procedure" value={injuryHistory?.surgeryType} hideEmpty={hideEmpty} />
          <InfoField label="Date of Surgery" value={injuryHistory?.surgeryDate} hideEmpty={hideEmpty} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 2 }}>
          <InfoField label="Evolution of Symptoms" value={injuryHistory?.symptomEvolution} hideEmpty={hideEmpty} />
          <InfoField label="Functional Mobility" value={injuryHistory?.functionalMobility} hideEmpty={hideEmpty} />
          <InfoField label="Management of Problem to Date" value={injuryHistory?.management} hideEmpty={hideEmpty} />
          <InfoField label="Home Equipment" value={injuryHistory?.homeEquipment} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="PMHx (Past Medical / Hospitalization History)" onEdit={() => setEditSection('pmhx')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <InfoField label="Previous Episode" value={pmhx?.previousEpisode} hideEmpty={hideEmpty} />
          <InfoField label="PMHx" value={pmhx?.pmhx} hideEmpty={hideEmpty} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 2 }}>
          <InfoField label="Previous Treatments" value={pmhx?.previousTreatments} hideEmpty={hideEmpty} />
          <InfoField label="Medication List" value={pmhx?.medicationList} hideEmpty={hideEmpty} />
          <InfoField label="Exams, Diagnostics, Tests" value={pmhx?.exams} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="SOHx (Social History)" onEdit={() => setEditSection('sohx')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <InfoField label="Job" value={sohx?.job} hideEmpty={hideEmpty} />
          <InfoField label="Hobbies" value={sohx?.hobbies} hideEmpty={hideEmpty} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 2 }}>
          <InfoField label="Social Environment" value={sohx?.socialEnvironment} hideEmpty={hideEmpty} />
          <InfoField label="Physical Environment" value={sohx?.physicalEnvironment} hideEmpty={hideEmpty} />
          <InfoField label="Client Goals" value={sohx?.clientGoals} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="Lifestyle & Habits" onEdit={() => setEditSection('lifestyle')}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
          <InfoField label="Other Conditions" value={lifestyle?.otherConditions} hideEmpty={hideEmpty} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
          <InfoField label="Diet" value={lifestyle?.diet} hideEmpty={hideEmpty} />
          <InfoField label="Exercise" value={lifestyle?.exercise} hideEmpty={hideEmpty} />
          <InfoField label="Smoker?" value={lifestyle?.smoker} hideEmpty={hideEmpty} />
          <InfoField label="Drink Alcohol?" value={lifestyle?.alcohol} hideEmpty={hideEmpty} />
        </Box>
      </SectionCard>

      <SectionCard title="Medical History" onEdit={() => setEditSection('medical')}>
        <InfoField label="Other Conditions" value={medicalHistory?.otherConditions} hideEmpty={hideEmpty} />
        {medicalHistory?.attachments && medicalHistory.attachments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {medicalHistory.attachments.map((file) => (
              <Typography key={file} variant="body2" color="primary" sx={{ cursor: 'pointer' }}>📎 {file}</Typography>
            ))}
          </Box>
        )}
      </SectionCard>
    </>
  );
}
