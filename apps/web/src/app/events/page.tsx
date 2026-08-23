"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface Show {
  id: string;
  startTime: string;
  venue: { name: string; city: string };
  showSeatCategoryPrices: { price: string }[];
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  type: string;
  genre: string;
  posterUrl?: string | null;
  shows: Show[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async (event?: FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/events", {
        params: { search: query || undefined, city: city || undefined },
      });
      setEvents(response.data.events ?? []);
    } catch {
      setError(
        "We could not load events. Check that the API is running on port 3000.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchInitialEvents = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/events");
        if (!cancelled) setEvents(response.data.events ?? []);
      } catch {
        if (!cancelled)
          setError(
            "We could not load events. Check that the API is running on port 3000.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchInitialEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-shell page-enter py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-4">The what&apos;s on guide</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Find your next <span className="text-[#70e1d0]">story.</span>
          </h1>
          <p className="muted mt-4 max-w-xl">
            Browse upcoming shows with live pricing and seat availability.
          </p>
        </div>
        <form
          onSubmit={loadEvents}
          className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#70e1d0]"
          />
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="City"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#70e1d0] sm:w-32"
          />
          <button className="button-primary rounded-xl px-5 py-3 text-sm">
            Search
          </button>
        </form>
      </div>
      {error && (
        <div className="mt-8 rounded-xl border border-[#ff8d72]/40 bg-[#ff8d72]/10 p-4 text-sm text-[#ffc0b0]">
          {error}
        </div>
      )}
      {loading ? (
        <div className="muted py-20 text-center">
          Loading the next good thing...
        </div>
      ) : events.length === 0 ? (
        <div className="muted py-20 text-center">
          No events match those filters.
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((item) => {
            const show = item.shows[0];
            return (
              <article
                key={item.id}
                className="panel overflow-hidden rounded-2xl"
              >
                <div className="flex h-32 items-end bg-[linear-gradient(135deg,#1d4550,#bd6857)] p-5">
                  <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    {item.type.replace("_", " ")}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">{item.title}</h2>
                      <p className="muted mt-1 text-sm">{item.genre}</p>
                    </div>
                    <span className="text-xs text-[#70e1d0]">
                      {show?.venue.city ?? "TBA"}
                    </span>
                  </div>
                  <p className="muted mt-4 line-clamp-2 text-sm leading-6">
                    {item.description}
                  </p>
                  {show ? (
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="muted">
                          {new Date(show.startTime).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                        <span className="font-bold">
                          From ₹{show.showSeatCategoryPrices[0]?.price ?? "—"}
                        </span>
                      </div>
                      <Link
                        href={`/shows/${show.id}/seats`}
                        className="button-secondary mt-4 block rounded-lg px-4 py-3 text-center text-sm font-bold"
                      >
                        Choose seats
                      </Link>
                    </div>
                  ) : (
                    <p className="muted mt-5 text-sm">
                      Upcoming dates coming soon.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
