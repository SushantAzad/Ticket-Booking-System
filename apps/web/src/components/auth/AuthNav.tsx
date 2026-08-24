"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AuthNav() {
  const [signedIn, setSignedIn] = useState(false);
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const sync = () => {
      setSignedIn(Boolean(localStorage.getItem("ticketflow_access_token")));
      try {
        const user = JSON.parse(
          localStorage.getItem("ticketflow_user") || "{}",
        ) as { name?: string };
        const nameParts = (user.name || "").trim().split(/\s+/).filter(Boolean);
        setInitials(
          nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
            : (nameParts[0]?.slice(0, 2) || "?").toUpperCase(),
        );
      } catch {
        setInitials("?");
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ticketflow-auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ticketflow-auth-changed", sync);
    };
  }, []);

  return signedIn ? (
    <Link
      href="/dashboard"
      className="button-primary flex h-10 w-10 items-center justify-center rounded-full text-sm"
      aria-label="Open dashboard"
      title="Open dashboard"
    >
      {initials}
    </Link>
  ) : (
    <Link href="/login" className="button-primary rounded-lg px-4 py-2 text-sm">
      Sign in
    </Link>
  );
}
