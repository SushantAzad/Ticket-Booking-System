"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

const seatCategoryNames = ["STANDARD", "PREMIUM", "VIP"] as const;
const COLORS: Record<string, string> = {
  STANDARD: "#4ade80",
  PREMIUM: "#facc15",
  VIP: "#a78bfa",
};

export default function VenueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const venueId = params.id;

  const [venue, setVenue] = useState<any>(null);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; colorCode: string }>
  >([]);
  const [categoryForm, setCategoryForm] = useState({
    name: "STANDARD",
    colorCode: COLORS.STANDARD,
  });
  const [ranges, setRanges] = useState<
    Array<{
      row: string;
      fromNumber: number;
      toNumber: number;
      category: string;
    }>
  >([]);
  const [rangeForm, setRangeForm] = useState({
    row: "A",
    fromNumber: 1,
    toNumber: 10,
    category: "VIP",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadVenue = async () => {
    try {
      const response = await apiClient.get(`/venues/${venueId}`);
      const venueData = response.data ?? {};
      setVenue(venueData);
      setCategories(venueData.seatCategories ?? []);
    } catch {
      setError("Unable to load this venue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (venueId) {
      void loadVenue();
    }
  }, [venueId]);

  const addCategory = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await apiClient.post(
        `/venues/${venueId}/categories`,
        categoryForm,
      );
      setCategories((prev) => [...prev, response.data]);
      setCategoryForm({ name: "STANDARD", colorCode: COLORS.STANDARD });
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
          : message || "Could not add category.",
      );
    }
  };

  const addRange = () => {
    setRanges((prev) => [
      ...prev,
      {
        ...rangeForm,
        fromNumber: Number(rangeForm.fromNumber),
        toNumber: Number(rangeForm.toNumber),
      },
    ]);
    setRangeForm((prev) => ({
      ...prev,
      row: prev.row,
      fromNumber: 1,
      toNumber: 10,
      category: prev.category,
    }));
  };

  const submitSeats = async () => {
    if (ranges.length === 0) {
      setError("Add at least one seat range before submitting.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiClient.post(`/venues/${venueId}/seats`, { ranges });
      router.push("/organiser/venues");
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
          : message || "Could not create venue seats.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="page-shell page-enter py-20 text-center muted">
        Loading venue...
      </div>
    );
  if (!venue)
    return (
      <div className="page-shell page-enter py-20 text-center">
        Venue not found.
      </div>
    );

  return (
    <div className="page-shell page-enter py-12 sm:py-16">
      <div className="mb-8">
        <p className="eyebrow">Venue layout</p>
        <h1 className="mt-3 text-4xl font-black">{venue.name}</h1>
        <p className="muted mt-2 text-sm">
          {venue.address} · {venue.city}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel rounded-2xl p-6">
          <h2 className="text-2xl font-bold">Seat categories</h2>
          <form onSubmit={addCategory} className="mt-5 space-y-4">
            <label className="block text-sm font-bold">
              Category
              <select
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    name: event.target.value as typeof prev.name,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
              >
                {seatCategoryNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold">
              Color
              <input
                type="color"
                value={categoryForm.colorCode}
                onChange={(event) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    colorCode: event.target.value,
                  }))
                }
                className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 p-1"
              />
            </label>
            <button className="button-primary w-full rounded-xl px-4 py-3 text-sm">
              Add category
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {categories.length === 0 ? (
              <p className="muted text-sm">
                No categories yet. Add the initial categories first.
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-3"
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
                  <span className="text-xs text-[#70e1d0]">
                    {category.colorCode}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel rounded-2xl p-6">
          <h2 className="text-2xl font-bold">Create seat layout</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-bold">
              Row
              <input
                value={rangeForm.row}
                onChange={(event) =>
                  setRangeForm((prev) => ({
                    ...prev,
                    row: event.target.value.toUpperCase(),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
              />
            </label>
            <label className="block text-sm font-bold">
              Category
              <select
                value={rangeForm.category}
                onChange={(event) =>
                  setRangeForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
              >
                {seatCategoryNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold">
              From
              <input
                type="number"
                min={1}
                value={rangeForm.fromNumber}
                onChange={(event) =>
                  setRangeForm((prev) => ({
                    ...prev,
                    fromNumber: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
              />
            </label>
            <label className="block text-sm font-bold">
              To
              <input
                type="number"
                min={1}
                value={rangeForm.toNumber}
                onChange={(event) =>
                  setRangeForm((prev) => ({
                    ...prev,
                    toNumber: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-normal outline-none focus:border-[#70e1d0]"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={addRange}
            className="button-secondary mt-5 rounded-xl px-4 py-3 text-sm"
          >
            Add range
          </button>

          <div className="mt-6 space-y-3">
            {ranges.length === 0 ? (
              <p className="muted text-sm">
                No ranges added yet. Example: Row A from 1 to 10 in VIP.
              </p>
            ) : (
              ranges.map((range, index) => (
                <div
                  key={`${range.row}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-3 text-sm"
                >
                  <span className="font-bold text-white">
                    {range.row} {range.fromNumber}-{range.toNumber}
                  </span>
                  <span className="text-[#70e1d0]">{range.category}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="mb-3 text-sm font-bold text-white">Live preview</p>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, rowIndex) => {
                const rowName = String.fromCharCode(65 + rowIndex);
                const rowRanges = ranges.filter(
                  (range) => range.row === rowName,
                );
                return (
                  <div key={rowName} className="flex items-center gap-2">
                    <span className="w-5 text-right text-xs text-slate-400">
                      {rowName}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rowRanges.length === 0 ? (
                        <span className="text-xs text-slate-500">empty</span>
                      ) : (
                        rowRanges.map((range, index) => {
                          const seats = Array.from(
                            {
                              length: Math.max(
                                1,
                                range.toNumber - range.fromNumber + 1,
                              ),
                            },
                            (_, i) => i + range.fromNumber,
                          );
                          return (
                            <div
                              key={`${rowName}-${index}`}
                              className="flex gap-1"
                            >
                              {seats.map((seat) => (
                                <span
                                  key={`${rowName}-${seat}`}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-slate-900"
                                  style={{
                                    backgroundColor:
                                      COLORS[range.category] ?? "#7dd3fc",
                                  }}
                                >
                                  {seat}
                                </span>
                              ))}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-[#ff8d72]/10 p-3 text-sm text-[#ffc0b0]">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/organiser/venues")}
              className="button-secondary rounded-xl px-4 py-3 text-sm"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={() => void submitSeats()}
              disabled={saving}
              className="button-primary rounded-xl px-5 py-3 text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Submit layout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
