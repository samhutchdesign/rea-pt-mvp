import Sidebar from '@/components/layout/Sidebar';
import DemoRoleBar from '@/components/layout/DemoRoleBar';
import TopBar from '@/components/layout/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoRoleBar />
      <div className="flex min-h-screen pt-10">
        <Sidebar />
        <main className="ml-60 flex-1 min-w-0 min-h-screen bg-secondary_alt overflow-x-hidden">
          <TopBar breadcrumbs={[]} />
          <div className="min-h-full rounded-tl-[20px] border-t border-l border-secondary bg-primary">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
