import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Makan — Malaysian calorie tracker",
    short_name: "Makan",
    description:
      "Track calories with photo recognition tuned for Malaysian food and local fast food.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF8F1",
    theme_color: "#157F58",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
