import { AiAssistant } from "@/components/ai-assistant/AiAssistant";
import Link from "next/link";

export default function Home() {
  return (
    <div className="page-shell page-enter py-16 sm:py-24">
      <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow mb-5">Live experiences, beautifully booked</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-7xl">
            Your night out starts <span className="text-[#70e1d0]">here.</span>
          </h1>
          <p className="muted mt-7 max-w-xl text-lg leading-8">
            Find the right event, choose your view, and lock your seats before
            they disappear.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="button-primary rounded-xl px-5 py-3 text-sm"
            >
              Explore events
            </Link>
            <a
              href="#assistant"
              className="button-secondary rounded-xl px-5 py-3 text-sm font-bold"
            >
              Ask the concierge
            </a>
          </div>
          <div className="mt-12 flex gap-8 border-t border-white/10 pt-5 text-sm">
            <div>
              <strong className="block text-xl text-white">10 min</strong>
              <span className="muted">protected holds</span>
            </div>
            <div>
              <strong className="block text-xl text-white">0%</strong>
              <span className="muted">double-booking risk</span>
            </div>
            <div>
              <strong className="block text-xl text-white">24/7</strong>
              <span className="muted">seat updates</span>
            </div>
          </div>
        </div>
        <div id="assistant" className="relative lg:pb-4">
          <div className="absolute -inset-5 rounded-[2rem] bg-[#70e1d0]/10 blur-3xl" />
          <div className="relative">
            <AiAssistant />
          </div>
        </div>
      </div>
      <div className="mt-20 grid gap-4 md:grid-cols-3">
        {[
          [
            "01",
            "Instant holds",
            "A short, protected window gives you time to check out.",
          ],
          [
            "02",
            "Real seat maps",
            "See availability change live as people book around you.",
          ],
          [
            "03",
            "Grounded discovery",
            "The assistant searches actual shows, prices, and seats.",
          ],
        ].map(([number, title, copy]) => (
          <div key={number} className="panel rounded-2xl p-6">
            <span className="eyebrow">{number}</span>
            <h2 className="mt-8 text-xl font-bold">{title}</h2>
            <p className="muted mt-3 leading-6">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
