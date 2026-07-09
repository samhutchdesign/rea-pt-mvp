'use client';
import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Divider } from '@/components/ui/divider';
import { Progress } from '@/components/ui/progress';
import TopBar from '@/components/layout/TopBar';
import { cx } from '@/utils/cx';
import { Check, CreditCard, Download } from 'lucide-react';

const PLAN = {
  name: 'Clinic Pro',
  price: '$149',
  interval: 'month',
  seats: 5,
  usedSeats: 4,
  renewsOn: 'July 1, 2026',
  features: [
    'Up to 5 practitioners',
    'Unlimited patients',
    'AI document extraction',
    'Exercise library (300+ exercises)',
    'Program builder',
    'Patient portal & messaging',
    'Chart & SOAPIE notes',
    'Priority support',
  ],
};

const INVOICES = [
  { id: 'inv-006', date: 'Jun 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-005', date: 'May 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-004', date: 'Apr 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-003', date: 'Mar 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-002', date: 'Feb 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'inv-001', date: 'Jan 1, 2026', amount: '$149.00', status: 'Paid' },
];

const USAGE = [
  { label: 'Active Patients', used: 18, limit: null as number | null, unit: 'patients' },
  { label: 'Practitioners', used: 4, limit: 5 as number | null, unit: 'seats' },
  { label: 'AI Extractions This Month', used: 7, limit: 50 as number | null, unit: 'extractions' },
  { label: 'Exercise Library', used: 12, limit: null as number | null, unit: 'custom exercises added' },
  { label: 'Programs Created', used: 3, limit: null as number | null, unit: 'programs' },
];

function SubscriptionTab() {
  return (
    <div className="flex gap-6 flex-wrap">
      <div className="flex-[2] min-w-[300px] rounded-xl border border-secondary bg-primary shadow-xs p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-primary m-0">{PLAN.name}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-utility-green-50 text-utility-green-700">Active</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-brand-700">{PLAN.price}</span>
              <span className="text-tertiary text-sm">/{PLAN.interval}</span>
            </div>
          </div>
          <Button color="secondary" size="xs" onPress={() => {}}>Change Plan</Button>
        </div>

        <Divider className="mb-4" />

        <span className="text-tertiary font-semibold uppercase tracking-wide text-xs">What&apos;s included</span>
        <ul className="mt-3 mb-4 list-none p-0 flex flex-col gap-1.5">
          {PLAN.features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check size={16} className="text-utility-green-600 shrink-0" />
              <span className="text-sm text-primary">{f}</span>
            </li>
          ))}
        </ul>

        <Divider className="mb-4" />

        <div className="flex justify-between items-center">
          <div>
            <span className="block text-tertiary text-xs mb-0.5">Renews on</span>
            <span className="font-semibold text-primary text-sm">{PLAN.renewsOn}</span>
          </div>
          <Button color="tertiary-destructive" size="xs" onPress={() => {}}>Cancel Subscription</Button>
        </div>
      </div>

      <div className="flex-1 min-w-[240px] rounded-xl border border-secondary bg-primary shadow-xs p-6 self-start">
        <span className="block font-semibold text-primary mb-4">Seats</span>
        <h2 className="text-3xl font-bold text-primary mt-0 mb-0.5">{PLAN.usedSeats} / {PLAN.seats}</h2>
        <span className="text-tertiary text-xs">practitioners on your plan</span>
        <Progress value={(PLAN.usedSeats / PLAN.seats) * 100} className="mt-3" />
        <div className="mt-4">
          <Button color="secondary" size="xs" onPress={() => {}}>Add Practitioner</Button>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodTab() {
  return (
    <div className="max-w-[560px]">
      <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <CreditCard size={24} className="text-brand-700" />
          </div>
          <div className="grow">
            <span className="block font-semibold text-primary text-sm">Visa ending in 4242</span>
            <span className="text-tertiary text-xs">Expires 08 / 2028</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#EDE7F6', color: '#6750A4' }}>Default</span>
        </div>
        <div className="flex gap-2">
          <Button color="secondary" size="xs" onPress={() => {}}>Update Card</Button>
          <Button color="tertiary-destructive" size="xs" onPress={() => {}}>Remove</Button>
        </div>
      </div>
      <Button color="primary" size="sm" iconLeading={CreditCard} onPress={() => {}}>
        Add Payment Method
      </Button>
      <p className="text-tertiary text-xs mt-3">
        Payment processing is secured and encrypted. Your card details are never stored on our servers.
      </p>
    </div>
  );
}

function InvoiceHistoryTab() {
  return (
    <div className="max-w-[720px]">
      <div className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs">
        <div className="grid grid-cols-5 gap-0 border-b border-secondary px-4 py-3 bg-secondary_alt">
          <span className="text-xs font-semibold text-tertiary uppercase tracking-wide">Invoice</span>
          <span className="text-xs font-semibold text-tertiary uppercase tracking-wide">Date</span>
          <span className="text-xs font-semibold text-tertiary uppercase tracking-wide">Amount</span>
          <span className="text-xs font-semibold text-tertiary uppercase tracking-wide">Status</span>
          <span className="text-xs font-semibold text-tertiary uppercase tracking-wide text-right">Receipt</span>
        </div>
        {INVOICES.map((inv) => (
          <div key={inv.id} className="grid grid-cols-5 gap-0 px-4 py-4 border-b border-secondary last:border-0 items-center">
            <span className="font-semibold text-primary text-sm">{inv.id}</span>
            <span className="text-tertiary text-sm">{inv.date}</span>
            <span className="text-primary text-sm">{inv.amount}</span>
            <span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-utility-green-50 text-utility-green-700">{inv.status}</span>
            </span>
            <div className="flex justify-end">
              <Button color="tertiary" size="xs" iconLeading={Download} onPress={() => {}}>PDF</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsageStatsTab() {
  return (
    <div className="max-w-[600px]">
      <div className="flex flex-col gap-4">
        {USAGE.map(({ label, used, limit, unit }) => (
          <div key={label} className="rounded-xl border border-secondary bg-primary shadow-xs px-4 py-3.5">
            <div className={cx('flex justify-between items-center', limit ? 'mb-2' : '')}>
              <span className="font-semibold text-primary text-sm">{label}</span>
              <span className="text-tertiary text-sm">
                {limit ? `${used} / ${limit} ${unit}` : `${used} ${unit}`}
              </span>
            </div>
            {limit && (
              <Progress
                value={Math.min((used / limit) * 100, 100)}
                color={used / limit > 0.85 ? 'warning' : 'brand'}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-tertiary text-xs mt-4">
        Usage resets on the 1st of each month. AI extractions included with Clinic Pro plan.
      </p>
    </div>
  );
}

const TABS = ['Subscription & Plan', 'Payment Method', 'Invoice History', 'Usage Stats'];

export default function BillingPage() {
  const [tab, setTab] = useState('0');

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Billing' }]} />
      <div className="p-8">
        <h2 className="text-xl font-semibold text-primary mt-0 mb-6">Billing</h2>

        <div className="flex border-b border-secondary mb-6">
          {TABS.map((label, i) => (
            <button
              key={i}
              onClick={() => setTab(String(i))}
              className={cx(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === String(i)
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-tertiary hover:text-secondary'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === '0' && <SubscriptionTab />}
        {tab === '1' && <PaymentMethodTab />}
        {tab === '2' && <InvoiceHistoryTab />}
        {tab === '3' && <UsageStatsTab />}
      </div>
    </>
  );
}
