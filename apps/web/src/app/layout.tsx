import './globals.css';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';

export const metadata = {
  title: 'KORU — AI Memorial Avatar & Sanctuary',
  description: 'Preserving, honoring, and conversing with the living memory and voice of beloved ones.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col relative pb-20">
        <Header />
        <main className="flex-1 w-full max-w-lg sm:max-w-2xl mx-auto pt-20 pb-16 px-4">
          <AuthGuard>
            {children}
          </AuthGuard>
        </main>
        <Navigation />
      </body>
    </html>
  );
}
