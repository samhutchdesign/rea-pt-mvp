'use client';

export default function PatientFooter() {
  return (
    <div className="relative left-1/2 mt-10 w-screen -translate-x-1/2 border-t border-secondary bg-primary">
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-start gap-1 p-4">
        <div className="flex h-12 items-center p-1">
          <p className="font-display text-[34px] font-medium text-primary">Rea</p>
        </div>
        <a href="#" className="flex h-10 items-center py-1 text-base font-semibold text-brand-600 hover:text-brand-700">
          About Rea
        </a>
        <a href="#" className="flex h-10 items-center py-1 text-base font-semibold text-brand-600 hover:text-brand-700">
          Privacy &amp; Terms
        </a>
      </div>
    </div>
  );
}
