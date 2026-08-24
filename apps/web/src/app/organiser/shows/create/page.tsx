"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface EventOption {
  id: string;
  title: string;
}
interface VenueOption {
  id: string;
  name: string;
  city: string;
  seatCategories: Array<{ id: string; name: string; colorCode: string }>;
}

export default function CreateShowPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsResponse, venuesResponse] = await Promise.all([
          apiClient.get("/events"),
          apiClient.get("/venues"),
        ]);
        setEvents((eventsResponse.data?.events ?? []) as EventOption[]);
        setVenues((venuesResponse.data ?? []) as VenueOption[]);
      } catch {
        setError("Unable to load events and venues.");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId);
  const categories = selectedVenue?.seatCategories ?? [];

  const handlePriceChange = (categoryId: string, value: string) => {
    setPrices((prev) => ({ ...prev, [categoryId]: Number(value) }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedEventId || !selectedVenueId || !startTime || !endTime) {
      setError("Select an event, a venue, and both dates.");
      return;
    }

    const payload = {
      eventId: selectedEventId,
      venueId: selectedVenueId,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      prices: categories.map((category) => ({
        category: category.name,
        price: Number(prices[category.id] ?? 0),
      })),
    };

    setSubmitting(true);
    setError("");

    try {
      await apiClient.post("/shows", payload);
      router.push("/organiser/events");
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
          : message || "We could not create this show.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="page-shell page-enter py-20 text-center muted">
        Loading organiser tools...
      </div>
    );

  return (
    <div className="page-shell page-enter py-12 sm:py-16">
      <div className="mb-8">
        <p className="eyebrow">Create show</p>
        <h1 className="mt-3 text-4xl font-black">
          Set up a show and category pricing
        </h1>
      </div>

      <form
        onSubmit={submit}
        className="panel mx-auto max-w-4xl rounded-2xl p-6 sm:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-bold">
            Event
            <select
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold">
            Venue
            <select
              value={selectedVenueId}
              onChange={(event) => setSelectedVenueId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            >
              <option value="">Select a venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} · {venue.city}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold">
            Start date & time
            <input
              type="datetime-local"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>

          <label className="block text-sm font-bold">
            End date & time
            <input
              type="datetime-local"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold">Seat category pricing</h2>
          {categories.length === 0 ? (
            <p className="muted mt-4 text-sm">
              Choose a venue with configured seat categories to set prices.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: category.colorCode }}
                    />
                    <span className="font-bold text-white">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">₹</span>
                    <input
                      type="number"
                      min={1}
                      step="1"
                      value={prices[category.id] ?? 0}
                      onChange={(event) =>
                        handlePriceChange(category.id, event.target.value)
                      }
                      className="w-28 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-right font-bold outline-none focus:border-[#70e1d0]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-[#ff8d72]/10 p-3 text-sm text-[#ffc0b0]">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/organiser/events")}
            className="button-secondary rounded-xl px-4 py-3 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="button-primary rounded-xl px-5 py-3 text-sm disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create show"}
          </button>
        </div>
      </form>
    </div>
  );
}
