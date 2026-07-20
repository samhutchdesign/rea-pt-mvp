'use client';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { NativeSelect } from '@/components/ui/native-select';
import { useState } from 'react';

const CONDITIONS = ['Incontinence', 'Prolapse', 'Pelvic Pain', 'Postpartum', 'Urgency'];
const SURGERIES = ['Post-THA', 'Post-TKA', 'C-Section', 'Post-Hysterectomy'];
const SPECIALTIES = ['Pelvic Floor', 'Orthopedic'];
const MUSCLES = ['Levator Ani', 'Coccygeus', 'Transverse Abdominis', 'Glutes', 'Diaphragm', 'Multifidus', 'Hip Abductors', 'Adductors', 'Hip Flexors', 'Quadriceps'];
const BODY_PARTS = ['Pelvis', 'Core', 'Hip', 'Spine', 'Knee'];
const FREQUENCIES = ['Daily', '2x Daily', 'Every Other Day', '3x Weekly'];

const fieldLabel = (label: string) => <div className="mb-1 text-xs text-secondary">{label}</div>;

function MultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (vals: string[]) => void }) {
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
            selected.includes(opt)
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-primary text-secondary border-secondary hover:bg-secondary'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

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
      <div className="p-8 max-w-[700px]">
        <h2 className="mt-0 mb-6 text-2xl font-bold text-primary">New Exercise</h2>

        {/* Basic Info */}
        <div className="mb-6 rounded-xl border border-secondary bg-primary shadow-xs p-6">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold text-primary">Basic Info</span>
            <div>
              {fieldLabel('Exercise Name')}
              <Input value={name} onChange={(val) => setName(val)} placeholder="Exercise name" />
            </div>
            <div>
              {fieldLabel('Description')}
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 resize-none"
              />
            </div>
            <div>
              {fieldLabel('Instructions (one step per line)')}
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 resize-none"
              />
            </div>
            <div>
              {fieldLabel('Common Mistakes (one per line)')}
              <textarea
                rows={3}
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
                className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Defaults */}
        <div className="mb-6 rounded-xl border border-secondary bg-primary shadow-xs p-6">
          <span className="mb-4 block text-sm font-semibold text-primary">Defaults</span>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              {fieldLabel('Sets')}
              <input
                type="number"
                min={0}
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                className="w-24 rounded-lg border border-secondary px-2 py-1.5 text-sm text-center shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              {fieldLabel('Reps')}
              <input
                type="number"
                min={0}
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-24 rounded-lg border border-secondary px-2 py-1.5 text-sm text-center shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              {fieldLabel('Hold (sec)')}
              <input
                type="number"
                min={0}
                value={hold}
                onChange={(e) => setHold(Number(e.target.value))}
                className="w-24 rounded-lg border border-secondary px-2 py-1.5 text-sm text-center shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              {fieldLabel('Frequency')}
              <NativeSelect
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                wrapperClassName="w-44"
              >
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </NativeSelect>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6 rounded-xl border border-secondary bg-primary shadow-xs p-6">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold text-primary">Tags</span>
            {tagFields.map(({ label, options, selected, set }) => (
              <div key={label}>
                {fieldLabel(label)}
                <MultiSelect options={options} selected={selected} onChange={set} />
              </div>
            ))}
          </div>
        </div>

        {/* Media */}
        <div className="mb-6 rounded-xl border border-secondary bg-primary shadow-xs p-6">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold text-primary">Media</span>
            <div>
              {fieldLabel('YouTube URL')}
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(val) => setYoutubeUrl(val)}
              />
            </div>
            <div className="flex gap-4">
              <Button color="secondary" size="xs">Upload Video / Image</Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button color="secondary" size="sm" onPress={() => router.push('/exercises')}>Cancel</Button>
          <Button color="primary" size="sm" onPress={() => router.push('/exercises')}>Save Exercise</Button>
        </div>
      </div>
    </>
  );
}
