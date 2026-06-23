'use client';
import { useState } from 'react';
import { Typography, Tabs, Card, Button, Tag, Divider, Progress, Table } from 'antd';
import { CheckOutlined, CreditCardOutlined, DownloadOutlined } from '@ant-design/icons';
import TopBar from '@/components/layout/TopBar';

const { Title, Text } = Typography;

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
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <Card style={{ flex: 2, minWidth: 300 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Title level={3} style={{ margin: 0 }}>{PLAN.name}</Title>
              <Tag style={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: 11, border: 'none' }}>Active</Tag>
            </div>
            <div>
              <Text style={{ fontSize: 30, fontWeight: 700, color: '#6750A4' }}>{PLAN.price}</Text>
              <Text type="secondary">/{PLAN.interval}</Text>
            </div>
          </div>
          <Button size="small">Change Plan</Button>
        </div>

        <Divider style={{ marginBottom: 16 }} />

        <Text type="secondary" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }}>
          What&apos;s included
        </Text>
        <ul style={{ paddingLeft: 0, marginTop: 12, marginBottom: 16, listStyle: 'none' }}>
          {PLAN.features.map((f) => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CheckOutlined style={{ fontSize: 16, color: '#2E7D32' }} />
              <Text>{f}</Text>
            </li>
          ))}
        </ul>

        <Divider style={{ marginBottom: 16 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Renews on</Text>
            <Text strong>{PLAN.renewsOn}</Text>
          </div>
          <Button size="small" danger type="text">Cancel Subscription</Button>
        </div>
      </Card>

      <Card style={{ flex: 1, minWidth: 240, alignSelf: 'flex-start' }}>
        <Text strong style={{ display: 'block', marginBottom: 16 }}>Seats</Text>
        <Title level={2} style={{ margin: 0 }}>{PLAN.usedSeats} / {PLAN.seats}</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>practitioners on your plan</Text>
        <Progress
          percent={(PLAN.usedSeats / PLAN.seats) * 100}
          showInfo={false}
          strokeColor="#6750A4"
          style={{ marginTop: 12 }}
        />
        <Button size="small" block style={{ marginTop: 16 }}>
          Add Practitioner
        </Button>
      </Card>
    </div>
  );
}

function PaymentMethodTab() {
  return (
    <div style={{ maxWidth: 560 }}>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCardOutlined style={{ color: '#6750A4', fontSize: 24 }} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <Text strong style={{ display: 'block' }}>Visa ending in 4242</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>Expires 08 / 2028</Text>
          </div>
          <Tag style={{ background: '#EDE7F6', color: '#6750A4', fontSize: 11, border: 'none' }}>Default</Tag>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small">Update Card</Button>
          <Button size="small" danger type="text">Remove</Button>
        </div>
      </Card>
      <Button type="primary" icon={<CreditCardOutlined />}>
        Add Payment Method
      </Button>
      <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
        Payment processing is secured and encrypted. Your card details are never stored on our servers.
      </Text>
    </div>
  );
}

function InvoiceHistoryTab() {
  return (
    <div style={{ maxWidth: 720 }}>
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={INVOICES}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'Invoice', dataIndex: 'id', render: (v) => <Text strong>{v}</Text> },
            { title: 'Date', dataIndex: 'date', render: (v) => <Text type="secondary">{v}</Text> },
            { title: 'Amount', dataIndex: 'amount', render: (v) => <Text>{v}</Text> },
            { title: 'Status', dataIndex: 'status', render: (v) => <Tag style={{ background: '#E8F5E9', color: '#2E7D32', fontWeight: 500, fontSize: 11, border: 'none' }}>{v}</Tag> },
            { title: 'Receipt', align: 'right', render: () => <Button type="text" size="small" icon={<DownloadOutlined />} style={{ fontSize: 12 }}>PDF</Button> },
          ]}
        />
      </Card>
    </div>
  );
}

function UsageStatsTab() {
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {USAGE.map(({ label, used, limit, unit }) => (
          <Card key={label} styles={{ body: { padding: 14 } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: limit ? 8 : 0 }}>
              <Text strong>{label}</Text>
              <Text type="secondary">
                {limit ? `${used} / ${limit} ${unit}` : `${used} ${unit}`}
              </Text>
            </div>
            {limit && (
              <Progress
                percent={Math.min((used / limit) * 100, 100)}
                showInfo={false}
                strokeColor={used / limit > 0.85 ? '#F57C00' : '#6750A4'}
              />
            )}
          </Card>
        ))}
      </div>
      <Text type="secondary" style={{ display: 'block', marginTop: 16, fontSize: 12 }}>
        Usage resets on the 1st of each month. AI extractions included with Clinic Pro plan.
      </Text>
    </div>
  );
}

const TABS = ['Subscription & Plan', 'Payment Method', 'Invoice History', 'Usage Stats'];

export default function BillingPage() {
  const [tab, setTab] = useState('0');

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Billing' }]} />
      <div style={{ paddingTop: 56, padding: '32px' }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 24 }}>Billing</Title>

        <Tabs
          activeKey={tab}
          onChange={setTab}
          style={{ marginBottom: 24 }}
          items={TABS.map((t, i) => ({ key: String(i), label: t }))}
        />

        {tab === '0' && <SubscriptionTab />}
        {tab === '1' && <PaymentMethodTab />}
        {tab === '2' && <InvoiceHistoryTab />}
        {tab === '3' && <UsageStatsTab />}
      </div>
    </>
  );
}
