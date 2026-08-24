"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function CreateVenuePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", address: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/venues", form);
      const venueId = response.data?.id;
      if (venueId) {
        router.push(`/organiser/venues/${venueId}`);
      } else {
        router.push("/organiser/venues");
      }
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
          : message || "We could not create this venue.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-enter py-12 sm:py-16">
      <div className="mb-8">
        <p className="eyebrow">Create venue</p>
        <h1 className="mt-3 text-4xl font-black">
          Build a venue and configure the layout
        </h1>
      </div>

      <form
        onSubmit={submit}
        className="panel mx-auto max-w-2xl rounded-2xl p-6 sm:p-8"
      >
        <div className="space-y-5">
          <label className="block text-sm font-bold">
            Venue Name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>

          <label className="block text-sm font-bold">
            Address
            <input
              required
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
            />
          </label>

          <label className="block text-sm font-bold">
            City
            <input
              required
              value={form.city}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, city: event.target.value }))
              }
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
            onClick={() => router.push("/organiser/venues")}
            className="button-secondary rounded-xl px-4 py-3 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            className="button-primary rounded-xl px-5 py-3 text-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create venue & configure layout"}
          </button>
        </div>
      </form>
    </div>
  );
}
