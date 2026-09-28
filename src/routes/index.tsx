import { createFileRoute } from "@tanstack/react-router";
import { WeddingInvitation } from "@/components/WeddingInvitation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ayaan & Inaayat — 5 October 2026" },
      { name: "description", content: "The wedding invitation of Ayaan Sikander and Inaayat Mariam at Sunset Club Banquet Hall." },
      { property: "og:title", content: "Ayaan & Inaayat — Our Wedding" },
      { property: "og:description", content: "Together with their families, Ayaan and Inaayat invite you to celebrate on 5 October 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeddingInvitation,
});
