"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface RecommendedSeat {
  id: string;
  category: string;
  row: string;
  number: number;
  price: number;
}

interface SearchEvent {
  id: string;
  title: string;
  genre: string;
  city: string;
  shows?: { id: string }[];
}

interface SearchResult {
  explanation?: string;
  recommendedSeats?: RecommendedSeat[];
  events?: SearchEvent[];
  recommendedShowId?: string | null;
}

export const AiAssistant = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await apiClient.post("/ai/event-search", { query });
      setResult(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to process AI query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel rounded-2xl p-6 shadow-2xl sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#70e1d0] text-lg text-[#08211f]">
          <span aria-hidden="true">✦</span>
        </div>
        <div>
          <p className="eyebrow">Powered by Gemini</p>
          <h2 className="mt-1 text-xl font-bold text-white">
            Your ticket concierge
          </h2>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'I need 2 VIP tickets for a rock concert in Mumbai under 2000 rupees each'"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#70e1d0]"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="button-primary rounded-xl px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-6">
          {/* Explanation */}
          {result.explanation && (
            <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
              <p className="text-purple-200">{result.explanation}</p>
            </div>
          )}

          {/* Recommended Seats */}
          {result.recommendedSeats && result.recommendedSeats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Recommended Seats
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {result.recommendedSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="min-w-30 rounded-xl border border-white/10 bg-black/15 p-3"
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      {seat.category}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {seat.row}-{seat.number}
                    </div>
                    <div className="text-sm font-semibold text-green-400">
                      ₹{seat.price}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  const token = localStorage.getItem("ticketflow_access_token");
                  if (!token) {
                    router.push("/sign-in");
                    return;
                  }
                  if (!result.recommendedShowId) {
                    setActionMessage(
                      "This recommendation has no bookable show yet.",
                    );
                    return;
                  }
                  try {
                    await apiClient.post(
                      `/shows/${result.recommendedShowId}/holds`,
                      {
                        seatIds: result.recommendedSeats?.map(
                          (seat) => seat.id,
                        ),
                      },
                    );
                    setActionMessage(
                      "Seats held for 10 minutes. Open your dashboard to continue.",
                    );
                  } catch (error: unknown) {
                    const status = (error as { response?: { status?: number } })
                      .response?.status;
                    if (status === 409) {
                      setActionMessage(
                        "Those seats were just taken. Refreshing recommendations...",
                      );
                      try {
                        const refreshed = await apiClient.post(
                          "/ai/event-search",
                          { query },
                        );
                        setResult(refreshed.data);
                        setActionMessage(
                          "Recommendations refreshed. Try the new available seats.",
                        );
                      } catch {
                        setActionMessage(
                          "Those seats were just taken. Search again for fresh recommendations.",
                        );
                      }
                    } else if (status === 401) {
                      router.push("/login");
                    } else {
                      setActionMessage(
                        "We could not hold those seats. Please try again.",
                      );
                    }
                  }
                }}
                className="button-primary mt-3 w-full rounded-xl py-3 text-sm"
              >
                Hold recommended seats
              </button>
              {actionMessage && (
                <p className="muted mt-3 text-sm">{actionMessage}</p>
              )}
            </div>
          )}

          {/* Events Found */}
          {result.events && result.events.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Events Found
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {result.events.map((event) => (
                  <Link
                    key={event.id}
                    href={
                      event.shows?.[0]?.id
                        ? `/shows/${event.shows[0].id}/seats`
                        : "/events"
                    }
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <h4 className="font-bold text-white text-lg">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {event.genre} • {event.city}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
