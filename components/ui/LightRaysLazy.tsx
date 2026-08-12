"use client";

import dynamic from "next/dynamic";

// Carga diferida: `ogl` (WebGL) solo se descarga en el cliente cuando se necesita,
// fuera del bundle inicial de la página.
const LightRaysLazy = dynamic(() => import("./LightRays"), { ssr: false });

export default LightRaysLazy;
