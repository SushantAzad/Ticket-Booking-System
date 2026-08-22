'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export const AiAssistant = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await apiClient.post('/ai/event-search', { query });
      setResult(res.data);
    } catch (error) {
      console.error(error);
      alert('Failed to process AI query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white text-lg">✨</span>
        </div>
        <h2 className="text-xl font-bold text-white">AI Ticketing Assistant</h2>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'I need 2 VIP tickets for a rock concert in Mumbai under 2000 rupees each'"
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
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
          {result.recommendedSeats?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Recommended Seats</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {result.recommendedSeats.map((seat: any, i: number) => (
                  <div key={i} className="bg-gray-800 border border-gray-700 p-3 rounded-lg min-w-[120px]">
                    <div className="text-xs text-gray-400 mb-1">{seat.category}</div>
                    <div className="text-lg font-bold text-white">{seat.row}-{seat.number}</div>
                    <div className="text-sm font-semibold text-green-400">₹{seat.price}</div>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors">
                Hold Recommended Seats
              </button>
            </div>
          )}

          {/* Events Found */}
          {result.events?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Events Found</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {result.events.map((event: any) => (
                  <div key={event.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                    <h4 className="font-bold text-white text-lg">{event.title}</h4>
                    <p className="text-sm text-gray-400">{event.genre} • {event.city}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
