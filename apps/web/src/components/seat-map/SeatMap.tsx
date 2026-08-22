'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket-client';
import { apiClient } from '@/lib/api-client';

interface Seat {
  id: string;
  venueSeatId: string;
  row: string;
  number: number;
  label: string;
  category: string;
  categoryId: string;
  colorCode: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'OFFERED';
  price: number;
}

interface SeatMapData {
  showId: string;
  categories: { id: string; name: string; colorCode: string; price: number }[];
  rows: { row: string; seats: Seat[] }[];
}

export const SeatMap = ({ showId }: { showId: string }) => {
  const [data, setData] = useState<SeatMapData | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial state
    apiClient.get(`/shows/${showId}/seats`).then((res) => {
      setData(res.data);
      setLoading(false);
    });

    // 2. Connect socket for live updates
    const socket = connectSocket();
    socket.emit('join_show', { showId });

    socket.on('seat.status.changed', (update: { seatId: string; status: Seat['status'] }) => {
      setData((prev) => {
        if (!prev) return prev;
        const newRows = prev.rows.map((row) => ({
          ...row,
          seats: row.seats.map((seat) =>
            seat.id === update.seatId ? { ...seat, status: update.status } : seat
          ),
        }));
        return { ...prev, rows: newRows };
      });
    });

    socket.on('hold.expired', (update: { seatIds: string[] }) => {
      setData((prev) => {
        if (!prev) return prev;
        const newRows = prev.rows.map((row) => ({
          ...row,
          seats: row.seats.map((seat) =>
            update.seatIds.includes(seat.id) ? { ...seat, status: 'AVAILABLE' } : seat
          ),
        }));
        return { ...prev, rows: newRows };
      });
    });

    return () => {
      socket.emit('leave_show', { showId });
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
    try {
      const seatIds = Array.from(selectedSeats);
      const res = await apiClient.post(`/shows/${showId}/holds`, { seatIds });
      alert(`Seats held successfully! Hold ID: ${res.data.id}`);
      // Redirect to checkout or next step
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to hold seats.');
    }
  };

  if (loading || !data) return <div className="p-8 text-center animate-pulse">Loading seat map...</div>;

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto p-4 bg-gray-900 rounded-xl shadow-2xl">
      <div className="w-full mb-8 h-12 bg-gradient-to-b from-blue-500/20 to-transparent rounded-t-full border-t border-blue-500/50 flex items-center justify-center">
        <span className="text-blue-400 font-semibold tracking-widest uppercase text-sm">Screen / Stage</span>
      </div>

      <div className="flex flex-col gap-2 overflow-x-auto w-full pb-8">
        {data.rows.map((row, idx) => (
          <div key={idx} className="flex gap-4 items-center justify-center">
            <span className="w-6 text-right font-bold text-gray-500">{row.row}</span>
            <div className="flex gap-2">
              {row.seats.map((seat) => {
                const isSelected = selectedSeats.has(seat.id);
                const isAvailable = seat.status === 'AVAILABLE';
                
                let baseColor = 'bg-gray-800 border-gray-700'; // Default
                let hover = '';

                if (isAvailable) {
                  baseColor = \`bg-[\${seat.colorCode}] border-transparent\`;
                  hover = 'hover:scale-110 hover:brightness-125 cursor-pointer';
                } else if (seat.status === 'HELD') {
                  baseColor = 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500/50 cursor-not-allowed';
                } else if (seat.status === 'BOOKED') {
                  baseColor = 'bg-red-500/20 border-red-500/50 text-red-500/50 cursor-not-allowed';
                }

                if (isSelected) {
                  baseColor = 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]';
                  hover = 'hover:scale-110 cursor-pointer';
                }

                return (
                  <button
                    key={seat.id}
                    disabled={!isAvailable && !isSelected}
                    onClick={() => toggleSeat(seat.id)}
                    className={\`w-8 h-8 rounded-t-lg rounded-b-sm border text-xs font-semibold flex items-center justify-center transition-all duration-200 \${baseColor} \${hover}\`}
                    title={\`\${seat.label} - \${seat.category} (₹\${seat.price})\`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-left font-bold text-gray-500">{row.row}</span>
          </div>
        ))}
      </div>

      <div className="w-full flex justify-between items-center mt-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-600 rounded"></div><span className="text-sm text-gray-400">Available</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/50 rounded"></div><span className="text-sm text-gray-400">Held</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div><span className="text-sm text-gray-400">Booked</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white rounded shadow-md"></div><span className="text-sm text-gray-400">Selected</span></div>
        </div>
        
        <button
          onClick={holdSeats}
          disabled={selectedSeats.size === 0}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Hold {selectedSeats.size} Seats
        </button>
      </div>
    </div>
  );
};
