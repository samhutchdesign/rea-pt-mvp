'use client';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Select, Card, InputNumber } from 'antd';
import TopBar from '@/components/layout/TopBar';
import { useState } from 'react';

const { Title, Text } = Typography;

const CONDITIONS = ['Incontinence', 'Prolapse', 'Pelvic Pain', 'Postpartum', 'Urgency'];
const SURGERIES = ['Post-THA', 'Post-TKA', 'C-Section', 'Post-Hysterectomy'];
const SPECIALTIES = ['Pelvic Floor', 'Orthopedic'];
const MUSCLES = ['Levator Ani', 'Coccygeus', 'Transverse Abdominis', 'Glutes', 'Diaphragm', 'Multifidus', 'Hip Abductors', 'Adductors', 'Hip Flexors', 'Quadriceps'];
const BODY_PARTS = ['Pelvis', 'Core', 'Hip', 'Spine', 'Knee'];
const FREQUENCIES = ['Daily', '2x Daily', 'Every Other Day', '3x Weekly'];

const fieldLabel = (label: string) => <div style={{ marginBottom: 4, fontSize: 13 }}>{label}</div>;

export default function NewExercisePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [hold, setHold] = useState(0);
  const [frequency, setFrequency] = useState('Daily');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Pelvic Floor']);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedSurgeries, setSelectedSurgeries] = useState<string[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const tagFields = [
    { label: 'Specialty', options: SPECIALTIES, selected: selectedSpecialties, set: setSelectedSpecialties },
    { label: 'Condition', options: CONDITIONS, selected: selectedConditions, set: setSelectedConditions },
    { label: 'Surgery', options: SURGERIES, selected: selectedSurgeries, set: setSelectedSurgeries },
    { label: 'Muscle', options: MUSCLES, selected: selectedMuscles, set: setSelectedMuscles },
    { label: 'Body Part', options: BODY_PARTS, selected: selectedBodyParts, set: setSelectedBodyParts },
  ];

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises', href: '/exercises' }, { label: 'New Exercise' }]} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 700 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 24 }}>New Exercise</Title>

        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Text strong>Basic Info</Text>
            <div>{fieldLabel('Exercise Name')}<Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div>{fieldLabel('Description')}<Input.TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div>{fieldLabel('Instructions (one step per line)')}<Input.TextArea rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} /></div>
            <div>{fieldLabel('Common Mistakes (one per line)')}<Input.TextArea rows={3} value={mistakes} onChange={(e) => setMistakes(e.target.value)} /></div>
          </div>
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 16 }}>Defaults</Text>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>{fieldLabel('Sets')}<InputNumber min={0} value={sets} onChange={(v) => setSets(v ?? 0)} style={{ width: 100 }} /></div>
            <div>{fieldLabel('Reps')}<InputNumber min={0} value={reps} onChange={(v) => setReps(v ?? 0)} style={{ width: 100 }} /></div>
            <div>{fieldLabel('Hold (sec)')}<InputNumber min={0} value={hold} onChange={(v) => setHold(v ?? 0)} style={{ width: 100 }} /></div>
            <div>
              {fieldLabel('Frequency')}
              <Select value={frequency} onChange={setFrequency} style={{ minWidth: 160 }} options={FREQUENCIES.map((f) => ({ value: f, label: f }))} />
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Text strong>Tags</Text>
            {tagFields.map(({ label, options, selected, set }) => (
              <div key={label}>
                {fieldLabel(label)}
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  value={selected}
                  onChange={(vals) => set(vals)}
                  options={options.map((o) => ({ value: o, label: o }))}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Text strong>Media</Text>
            <div>
              {fieldLabel('YouTube URL')}
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Button size="small">Upload Video / Image</Button>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <Button onClick={() => router.push('/exercises')}>Cancel</Button>
          <Button type="primary" onClick={() => router.push('/exercises')}>Save Exercise</Button>
        </div>
      </div>
    </>
  );
}
