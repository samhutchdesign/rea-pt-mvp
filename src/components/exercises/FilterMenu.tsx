'use client';
import { Button, Dropdown, Checkbox } from 'antd';
import { ChevronDown } from 'lucide-react';

interface FilterMenuProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export default function FilterMenu({ label, options, selected, onChange }: FilterMenuProps) {
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  const items = options.map((opt) => ({
    key: opt,
    label: (
      <div
        onClick={(e) => {
          e.preventDefault();
          toggle(opt);
        }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
      >
        <Checkbox checked={selected.includes(opt)} />
        <span>{opt}</span>
      </div>
    ),
  }));

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      placement="bottomLeft"
      overlayStyle={{ maxHeight: 280, width: 230, overflowY: 'auto' }}
    >
      <Button
        size="small"
        type={selected.length > 0 ? 'primary' : 'default'}
        style={{ fontSize: 13, whiteSpace: 'nowrap' }}
      >
        {label}
        {selected.length > 0 ? ` (${selected.length})` : ''}
        <ChevronDown />
      </Button>
    </Dropdown>
  );
}
