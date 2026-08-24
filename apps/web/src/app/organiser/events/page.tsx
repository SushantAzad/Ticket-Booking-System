"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { readStoredUser } from "@/lib/auth";

interface EventItem {
  id: string;
  title: string;
  description: string;
  type: string;
  genre: string;
  posterUrl?: string | null;
  organiser?: { id: string; name: string };
  shows: Array<{
    id: string;
    startTime: string;
    endTime: string;
    venue: { name: string; city: string };
  }>;
}

export default function OrganiserEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      const user = readStoredUser();
      if (!user.role || (user.role !== "ORGANISER" && user.role !== "ADMIN")) {
        setError("This area is only available to organisers.");
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/events");
        const items = (response.data?.events ?? []) as EventItem[];
        const myEvents = items.filter(
          (event) => event.organiser?.id === user.id,
        );
        setEvents(myEvents);
      } catch {
        setError("We could not load your events.");
      } finally {
        setLoading(false);
      }
    };

    void loadEvents();
  }, []);

  return (
    <div className="page-shell page-enter py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Your events</p>
          <h1 className="mt-3 text-4xl font-black">Manage your event lineup</h1>
        </div>
        <Link
          href="/organiser/events/create"
          className="button-primary rounded-xl px-4 py-3 text-sm"
        >
          Create your first event
        </Link>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-[#ff8d72]/40 bg-[#ff8d72]/10 p-4 text-sm text-[#ffc0b0]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="muted py-20 text-center">Loading your events...</div>
      ) : events.length === 0 ? (
        <div className="panel mt-8 rounded-2xl p-10 text-center">
          <p className="text-xl font-bold">
            You have not created any events yet.
          </p>
          <p className="muted mt-3">
            Create your first event to start building a show calendar.
          </p>
          <Link
            href="/organiser/events/create"
            className="button-primary mt-6 inline-block rounded-xl px-5 py-3 text-sm"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="panel overflow-hidden rounded-2xl"
            >
              <div className="flex h-32 items-end bg-[linear-gradient(135deg,#1d4550,#bd6857)] p-5">
                {event.posterUrl ? (
                  <img
                    src={event.posterUrl}
                    alt={event.title}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    {event.type.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{event.title}</h2>
                    <p className="muted mt-1 text-sm">{event.genre}</p>
                  </div>
                  <span className="text-xs text-[#70e1d0]">
                    {event.shows.length} shows
                  </span>
                </div>
                <p className="muted mt-4 text-sm leading-6">
                  {event.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/organiser/events/${event.id}`}
                    className="button-secondary rounded-lg px-3 py-2 text-xs font-bold"
                  >
                    View
                  </Link>
                  <Link
                    href={`/organiser/events/${event.id}`}
                    className="button-secondary rounded-lg px-3 py-2 text-xs font-bold"
                  >
                    Manage Shows
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
