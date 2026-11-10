import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Permite a todos los buscadores y, explícitamente, a los bots de IA (GEO).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // El panel del cliente es privado (docs/panel-cliente/): no se rastrea.
      { userAgent: "*", allow: "/", disallow: ["/panel"] },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "Amazonbot",
          "CCBot",
        ],
        allow: "/",
        disallow: ["/panel"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
