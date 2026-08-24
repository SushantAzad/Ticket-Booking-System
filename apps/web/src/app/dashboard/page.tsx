"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient, clearAuthToken, setAuthToken } from "@/lib/api-client";

interface Booking {
  id: string;
  bookingReference: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  show: {
    event: { title: string };
    venue: { name: string; city: string };
    startTime: string;
  };
  _count: { bookingSeats: number };
}

interface ActiveHold {
  id: string;
  showId: string;
  expiresAt: string;
  items: { showSeat: { venueSeat: { label: string } } }[];
  show: {
    event: { title: string };
    venue: { name: string; city: string };
    startTime: string;
  };
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [holds, setHolds] = useState<ActiveHold[]>([]);
  const [name, setName] = useState("there");
  const [message, setMessage] = useState("");
  const [confirmingHoldId, setConfirmingHoldId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      const token = localStorage.getItem("ticketflow_access_token");
      const user = localStorage.getItem("ticketflow_user");
      if (!token) {
        if (!cancelled) setMessage("Sign in to view your bookings.");
        return;
      }
      setAuthToken(token);
      if (user && !cancelled)
        setName(JSON.parse(user).name?.split(" ")[0] ?? "there");
      try {
        const [bookingResponse, holdResponse] = await Promise.all([
          apiClient.get("/bookings"),
          apiClient.get("/holds/me"),
        ]);
        if (!cancelled) {
          setBookings(bookingResponse.data.bookings ?? []);
          setHolds(holdResponse.data ?? []);
        }
      } catch {
        if (!cancelled)
          setMessage("Your session has expired. Please sign in again.");
      }
    };
    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = () => {
    clearAuthToken();
    localStorage.removeItem("ticketflow_access_token");
    localStorage.removeItem("ticketflow_user");
    setBookings([]);
    setHolds([]);
    setName("there");
    setConfirmingHoldId(null);
    setMessage("You have been signed out.");
    window.dispatchEvent(new Event("ticketflow-auth-changed"));
  };

  const confirmBooking = async (holdId: string) => {
    setConfirmingHoldId(holdId);
    setMessage("");
    try {
      await apiClient.post("/bookings", { holdId });
      setHolds((current) => current.filter((hold) => hold.id !== holdId));
      const response = await apiClient.get("/bookings");
      setBookings(response.data.bookings ?? []);
    } catch (error) {
      const response = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const detail = response.response?.data?.message;
      setMessage(
        Array.isArray(detail)
          ? detail.join(" ")
          : detail || "We could not confirm this booking. Please try again.",
      );
    } finally {
      setConfirmingHoldId(null);
    }
  };

  return (
    <div className="page-shell page-enter py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Your TicketFlow</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Good to see you, {name}.
          </h1>
        </div>
        <button
          onClick={signOut}
          className="button-secondary rounded-lg px-4 py-2 text-sm font-bold"
        >
          Sign out
        </button>
      </div>
      {message && (
        <div className="panel mt-8 rounded-xl p-6">
          <p className="muted">{message}</p>
          <Link
            href="/login"
            className="button-primary mt-5 inline-block rounded-lg px-4 py-2 text-sm"
          >
            Sign in
          </Link>
        </div>
      )}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Active holds</h2>
          <span className="muted text-sm">Seats reserved for 10 minutes</span>
        </div>
        {holds.length > 0 && (
          <div className="mt-5 space-y-3">
            {holds.map((hold) => (
              <div
                key={hold.id}
                className="panel flex flex-col justify-between gap-4 rounded-xl p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="eyebrow">Reserved seats</p>
                  <h3 className="mt-2 text-lg font-bold">
                    {hold.show.event.title}
                  </h3>
                  <p className="muted mt-1 text-sm">
                    {hold.items
                      .map((item) => item.showSeat.venueSeat.label)
                      .join(", ")}{" "}
                    · {hold.show.venue.name}, {hold.show.venue.city}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-bold text-[#ffb09e]">
                    Expires{" "}
                    {new Date(hold.expiresAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <Link
                    href={`/shows/${hold.showId}/seats`}
                    className="button-secondary mt-2 inline-block rounded-lg px-3 py-2 text-xs font-bold"
                  >
                    Return to seats
                  </Link>
                  <button
                    onClick={() => void confirmBooking(hold.id)}
                    disabled={confirmingHoldId === hold.id}
                    className="button-primary mt-2 ml-2 rounded-lg px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {confirmingHoldId === hold.id
                      ? "Confirming..."
                      : "Confirm booking"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {holds.length === 0 && !message && (
          <p className="muted mt-4 text-sm">No active holds right now.</p>
        )}
      </section>
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your bookings</h2>
          <Link href="/events" className="text-sm font-bold text-[#70e1d0]">
            Find another event
          </Link>
        </div>
        {bookings.length === 0 && !message ? (
          <div className="panel mt-5 rounded-2xl p-10 text-center">
            <p className="muted">Your next great night out belongs here.</p>
            <Link
              href="/events"
              className="button-primary mt-5 inline-block rounded-lg px-5 py-3 text-sm"
            >
              Explore events
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="panel flex flex-col justify-between gap-4 rounded-xl p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="eyebrow">{booking.bookingReference}</p>
                  <h3 className="mt-2 text-lg font-bold">
                    {booking.show.event.title}
                  </h3>
                  <p className="muted mt-1 text-sm">
                    {new Date(booking.show.startTime).toLocaleString()} ·{" "}
                    {booking.show.venue.name}, {booking.show.venue.city}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-black">₹{booking.totalAmount}</p>
                  <p className="muted mt-1 text-sm">
                    {booking._count.bookingSeats} seats ·{" "}
                    {booking.status.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
