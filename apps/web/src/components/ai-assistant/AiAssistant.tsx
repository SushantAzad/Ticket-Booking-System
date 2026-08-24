"use client";

import React, { useEffect, useRef, useState } from "react";
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

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export const AiAssistant = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Concierge online. Tell me what you want to see and I will search live events, prices, and seats.",
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusFromHash = () => {
      if (window.location.hash === "#assistant") {
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    };
    focusFromHash();
    window.addEventListener("hashchange", focusFromHash);
    return () => window.removeEventListener("hashchange", focusFromHash);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const submittedQuery = query.trim();
    setLastQuery(submittedQuery);
    setMessages((previous) => [
      ...previous,
      { role: "user", text: submittedQuery },
    ]);
    setQuery("");
    try {
      const res = await apiClient.post("/ai/event-search", {
        query: submittedQuery,
      });
      setResult(res.data);
      const eventsFound = res.data.events?.length ?? 0;
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            res.data.explanation ||
            res.data.message ||
            `I found ${eventsFound} matching event${eventsFound === 1 ? "" : "s"}. Choose a result below to continue.`,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "I could not reach the concierge right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#70e1d0]/25 bg-[#071019] font-mono shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#70e1d0] text-[#08211f]">
            <span aria-hidden="true">✦</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#70e1d0]">
              ticketflow / concierge
            </p>
            <p className="mt-1 text-sm text-slate-400">
              gemini grounded search
            </p>
          </div>
        </div>
        <span className="text-xs text-emerald-300">● online</span>
      </div>
      <div className="max-h-70 min-h-42.5 space-y-3 overflow-y-auto px-5 py-5 text-sm leading-6">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className="flex gap-3">
            <span
              className={
                message.role === "user" ? "text-[#ff9b7d]" : "text-[#70e1d0]"
              }
            >
              {message.role === "user" ? ">" : "$"}
            </span>
            <p className="text-slate-300">{message.text}</p>
          </div>
        ))}
        {loading && (
          <p className="animate-pulse text-[#70e1d0]">
            $ searching live inventory...
          </p>
        )}
      </div>
      <form
        onSubmit={handleSearch}
        className="flex border-t border-white/10 p-4"
      >
        <span className="mr-3 py-3 text-[#70e1d0]">$</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask for an event, city, genre, or seats..."
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
          aria-label="Ask the ticket concierge"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="button-primary rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
      {result && (
        <div className="max-h-96 space-y-6 overflow-y-auto border-t border-white/10 p-5">
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
                          { query: lastQuery },
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
