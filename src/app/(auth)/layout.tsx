export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary_alt flex flex-col items-center">
      <div className="pt-10 pb-8 flex flex-col items-center">
        <div
          className="flex size-10 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white"
          style={{ letterSpacing: '-0.5px' }}
        >
          R
        </div>
      </div>
      {children}
    </div>
  );
}
