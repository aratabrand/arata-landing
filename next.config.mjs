/** @type {import('next').NextConfig} */

// Content-Security-Policy: la landing solo carga recursos propios.
// 'unsafe-inline' es necesario para los scripts/estilos que Next inyecta
// (hidratación, next/font, estilos inline de framer-motion).
// En desarrollo, Next necesita 'unsafe-eval' (Hot Reload) y ws: (HMR socket);
// en producción se usa la versión estricta.
const isDev = process.env.NODE_ENV === "development";

// Google Analytics (gtag.js) necesita cargar desde googletagmanager.com y
// enviar datos a google-analytics.com / analytics.google.com.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com",
  "font-src 'self' data:",
  `connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com${isDev ? " ws:" : ""}`,
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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
