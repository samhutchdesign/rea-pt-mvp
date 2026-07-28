import type { Metadata } from 'next';
import { Poppins, Dancing_Script, Great_Vibes, Caveat, Sacramento } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dancing-script',
  display: 'swap',
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-caveat',
  display: 'swap',
});

const sacramento = Sacramento({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-sacramento',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rea – Pelvic Health Platform',
  description: 'Physiotherapy patient management and exercise program platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${dancingScript.variable} ${greatVibes.variable} ${caveat.variable} ${sacramento.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
