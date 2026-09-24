import type { MetadataRoute } from "next";

// Name shown when the directory is installed or pinned to a home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tiru Health Medical Directory",
    short_name: "Tiru Health",
    description: "Find hospitals, specialists, tests and medicines across Addis Ababa. Trace the right care.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FBFA",
    theme_color: "#0B2E2B",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
