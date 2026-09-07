import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jsknvmfqmawamqtewcdl.supabase.co",
      },
    ],
  },
  // Every facility had two working addresses and only one of them was live.
  // /facilities/<slug> reads the database; /pharmacies/<slug> and
  // /diagnostics/<slug> read a snapshot of the intake JSON taken before the
  // database existed, so they showed the original import forever — no
  // corrected coordinate, no edited service list, and no deactivation. A
  // facility taken down for closing permanently still answered on those two
  // addresses with a working phone number.
  //
  // Nothing on the site ever linked to them: every card and button resolves
  // detailHref, which is /facilities/<slug> from both the database mapper and
  // the static one. They were reachable only from an old bookmark or a search
  // result, which is also why a redirect beats deleting them — someone
  // arriving on a stale link lands on the real page instead of an error.
  //
  // The list pages /pharmacies and /diagnostics are untouched: :slug requires
  // a path segment, so a bare list URL does not match.
  async redirects() {
    return [
      {
        source: "/pharmacies/:slug",
        destination: "/facilities/:slug",
        permanent: true,
      },
      {
        source: "/diagnostics/:slug",
        destination: "/facilities/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
