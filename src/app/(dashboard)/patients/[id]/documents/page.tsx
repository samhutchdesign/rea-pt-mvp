'use client';
import { use, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { mockPatients, mockDocuments } from '@/lib/mock-data';

export default function PatientDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);
  const [expanded, setExpanded] = useState<string | false>('doc1');

  if (!patient) return null;

  const submittedDocs = patient.documents.map((pd) => {
    const template = mockDocuments.find((d) => d.id === pd.documentId);
    return { ...pd, template };
  }).filter((d) => d.template);

  if (submittedDocs.length === 0) {
    return <Typography variant="body2" color="text.secondary">No documents submitted yet.</Typography>;
  }

  return (
    <Box>
      {submittedDocs.map(({ documentId, submittedAt, fieldValues, template }) => (
        <Accordion
          key={documentId}
          expanded={expanded === documentId}
          onChange={(_, isExpanded) => setExpanded(isExpanded ? documentId : false)}
          disableGutters
          sx={{ border: '1px solid #E0E0E0', borderRadius: '8px !important', mb: 2, '&:before': { display: 'none' }, boxShadow: 'none' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1.5 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>{template!.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Updated {new Date(submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {template!.fields.map((field) => {
                const value = fieldValues[field.id];
                if (!value) return null;
                return (
                  <Box key={field.id}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.3}>{field.label}</Typography>
                    <Box sx={{ border: '1px solid #E0E0E0', borderRadius: 1, px: 1.5, py: 1, bgcolor: '#FAFAFA' }}>
                      <Typography variant="body2">{value}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
