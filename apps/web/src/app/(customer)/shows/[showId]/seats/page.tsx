import { SeatMap } from '@/components/seat-map/SeatMap';

export default function SeatSelectionPage({ params }: { params: { showId: string } }) {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Select Your Seats</h1>
        <p className="text-gray-400">Click on available seats to add them to your selection.</p>
      </div>
      
      <SeatMap showId={params.showId} />
    </div>
  );
}
