"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

const eventTypeOptions = ["MOVIE", "CONCERT", "LIVE_EVENT"] as const;

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "MOVIE" as (typeof eventTypeOptions)[number],
    genre: "",
    posterUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/events", form);
      router.push("/organiser/events");
      return response;
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
          : message || "We could not create this event.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-enter py-12 sm:py-16">
      <div className="mb-8">
        <p className="eyebrow">Create event</p>
        <h1 className="mt-3 text-4xl font-black">
          Bring a new experience to TicketFlow
        </h1>
      </div>

      <form
        onSubmit={submit}
        className="panel mx-auto max-w-3xl rounded-2xl p-6 sm:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-bold md:col-span-2">
            Title
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>

          <label className="block text-sm font-bold md:col-span-2">
            Description
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>

          <label className="block text-sm font-bold">
            Type
            <select
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  type: event.target.value as (typeof eventTypeOptions)[number],
                }))
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            >
              {eventTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold">
            Genre
            <input
              required
              value={form.genre}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, genre: event.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>

          <label className="block text-sm font-bold md:col-span-2">
            Poster URL
            <input
              type="url"
              value={form.posterUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, posterUrl: event.target.value }))
              }
              placeholder="https://example.com/poster.jpg"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>
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
            disabled={loading}
            className="button-primary rounded-xl px-5 py-3 text-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create event"}
          </button>
        </div>
      </form>
    </div>
  );
}
