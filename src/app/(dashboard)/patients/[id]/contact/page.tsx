'use client';
import { use, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { mockPatients, mockPhysio } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import { getPermissions } from '@/lib/permissions';

export default function PatientContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);
  const uploaded = getUploadedData(id);

  const [editingContact, setEditingContact] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const [savedContact, setSavedContact] = useState({
    firstName: patient?.firstName ?? '',
    lastName: patient?.lastName ?? '',
    phone: uploaded?.phone || patient?.phone || '',
    email: patient?.email ?? '',
    address: uploaded?.address || patient?.address || '',
  });
  const [savedEmergency, setSavedEmergency] = useState({
    firstName: uploaded?.emergencyFirstName || patient?.emergencyContact?.firstName || '',
    lastName: uploaded?.emergencyLastName || patient?.emergencyContact?.lastName || '',
    phone: uploaded?.emergencyPhone || patient?.emergencyContact?.phone || '',
    email: patient?.emergencyContact?.email ?? '',
    address: patient?.emergencyContact?.address ?? '',
    relationship: uploaded?.emergencyRelationship || patient?.emergencyContact?.relationship || '',
  });
  const [contactDraft, setContactDraft] = useState({ ...savedContact });
  const [emergencyDraft, setEmergencyDraft] = useState({ ...savedEmergency });

  const can = getPermissions(mockPhysio.role);

  if (!patient) return null;

  const handleEditContact = () => {
    setContactDraft({ ...savedContact });
    setEditingContact(true);
  };

  const handleSaveContact = () => {
    setSavedContact({ ...contactDraft });
    setEditingContact(false);
    setSnackMsg('Contact information updated.');
    setSnackOpen(true);
  };

  const handleEditEmergency = () => {
    setEmergencyDraft({ ...savedEmergency });
    setEditingEmergency(true);
  };

  const handleSaveEmergency = () => {
    setSavedEmergency({ ...emergencyDraft });
    setEditingEmergency(false);
    setSnackMsg('Emergency contact updated.');
    setSnackOpen(true);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Contact Information */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>Contact Information</Typography>
              {can.canEditContactInfo && !editingContact && (
                <IconButton size="small" onClick={handleEditContact}><EditOutlinedIcon fontSize="small" /></IconButton>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>First Name</Typography>
                  <TextField
                    value={editingContact ? contactDraft.firstName : savedContact.firstName}
                    size="small" fullWidth
                    onChange={(e) => setContactDraft((d) => ({ ...d, firstName: e.target.value }))}
                    InputProps={{ readOnly: !editingContact, sx: editingContact ? {} : { bgcolor: '#FAFAFA' } }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Last Name</Typography>
                  <TextField
                    value={editingContact ? contactDraft.lastName : savedContact.lastName}
                    size="small" fullWidth
                    onChange={(e) => setContactDraft((d) => ({ ...d, lastName: e.target.value }))}
                    InputProps={{ readOnly: !editingContact, sx: editingContact ? {} : { bgcolor: '#FAFAFA' } }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Phone Number</Typography>
                  <TextField
                    value={editingContact ? contactDraft.phone : savedContact.phone}
                    size="small" fullWidth
                    onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))}
                    InputProps={{ readOnly: !editingContact, sx: editingContact ? {} : { bgcolor: '#FAFAFA' } }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Email Address</Typography>
                  <TextField
                    value={editingContact ? contactDraft.email : savedContact.email}
                    size="small" fullWidth
                    onChange={(e) => setContactDraft((d) => ({ ...d, email: e.target.value }))}
                    InputProps={{ readOnly: !editingContact, sx: editingContact ? {} : { bgcolor: '#FAFAFA' } }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Home Address</Typography>
                <TextField
                  value={editingContact ? contactDraft.address : savedContact.address}
                  size="small" fullWidth
                  onChange={(e) => setContactDraft((d) => ({ ...d, address: e.target.value }))}
                  InputProps={{ readOnly: !editingContact, sx: editingContact ? {} : { bgcolor: '#FAFAFA' } }}
                />
              </Box>
            </Box>
            {editingContact && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2.5 }}>
                <Button size="small" onClick={() => setEditingContact(false)}>Cancel</Button>
                <Button size="small" variant="contained" disableElevation onClick={handleSaveContact}>Save Changes</Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>Emergency Contact</Typography>
              {can.canEditContactInfo && !editingEmergency && (
                <IconButton size="small" onClick={handleEditEmergency}><EditOutlinedIcon fontSize="small" /></IconButton>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>First Name</Typography>
                  <TextField
                    value={editingEmergency ? emergencyDraft.firstName : savedEmergency.firstName}
                    size="small" fullWidth
                    onChange={(e) => setEmergencyDraft((d) => ({ ...d, firstName: e.target.value }))}
                    InputProps={{ readOnly: !editingEmergency, sx: editingEmergency ? {} : { bgcolor: '#FAFAFA' } }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Last Name</Typography>
                  <TextField
                    value={editingEmergency ? emergencyDraft.lastName : savedEmergency.lastName}
                    size="small" fullWidth
                    onChange={(e) => setEmergencyDraft((d) => ({ ...d, lastName: e.target.value }))}
                    InputProps={{ readOnly: !editingEmergency, sx: editingEmergency ? {} : { bgcolor: '#FAFAFA' } }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Phone Number</Typography>
                  <TextField
                    value={editingEmergency ? emergencyDraft.phone : savedEmergency.phone}
                    size="small" fullWidth
                    onChange={(e) => setEmergencyDraft((d) => ({ ...d, phone: e.target.value }))}
                    InputProps={{ readOnly: !editingEmergency, sx: editingEmergency ? {} : { bgcolor: '#FAFAFA' } }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Email Address</Typography>
                  <TextField
                    value={editingEmergency ? emergencyDraft.email : savedEmergency.email}
                    size="small" fullWidth
                    onChange={(e) => setEmergencyDraft((d) => ({ ...d, email: e.target.value }))}
                    InputProps={{ readOnly: !editingEmergency, sx: editingEmergency ? {} : { bgcolor: '#FAFAFA' } }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Home Address</Typography>
                <TextField
                  value={editingEmergency ? emergencyDraft.address : savedEmergency.address}
                  size="small" fullWidth
                  onChange={(e) => setEmergencyDraft((d) => ({ ...d, address: e.target.value }))}
                  InputProps={{ readOnly: !editingEmergency, sx: editingEmergency ? {} : { bgcolor: '#FAFAFA' } }}
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Relationship</Typography>
                <TextField
                  value={editingEmergency ? emergencyDraft.relationship : savedEmergency.relationship}
                  size="small" fullWidth
                  onChange={(e) => setEmergencyDraft((d) => ({ ...d, relationship: e.target.value }))}
                  InputProps={{ readOnly: !editingEmergency, sx: editingEmergency ? {} : { bgcolor: '#FAFAFA' } }}
                />
              </Box>
            </Box>
            {editingEmergency && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2.5 }}>
                <Button size="small" onClick={() => setEditingEmergency(false)}>Cancel</Button>
                <Button size="small" variant="contained" disableElevation onClick={handleSaveEmergency}>Save Changes</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </>
  );
}
