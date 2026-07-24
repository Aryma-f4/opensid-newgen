import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/login", destination: "/siteman", permanent: false },
      { source: "/logout", destination: "/siteman/logout", permanent: false },
      { source: "/admin", destination: "/beranda", permanent: false },
    ]
  },
  async rewrites() {
    return [{ source: "/admin/:path*", destination: "/:path*" }]
  },
}

export default nextConfig
