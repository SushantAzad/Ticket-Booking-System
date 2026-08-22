import { AiAssistant } from '@/components/ai-assistant/AiAssistant';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-12 px-4">
      <div className="max-w-4xl w-full text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Book your next experience{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            without the wait.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          TicketFlow guarantees your seat instantly. No race conditions, no double bookings. 
          Just ask our AI assistant what you're looking for.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <AiAssistant />
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-2xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2">Instant Holds</h3>
          <p className="text-gray-400 text-sm">Your seat is locked the millisecond you click it. Zero chance of a double booking.</p>
        </div>
        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-2xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">AI Powered</h3>
          <p className="text-gray-400 text-sm">Just tell us what you want. We'll find the best seats matching your budget and preferences.</p>
        </div>
        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-2xl mb-4">🎫</div>
          <h3 className="text-xl font-bold mb-2">Smart Waitlist</h3>
          <p className="text-gray-400 text-sm">Sold out? Join the waitlist and get automatically assigned a ticket if someone cancels.</p>
        </div>
      </div>
    </div>
  );
}
