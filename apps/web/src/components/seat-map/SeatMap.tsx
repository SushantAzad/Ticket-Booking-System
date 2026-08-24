"use client";

import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket-client";
import { apiClient } from "@/lib/api-client";

interface Seat {
  id: string;
  venueSeatId: string;
  row: string;
  number: number;
  label: string;
  category: string;
  categoryId: string;
  colorCode: string;
  status: "AVAILABLE" | "HELD" | "BOOKED" | "OFFERED";
  price: number;
}

interface SeatMapData {
  showId: string;
  categories: {
    id: string;
    name: string;
    colorCode: string;
    price: number;
  }[];
  rows: {
    row: string;
    seats: Seat[];
  }[];
}

export const SeatMap = ({ showId }: { showId: string }) => {
  const [data, setData] = useState<SeatMapData | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    const loadSeatMap = async () => {
      try {
        const response = await apiClient.get(`/shows/${showId}/seats`);

        const seatMap = response.data;

        if (!seatMap?.rows) {
          throw new Error("Invalid seat map response.");
        }

        setData(seatMap);
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unknown request error";

        setError(`Unable to load this seat map: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    void loadSeatMap();

    const socket = connectSocket();

    socket.emit("join_show", { showId });

    socket.on(
      "seat.status.changed",
      (update: { seatId: string; status: Seat["status"] }) => {
        if (update.status !== "AVAILABLE") {
          setSelectedSeats((previous) => {
            if (!previous.has(update.seatId)) return previous;

            const next = new Set(previous);
            next.delete(update.seatId);

            return next;
          });
        }

        setData((prev) => {
          if (!prev) return prev;

          const newRows = prev.rows.map((row) => ({
            ...row,
            seats: row.seats.map((seat) =>
              seat.id === update.seatId
                ? {
                    ...seat,
                    status: update.status,
                  }
                : seat,
            ),
          }));

          return {
            ...prev,
            rows: newRows,
          };
        });
      },
    );

    socket.on("hold.expired", (update: { seatIds: string[] }) => {
      setData((prev) => {
        if (!prev) return prev;

        const newRows = prev.rows.map((row) => ({
          ...row,
          seats: row.seats.map((seat) =>
            update.seatIds.includes(seat.id)
              ? {
                  ...seat,
                  status: "AVAILABLE" as const,
                }
              : seat,
          ),
        }));

        return {
          ...prev,
          rows: newRows,
        };
      });
    });

    return () => {
      socket.emit("leave_show", { showId });
      disconnectSocket();
    };
  }, [showId]);

  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) => {
      const next = new Set(prev);

      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }

      return next;
    });
  };

  const holdSeats = async () => {
    if (selectedSeats.size === 0) return;

    setHolding(true);
    setActionMessage("");

    try {
      const latestResponse = await apiClient.get(`/shows/${showId}/seats`);

      const latestMap = latestResponse.data;

      if (!latestMap?.rows) {
        throw new Error("Unable to refresh seat availability.");
      }

      const latestSeats = latestMap.rows.flatMap(
        (row: { seats: Seat[] }) => row.seats,
      );

      const availableIds = new Set(
        latestSeats
          .filter((seat: Seat) => seat.status === "AVAILABLE")
          .map((seat: Seat) => seat.id),
      );

      const seatIds = Array.from(selectedSeats);

      const unavailableSeats = seatIds.filter(
        (seatId) => !availableIds.has(seatId),
      );

      setData(latestMap);

      if (unavailableSeats.length > 0) {
        setSelectedSeats((previous) => {
          const next = new Set(previous);

          unavailableSeats.forEach((seatId) => next.delete(seatId));

          return next;
        });

        setActionMessage(
          "One or more selected seats were just taken. Choose available seats and try again.",
        );

        return;
      }

      const res = await apiClient.post(`/shows/${showId}/holds`, { seatIds });

      setSelectedSeats(new Set());

      setActionMessage(
        `Seats held successfully for 10 minutes. Hold ID: ${res.data.id}`,
      );
    } catch (error: unknown) {
      setActionMessage(axiosErrorMessage(error));
    } finally {
      setHolding(false);
    }
  };

  // Rest of your JSX remains unchanged

  if (loading)
    return (
      <div className="muted page-shell py-24 text-center">
        Loading your seat map...
      </div>
    );
  if (error || !data)
    return (
      <div className="page-shell py-24 text-center">
        <p className="text-lg font-bold">{error || "Seat map unavailable."}</p>
        <a
          href="/events"
          className="button-primary mt-5 inline-block rounded-xl px-5 py-3 text-sm"
        >
          Back to events
        </a>
      </div>
    );

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto p-4 panel rounded-2xl shadow-2xl">
      <div className="w-full mb-8 h-12 bg-gradient-to-b from-blue-500/20 to-transparent rounded-t-full border-t border-blue-500/50 flex items-center justify-center">
        <span className="text-blue-400 font-semibold tracking-widest uppercase text-sm">
          Screen / Stage
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-x-auto w-full pb-8">
        {data.rows.map((row, idx) => (
          <div key={idx} className="flex gap-4 items-center justify-center">
            <span className="w-6 text-right font-bold text-gray-500">
              {row.row}
            </span>
            <div className="flex gap-2">
              {row.seats.map((seat) => {
                const isSelected = selectedSeats.has(seat.id);
                const isAvailable = seat.status === "AVAILABLE";

                let baseColor = "bg-gray-800 border-gray-700"; // Default
                let hover = "";

                if (isAvailable) {
                  baseColor = "border-transparent";
                  hover = "hover:scale-110 hover:brightness-125 cursor-pointer";
                } else if (seat.status === "HELD") {
                  baseColor =
                    "bg-yellow-500/20 border-yellow-500/50 text-yellow-500/50 cursor-not-allowed";
                } else if (seat.status === "BOOKED") {
                  baseColor =
                    "bg-red-500/20 border-red-500/50 text-red-500/50 cursor-not-allowed";
                }

                if (isSelected) {
                  baseColor =
                    "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]";
                  hover = "hover:scale-110 cursor-pointer";
                }

                return (
                  <button
                    key={seat.id}
                    disabled={!isAvailable && !isSelected}
                    onClick={() => toggleSeat(seat.id)}
                    className={`w-8 h-8 rounded-t-lg rounded-b-sm border text-xs font-semibold flex items-center justify-center transition-all duration-200 ${baseColor} ${hover}`}
                    style={
                      isAvailable && !isSelected
                        ? { backgroundColor: seat.colorCode }
                        : undefined
                    }
                    title={seat.label}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-left font-bold text-gray-500">
              {row.row}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full flex justify-between items-center mt-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-sm text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/50 rounded"></div>
            <span className="text-sm text-gray-400">Held</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div>
            <span className="text-sm text-gray-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded shadow-md"></div>
            <span className="text-sm text-gray-400">Selected</span>
          </div>
        </div>

        <button
          onClick={holdSeats}
          disabled={selectedSeats.size === 0 || holding}
          className="button-primary rounded-xl px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {holding ? "Checking seats..." : `Hold ${selectedSeats.size} Seats`}
        </button>
      </div>
      {actionMessage && (
        <p className="muted mt-4 w-full text-center text-sm">{actionMessage}</p>
      )}
    </div>
  );
};

function axiosErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as { response?: { data?: { message?: string | string[] } } }
    ).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (message) return message;
  }
  return error instanceof Error ? error.message : "Failed to hold seats.";
}
