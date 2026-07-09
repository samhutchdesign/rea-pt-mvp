'use client';
import TopBar from '@/components/layout/TopBar';
import { Toggle } from '@/components/base/toggle/toggle';
import { useThemeMode, setThemeMode } from '@/lib/themeStore';

export default function SettingsPage() {
  const mode = useThemeMode();
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Account' }, { label: 'Settings' }]} />
      <div className="p-8 max-w-[600px]">
        <h2 className="text-xl font-semibold text-primary mt-0 mb-6">Settings</h2>
        <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5">
          <span className="font-semibold text-sm text-primary block mb-4">Preferences</span>
          <div className="flex items-center gap-2">
            <Toggle
              isSelected={mode === 'dark'}
              onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
              size="sm"
            />
            <span className="text-sm text-primary">Dark mode</span>
          </div>
        </div>
      </div>
    </>
  );
}
