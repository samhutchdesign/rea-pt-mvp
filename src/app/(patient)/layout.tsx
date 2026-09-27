import DemoRoleBar from '@/components/layout/DemoRoleBar';

// Patient-facing portal shell. Deliberately no Sidebar/TopBar — per the
// Figma designs, the patient app has no persistent chrome beyond the
// avatar menu on each page and the Rea footer at the bottom of content.
// DemoRoleBar stays so the "Viewing as" switcher is reachable to leave
// the patient role in this MVP demo.
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoRoleBar />
      <main className="min-h-screen bg-secondary_alt pt-10">
        <div className="mx-auto w-full max-w-[720px] px-4">{children}</div>
      </main>
    </>
  );
}
