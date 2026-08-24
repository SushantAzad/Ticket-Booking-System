"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readStoredUser } from "@/lib/auth";

export function AppNav() {
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const sync = () => {
      const token = localStorage.getItem("ticketflow_access_token");
      const user = readStoredUser();
      setSignedIn(Boolean(token));
      setRole(user.role || null);

      const nameParts = (user.name || "").trim().split(/\s+/).filter(Boolean);
      setInitials(
        nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : (nameParts[0]?.slice(0, 2) || "?").toUpperCase(),
      );
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ticketflow-auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ticketflow-auth-changed", sync);
    };
  }, []);

  const isOrganiser = role === "ORGANISER" || role === "ADMIN";

  const customerLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/dashboard", label: "My Bookings" },
    { href: "/dashboard", label: "My Tickets" },
  ];

  const organiserLinks = [
    { href: "/organiser/dashboard", label: "Dashboard" },
    { href: "/organiser/events", label: "My Events" },
    { href: "/organiser/venues", label: "Venues" },
    { href: "/organiser/events/create", label: "Create Event" },
    { href: "/organiser/shows/create", label: "Create Show" },
    { href: "/organiser/bookings", label: "Bookings" },
  ];

  const guestLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
  ];

  const navLinks = signedIn
    ? isOrganiser
      ? organiserLinks
      : customerLinks
    : guestLinks;

  return (
    <div className="flex items-center gap-2 sm:gap-6">
      {navLinks.map((link) => (
        <Link
          key={link.href + link.label}
          href={link.href}
          className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-300 hover:text-white"
        >
          {link.label}
        </Link>
      ))}

      {signedIn ? (
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("ticketflow_access_token");
            localStorage.removeItem("ticketflow_user");
            localStorage.removeItem("ticketflow_onboarded");
            window.dispatchEvent(new Event("ticketflow-auth-changed"));
            window.location.href = "/";
          }}
          className="button-primary rounded-lg px-4 py-2 text-sm"
        >
          Sign out
        </button>
      ) : (
        <Link
          href="/login"
          className="button-primary rounded-lg px-4 py-2 text-sm"
        >
          Sign in
        </Link>
      )}

      {signedIn && (
        <Link
          href={isOrganiser ? "/organiser/dashboard" : "/dashboard"}
          className="button-primary flex h-10 w-10 items-center justify-center rounded-full text-sm"
          aria-label="Open dashboard"
          title="Open dashboard"
        >
          {initials}
        </Link>
      )}
    </div>
  );
}
