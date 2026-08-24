import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_URL || "https://ticket-booking-system-1n0w.onrender.com"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
