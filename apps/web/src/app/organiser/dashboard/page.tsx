"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { readStoredUser } from "@/lib/auth";

interface DashboardStats {
  totalEvents: number;
  totalShows: number;
  totalBookings: number;
  totalRevenue: number;
  upcomingShows: Array<{
    id: string;
    startTime: string;
    endTime: string;
    event: { title: string };
    _count: { bookings: number };
  }>;
}

export default function OrganiserDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      const user = readStoredUser();
      if (!user.role || (user.role !== "ORGANISER" && user.role !== "ADMIN")) {
        setError("This area is only available to organisers.");
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/organiser/dashboard");
        setStats(response.data ?? null);
      } catch (requestError: unknown) {
        const message =
          requestError &&
          typeof requestError === "object" &&
          "response" in requestError
            ? (
                requestError as {
                  response?: { data?: { message?: string | string[] } };
                }
              ).response?.data?.message
            : undefined;
        setError(
          Array.isArray(message)
            ? message.join(" ")
            : message || "Unable to load organiser analytics.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  const cards = [
    { label: "Total Events", value: stats?.totalEvents ?? 0 },
    { label: "Upcoming Shows", value: stats?.totalShows ?? 0 },
    { label: "Total Bookings", value: stats?.totalBookings ?? 0 },
    {
      label: "Tickets Sold",
      value:
        stats?.upcomingShows.reduce(
          (sum, show) => sum + show._count.bookings,
          0,
        ) ?? 0,
    },
    {
      label: "Revenue",
      value: `₹${Number(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`,
    },
  ];

  return (
    <div className="page-shell page-enter py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Organiser dashboard</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Keep the next show selling.
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/organiser/venues/create"
            className="button-primary rounded-xl px-4 py-3 text-sm"
          >
            Create Venue
          </Link>
          <Link
            href="/organiser/events/create"
            className="button-secondary rounded-xl px-4 py-3 text-sm"
          >
            Create Event
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-[#ff8d72]/40 bg-[#ff8d72]/10 p-4 text-sm text-[#ffc0b0]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="muted py-20 text-center">
          Loading organiser overview...
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <div key={card.label} className="panel rounded-2xl p-5">
                <p className="eyebrow text-[10px]">{card.label}</p>
                <div className="mt-3 text-3xl font-black text-white">
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="panel rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Quick actions</h2>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/organiser/events/create"
                  className="button-primary rounded-xl px-4 py-3 text-center text-sm"
                >
                  Create Event
                </Link>
                <Link
                  href="/organiser/venues/create"
                  className="button-secondary rounded-xl px-4 py-3 text-center text-sm"
                >
                  Create Venue
                </Link>
                <Link
                  href="/organiser/shows/create"
                  className="button-secondary rounded-xl px-4 py-3 text-center text-sm"
                >
                  Create Show
                </Link>
                <Link
                  href="/organiser/events"
                  className="button-secondary rounded-xl px-4 py-3 text-center text-sm"
                >
                  Manage Events
                </Link>
                <Link
                  href="/organiser/venues"
                  className="button-secondary rounded-xl px-4 py-3 text-center text-sm"
                >
                  Manage Venues
                </Link>
                <Link
                  href="/organiser/bookings"
                  className="button-secondary rounded-xl px-4 py-3 text-center text-sm"
                >
                  View Bookings
                </Link>
              </div>
            </div>

            <div className="panel rounded-2xl p-6">
              <h2 className="text-2xl font-bold">Upcoming shows</h2>
              <div className="mt-5 space-y-3">
                {(stats?.upcomingShows ?? []).length === 0 ? (
                  <p className="muted text-sm">
                    No upcoming shows yet. Create one to start selling tickets.
                  </p>
                ) : (
                  stats?.upcomingShows.map((show) => (
                    <div
                      key={show.id}
                      className="rounded-xl border border-white/10 bg-black/10 p-4"
                    >
                      <p className="font-bold text-white">{show.event.title}</p>
                      <p className="muted mt-1 text-sm">
                        {new Date(show.startTime).toLocaleString()} ·{" "}
                        {show._count.bookings} bookings
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
