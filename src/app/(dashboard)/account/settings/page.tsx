'use client';
import { Typography, Card, Switch, Flex } from 'antd';
import TopBar from '@/components/layout/TopBar';
import { useThemeMode, setThemeMode } from '@/lib/themeStore';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const mode = useThemeMode();
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Settings' }]} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 600 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 24 }}>Settings</Title>
        <Card>
          <Text strong style={{ display: 'block', marginBottom: 16 }}>Preferences</Text>
          <Flex align="center" gap={8}>
            <Switch
              checked={mode === 'dark'}
              onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
              size="small"
            />
            <Text>Dark mode</Text>
          </Flex>
        </Card>
      </div>
    </>
  );
}
