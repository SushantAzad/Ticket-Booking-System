import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { AuthNav } from "@/components/auth/AuthNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ticket Booking System - NextGen Ticketing",
  description:
    "Book seats instantly without race conditions. Powered by modern web tech.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="glass sticky top-0 z-50 border-x-0 border-t-0">
          <div className="page-shell flex min-h-18 items-center justify-between gap-6 py-4">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="TicketFlow home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#70e1d0] text-lg font-black text-[#08211f]">
                T
              </span>
              <span className="text-lg font-black tracking-tight">
                TicketFlow<span className="text-[#70e1d0]">.</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-6">
              <Link
                href="/"
                className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-300 hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/events"
                className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-300 hover:text-white"
              >
                Events
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-300 hover:text-white"
              >
                Dashboard
              </Link>
              <AuthNav />
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
