"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface VenueItem {
  id: string;
  name: string;
  address: string;
  city: string;
  seatCategories: Array<{ name: string; colorCode: string }>;
  _count?: { venueSeats: number };
}

export default function OrganiserVenuesPage() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const response = await apiClient.get("/venues");
        setVenues(response.data ?? []);
      } finally {
        setLoading(false);
      }
    };

    void loadVenues();
  }, []);

  return (
    <div className="page-shell page-enter py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Venues</p>
          <h1 className="mt-3 text-4xl font-black">Manage venue layouts</h1>
        </div>
        <Link
          href="/organiser/venues/create"
          className="button-primary rounded-xl px-4 py-3 text-sm"
        >
          Create your first venue
        </Link>
      </div>

      {loading ? (
        <div className="muted py-20 text-center">Loading venues...</div>
      ) : venues.length === 0 ? (
        <div className="panel mt-8 rounded-2xl p-10 text-center">
          <p className="text-xl font-bold">
            You have not created any venues yet.
          </p>
          <p className="muted mt-3">
            Create a venue and add the seat categories and layout to get
            started.
          </p>
          <Link
            href="/organiser/venues/create"
            className="button-primary mt-6 inline-block rounded-xl px-5 py-3 text-sm"
          >
            Create your first venue
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {venues.map((venue) => (
            <article key={venue.id} className="panel rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">{venue.name}</h2>
                  <p className="muted mt-2 text-sm">{venue.address}</p>
                  <p className="muted text-sm">{venue.city}</p>
                </div>
                <Link
                  href={`/organiser/venues/${venue.id}`}
                  className="button-secondary rounded-lg px-3 py-2 text-xs font-bold"
                >
                  Configure
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {venue.seatCategories.length === 0 ? (
                  <span className="text-xs text-slate-400">No categories</span>
                ) : (
                  venue.seatCategories.map((category) => (
                    <span
                      key={`${venue.id}-${category.name}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 text-xs text-white"
                      style={{ backgroundColor: `${category.colorCode}22` }}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: category.colorCode }}
                      />
                      {category.name}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                <span className="muted">Seats</span>
                <span className="font-bold text-white">
                  {venue._count?.venueSeats ?? 0}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
