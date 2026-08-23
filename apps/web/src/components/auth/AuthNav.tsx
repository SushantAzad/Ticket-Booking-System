"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AuthNav() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const sync = () =>
      setSignedIn(Boolean(localStorage.getItem("ticketflow_access_token")));
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
      className="button-primary rounded-lg px-4 py-2 text-sm"
    >
      Dashboard
    </Link>
  ) : (
    <Link href="/login" className="button-primary rounded-lg px-4 py-2 text-sm">
      Sign in
    </Link>
  );
}
