import type { MetadataRoute } from "next";
import { companion } from "./companion";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: companion.productName,
    short_name: companion.name,
    description: "Tiny Twitch lessons, verified streams, and one useful next action.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf9fd",
    theme_color: "#6b2bbf",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
