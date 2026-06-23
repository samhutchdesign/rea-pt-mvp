'use client';
import { use, useState } from 'react';
import { Typography, Card, Input, Button, App } from 'antd';
import { mockPatients } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import { usePermissions } from '@/lib/permissionsHook';
import { Pencil } from 'lucide-react';

const { Text } = Typography;

export default function PatientContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { message: messageApi } = App.useApp();
  const patient = mockPatients.find((p) => p.id === id);
  const uploaded = getUploadedData(id);

  const [editingContact, setEditingContact] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState(false);

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

  const can = usePermissions();

  if (!patient) return null;

  const handleEditContact = () => {
    setContactDraft({ ...savedContact });
    setEditingContact(true);
  };

  const handleSaveContact = () => {
    setSavedContact({ ...contactDraft });
    setEditingContact(false);
    messageApi.success('Contact information updated.');
  };

  const handleEditEmergency = () => {
    setEmergencyDraft({ ...savedEmergency });
    setEditingEmergency(true);
  };

  const handleSaveEmergency = () => {
    setSavedEmergency({ ...emergencyDraft });
    setEditingEmergency(false);
    messageApi.success('Emergency contact updated.');
  };

  const readonlyStyle = { background: 'rgba(0,0,0,0.04)' };

  const field = (label: string, value: string, editing: boolean, onChange: (v: string) => void) => (
    <div style={{ flex: 1 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>{label}</Text>
      <Input
        value={value}
        readOnly={!editing}
        onChange={(e) => onChange(e.target.value)}
        style={editing ? undefined : readonlyStyle}
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Contact Information */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text strong>Contact Information</Text>
          {can.canEditContactInfo && !editingContact && (
            <Button type="text" size="small" onClick={handleEditContact} icon={<Pencil />} />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {field('First Name', editingContact ? contactDraft.firstName : savedContact.firstName, editingContact, (v) => setContactDraft((d) => ({ ...d, firstName: v })))}
            {field('Last Name', editingContact ? contactDraft.lastName : savedContact.lastName, editingContact, (v) => setContactDraft((d) => ({ ...d, lastName: v })))}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {field('Phone Number', editingContact ? contactDraft.phone : savedContact.phone, editingContact, (v) => setContactDraft((d) => ({ ...d, phone: v })))}
            {field('Email Address', editingContact ? contactDraft.email : savedContact.email, editingContact, (v) => setContactDraft((d) => ({ ...d, email: v })))}
          </div>
          {field('Home Address', editingContact ? contactDraft.address : savedContact.address, editingContact, (v) => setContactDraft((d) => ({ ...d, address: v })))}
        </div>
        {editingContact && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Button size="small" onClick={() => setEditingContact(false)}>Cancel</Button>
            <Button size="small" type="primary" onClick={handleSaveContact}>Save Changes</Button>
          </div>
        )}
      </Card>

      {/* Emergency Contact */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text strong>Emergency Contact</Text>
          {can.canEditContactInfo && !editingEmergency && (
            <Button type="text" size="small" onClick={handleEditEmergency} icon={<Pencil />} />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {field('First Name', editingEmergency ? emergencyDraft.firstName : savedEmergency.firstName, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, firstName: v })))}
            {field('Last Name', editingEmergency ? emergencyDraft.lastName : savedEmergency.lastName, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, lastName: v })))}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {field('Phone Number', editingEmergency ? emergencyDraft.phone : savedEmergency.phone, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, phone: v })))}
            {field('Email Address', editingEmergency ? emergencyDraft.email : savedEmergency.email, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, email: v })))}
          </div>
          {field('Home Address', editingEmergency ? emergencyDraft.address : savedEmergency.address, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, address: v })))}
          {field('Relationship', editingEmergency ? emergencyDraft.relationship : savedEmergency.relationship, editingEmergency, (v) => setEmergencyDraft((d) => ({ ...d, relationship: v })))}
        </div>
        {editingEmergency && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Button size="small" onClick={() => setEditingEmergency(false)}>Cancel</Button>
            <Button size="small" type="primary" onClick={handleSaveEmergency}>Save Changes</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
