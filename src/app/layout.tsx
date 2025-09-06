import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { ActivityProvider } from '@/contexts/ActivityContext';
import { ToastProvider } from '@/providers/ToastProvider';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recordatorio de Actividades',
  description: 'Organiza y gestiona tus actividades diarias de manera eficiente',
  keywords: ['recordatorio', 'actividades', 'tareas', 'organización', 'productividad'],
  authors: [{ name: 'Tu Asistente de Actividades' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ActivityProvider>
            <div className="min-h-screen bg-background">
              <main className="container mx-auto px-4 py-8 max-w-7xl">
                {children}
              </main>
            </div>
            <ToastProvider />
          </ActivityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}