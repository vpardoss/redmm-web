// src/app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers'; // 1. Se importa el provider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cuando viene la micro?',
  description: 'Página que te dice cuando viene la micro en San Bernardo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // La propiedad 'suppressHydrationWarning' también es importante
    <html lang="es" suppressHydrationWarning> 
      <body className={inter.className}>
        {/* 2. Aquí Providers envuelve a children, dándole "poderes" a toda la app */}
        <Providers>{children}</Providers> 
      </body>
    </html>
  );
}
