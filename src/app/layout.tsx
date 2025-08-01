import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/app/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IMPACT IM Tool',
  description: 'IMPACT IM Tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
