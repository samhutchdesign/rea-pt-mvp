import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/base/badges/badges';
import { cx } from '@/utils/cx';
import type { ChartTemplateId } from '@/lib/types';

export const CHART_TEMPLATES: { id: ChartTemplateId; name: string; description: string; comingSoon?: boolean }[] = [
  { id: 'default', name: 'Default Form', description: 'The standard SOAPIE chart used for every session.' },
  { id: 'default-dictation', name: 'Default Form with Dictation', description: 'The standard SOAPIE chart with voice dictation support.' },
  { id: 'pelvic-floor', name: 'Pelvic Floor', description: 'A specialized chart tailored to pelvic floor assessments.', comingSoon: true },
];

export function ChartTemplateSelect({ onSelect }: { onSelect: (id: ChartTemplateId) => void }) {
  return (
    <div className="max-w-[820px] mx-auto">
      <p className="mb-1 text-lg font-bold text-primary">Select a Template</p>
      <p className="mb-6 text-sm text-tertiary">Choose the chart template to use for this session.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CHART_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            disabled={template.comingSoon}
            onClick={() => onSelect(template.id)}
            className={cx(
              'flex flex-col items-start gap-3 rounded-xl border border-secondary bg-primary p-5 text-left shadow-xs transition-shadow',
              template.comingSoon ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-brand-400 hover:shadow-md'
            )}
          >
            <div className="flex w-full items-start justify-between gap-2">
              <span className="text-sm font-semibold text-primary">{template.name}</span>
              {template.comingSoon ? (
                <Badge type="pill-color" color="gray" size="sm">Coming Soon</Badge>
              ) : (
                <ChevronRight size={16} className="shrink-0 text-quaternary" />
              )}
            </div>
            <span className="text-sm text-tertiary">{template.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
