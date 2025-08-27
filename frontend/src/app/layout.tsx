import type {ReactNode} from 'react';
import './globals.css';

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-screen bg-[#0b0b10] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
