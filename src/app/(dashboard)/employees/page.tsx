'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Avatar, Tag, Tabs, App } from 'antd';
import { SearchOutlined, PlusOutlined, RollbackOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';
import TopBar from '@/components/layout/TopBar';
import { mockPatients } from '@/lib/mock-data';
import { useLocationScope } from '@/lib/locationScope';
import type { Employee } from '@/lib/types';

const { Title, Text } = Typography;

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

export default function EmployeesPage() {
  const router = useRouter();
  const { message: messageApi } = App.useApp();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('0');
  const { employees: scopedEmployees } = useLocationScope();
  const [overrides, setOverrides] = useState<Record<string, Partial<Employee>>>({});

  const employees = scopedEmployees.map((e) => overrides[e.id] ? { ...e, ...overrides[e.id] } : e);

  const activeEmployees = employees.filter((e) => !e.archived);
  const archivedEmployees = employees.filter((e) => e.archived);

  const applySearch = (list: Employee[]) => {
    const q = search.toLowerCase();
    return list.filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.credentials.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q)
    );
  };

  const displayed = applySearch(tab === '0' ? activeEmployees : archivedEmployees);

  const restore = (emp: Employee) => {
    setOverrides((prev) => ({ ...prev, [emp.id]: { archived: false } }));
    messageApi.success(`${emp.firstName} ${emp.lastName} restored to active.`);
  };

  const empty = displayed.length === 0;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Employees' }]} />
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Employees</Title>
          <Button type="primary" icon={<PlusOutlined />}>Add Employee</Button>
        </div>

        <Tabs
          activeKey={tab}
          onChange={setTab}
          style={{ marginBottom: 24 }}
          items={[
            { key: '0', label: `Active (${activeEmployees.length})` },
            { key: '1', label: `Archived (${archivedEmployees.length})` },
          ]}
        />

        <Input
          placeholder={tab === '0' ? 'Search active employees…' : 'Search archived employees…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 24, width: 340 }}
          prefix={<SearchOutlined style={{ color: '#9E9E9E' }} />}
        />

        {empty ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <TeamOutlined style={{ fontSize: 48, color: '#BDBDBD', marginBottom: 8 }} />
            <div><Text type="secondary">{tab === '0' ? 'No active employees found' : 'No archived employees found'}</Text></div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayed.map((emp) => {
              const patientCount = mockPatients.filter((p) => emp.patientIds.includes(p.id)).length;
              const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';
              return (
                <Card
                  key={emp.id}
                  hoverable
                  styles={{ body: { padding: 0 } }}
                  style={{ opacity: emp.archived ? 0.75 : 1 }}
                  onClick={() => router.push(`/employees/${emp.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 24px' }}>
                    <Avatar style={{ width: 52, height: 52, background: bgColor + '18', color: bgColor, fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
                      {emp.avatarInitials}
                    </Avatar>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 }}>
                        <Text strong>{emp.firstName} {emp.lastName}</Text>
                        <Text type="secondary">{emp.credentials}</Text>
                      </div>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>{emp.title}</Text>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {emp.specialties.map((s) => (
                          <Tag key={s} style={{ fontSize: 11 }}>{s}</Tag>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <Tag style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontWeight: 500 }}>
                        {`${patientCount} patient${patientCount !== 1 ? 's' : ''}`}
                      </Tag>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MailOutlined style={{ fontSize: 13, color: '#49454F' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>{emp.email}</Text>
                      </div>
                    </div>
                    {tab === '1' && (
                      <Button
                        size="small"
                        icon={<RollbackOutlined />}
                        onClick={(e) => { e.stopPropagation(); restore(emp); }}
                        style={{ flexShrink: 0, marginLeft: 8 }}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
