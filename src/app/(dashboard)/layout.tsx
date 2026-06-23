import Sidebar from '@/components/layout/Sidebar';
import DemoRoleBar from '@/components/layout/DemoRoleBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoRoleBar />
      <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 40 }}>
        <Sidebar />
        <main
          style={{
            marginLeft: 80,
            flexGrow: 1,
            minHeight: '100vh',
            paddingTop: 56,
            background: '#F5F5F5',
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}
