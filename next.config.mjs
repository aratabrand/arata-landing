/** @type {import('next').NextConfig} */

// Content-Security-Policy: la landing solo carga recursos propios.
// 'unsafe-inline' es necesario para los scripts/estilos que Next inyecta
// (hidratación, next/font, estilos inline de framer-motion).
// En desarrollo, Next necesita 'unsafe-eval' (Hot Reload) y ws: (HMR socket);
// en producción se usa la versión estricta.
const isDev = process.env.NODE_ENV === "development";

// Google Tag Manager carga desde googletagmanager.com; los tags que se
// administran dentro (GA4, etc.) envían datos a google-analytics.com /
// analytics.google.com (incluidos endpoints regionales). El iframe de respaldo
// sin JS de GTM requiere frame-src hacia googletagmanager.com.
// Cal.com (calendario de /agendar, D-012): su embed.js carga desde app.cal.com y
// pinta el calendario en un iframe de app.cal.com / cal.com. Solo se pide al
// llegar al último paso del formulario.
const cal = "https://app.cal.com https://cal.com";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://app.cal.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com https://*.googletagmanager.com https://www.google.com",
  "font-src 'self' data:",
  // GA4 manda cada evento a *.google-analytics.com y una copia a www.google.com/g/collect (D-096).
  `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com ${cal}${isDev ? " ws:" : ""}`,
  `frame-src https://www.googletagmanager.com ${cal}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // no revelar "X-Powered-By: Next.js"
  agentRules: false, // no inyectar el bloque de reglas de Next en CLAUDE.md
  experimental: {
    // El CSS va dentro del HTML: quita la petición que bloqueaba el primer pintado (LCP)
    inlineCss: true,
  },
  // Lanzamiento v2 (D-091): la muestra /v2 pasó a ser el Inicio.
  async redirects() {
    return [{ source: "/v2", destination: "/", permanent: true }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
