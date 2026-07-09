import Sidebar from '@/components/layout/Sidebar';
import DemoRoleBar from '@/components/layout/DemoRoleBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoRoleBar />
      <div className="flex min-h-screen pt-10">
        <Sidebar />
        <main className="ml-20 flex-1 min-h-screen pt-14 bg-secondary_alt">
          {children}
        </main>
      </div>
    </>
  );
}
