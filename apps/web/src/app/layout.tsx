import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ticket Booking System - NextGen Ticketing',
  description: 'Book seats instantly without race conditions. Powered by modern web tech.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="glass sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              TicketFlow
            </span>
          </div>
          <div className="flex gap-6 items-center">
            <a href="/" className="text-sm font-medium hover:text-blue-400 transition-colors">Home</a>
            <a href="/events" className="text-sm font-medium hover:text-blue-400 transition-colors">Events</a>
            <a href="/dashboard" className="text-sm font-medium hover:text-blue-400 transition-colors">Dashboard</a>
            <button className="px-4 py-2 text-sm font-bold bg-white text-black rounded hover:bg-gray-200 transition-colors">
              Sign In
            </button>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
