// Genera las imágenes para compartir (Open Graph 1200×630) del sitio v2 (Fase 5, D-087).
// Uso:  node scripts/og-v2.cjs   → escribe public/og/*.png
// Render con Playwright (Chromium) y las fuentes locales de app/fonts en base64
// (sin red). Se usa en vez de next/og porque falla en Windows con espacios en la
// ruta (CLAUDE.md §10). Sergio puede reemplazar cualquier PNG con un export de Figma
// del mismo nombre.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const sharp = require("sharp");

const raiz = path.join(__dirname, "..");
const b64 = (f) => fs.readFileSync(path.join(raiz, f)).toString("base64");
const fuente = (fam, peso, f) =>
  `@font-face{font-family:'${fam}';font-weight:${peso};src:url(data:font/woff2;base64,${b64("app/fonts/" + f)}) format('woff2')}`;
const captura = (slug, n = 1) => `data:image/webp;base64,${b64(`public/portafolio/capturas/${slug}-${n}.webp`)}`;

// Logo desde el componente (mismo dibujo, en blanco)
const logoTsx = fs.readFileSync(path.join(raiz, "components/Logo.tsx"), "utf8");
const paths = [...logoTsx.matchAll(/<path[^>]*\/>/g)]
  .map((m) => m[0].replace(/fillRule=/g, "fill-rule=").replace(/clipRule=/g, "clip-rule=").replace(/fill=\{c\}/g, 'fill="#FFFFFF"'))
  .join("");
const logo = `<svg viewBox="0 0 680 119" width="194" height="34" style="align-self:flex-start;flex:none" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;

const css = `
${fuente("Funnel", 800, "funnel-display-latin-800-normal.woff2")}
${fuente("Jakarta", 500, "plus-jakarta-sans-latin-500-normal.woff2")}
${fuente("Jakarta", 700, "plus-jakarta-sans-latin-700-normal.woff2")}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#03010B;color:#fff;font-family:Jakarta,sans-serif;position:relative}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.05) 1px,transparent 1px);background-size:40px 40px;-webkit-mask-image:radial-gradient(ellipse 70% 70% at 30% 40%,#000 30%,transparent 100%)}
.glow{position:absolute;left:-200px;top:-260px;width:900px;height:700px;background:radial-gradient(closest-side,rgba(125,83,255,.45),transparent)}
.wrap{position:absolute;inset:0;padding:56px 64px;display:flex;flex-direction:column}
.badge{display:inline-flex;align-items:center;gap:10px;margin-top:40px;padding:8px 16px;border:1px solid rgba(255,255,255,.14);border-radius:999px;font-size:20px;color:#B4AECB;width:max-content}
.dot{width:10px;height:10px;border-radius:50%;background:#B6FF00}
h1{font-family:Funnel;font-weight:800;letter-spacing:-.04em;line-height:1;margin-top:22px}
.lime{color:#B6FF00}
.pie{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font-size:22px;color:#B4AECB}
.pie b{color:#fff;font-weight:700}
.marco{position:absolute;border-radius:22px;padding:8px;background:#0A0714;border:1px solid rgba(255,255,255,.1);box-shadow:0 30px 80px rgba(0,0,0,.6)}
.marco img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;border-radius:15px}
`;

const pagina = (cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="glow"></div><div class="grid"></div>${cuerpo}</body></html>`;

const conCaptura = ({ etiqueta, titulo, lima, pie, img, img2 }) =>
  pagina(`
  <div class="marco" style="right:-60px;top:150px;width:560px;transform:rotate(-4deg)"><img src="${img}"></div>
  ${img2 ? `<div class="marco" style="right:300px;top:380px;width:300px;transform:rotate(5deg)"><img src="${img2}"></div>` : ""}
  <div class="wrap" style="width:700px">
    ${logo}
    <span class="badge"><span class="dot"></span>${etiqueta}</span>
    <h1 style="font-size:60px">${titulo}${lima ? ` <span class="lime">${lima}</span>` : ""}</h1>
    <div class="pie" style="width:1072px"><span>${pie}</span><b>aratasan.com</b></div>
  </div>`);

const { proyectos } = (() => {
  // Lee los datos mínimos de los casos sin compilar TypeScript
  const src = fs.readFileSync(path.join(raiz, "content/proyectos.ts"), "utf8");
  // Solo campos del primer nivel del proyecto (4 espacios), no los de `proceso` o `ficha`
  const campo = (bloque, k) => (bloque.match(new RegExp(`^    ${k}: "([^"]+)"`, "m")) || [])[1];
  const bloques = src.split(/\n  \{\n/).slice(1);
  return {
    proyectos: bloques.map((b) => ({
      slug: campo(b, "slug"),
      nombre: campo(b, "nombre"),
      etiqueta: campo(b, "etiqueta"),
      titulo: campo(b, "titulo"),
    })),
  };
})();

const piezas = [
  {
    nombre: "og-v2",
    html: pagina(`
      <div class="marco" style="right:-40px;top:120px;width:500px;transform:rotate(-5deg)"><img src="${captura("caravana")}"></div>
      <div class="marco" style="right:250px;top:330px;width:340px;transform:rotate(4deg)"><img src="${captura("arata-print")}"></div>
      <div class="wrap">
        ${logo}
        <span class="badge"><span class="dot"></span>Tomamos 3 proyectos nuevos al mes</span>
        <h1 style="font-size:72px;width:720px">Tu página lista en 5 días. <span class="lime">Hecha para vender desde el celular.</span></h1>
        <div class="pie"><span>Páginas · Catálogos · Sistemas · <b>desde 400 USD</b></span><b>aratasan.com</b></div>
      </div>`),
  },
  {
    nombre: "og-paginas-web",
    html: conCaptura({
      etiqueta: "Página Lista en 5 Días",
      titulo: "Una página que trabaja por ti,",
      lima: "lista en 5 días.",
      pie: "<b>Desde 400 USD</b> · Garantía de velocidad 90+",
      img: captura("boost-your-menu"),
      img2: captura("danrodedm"),
    }),
  },
  {
    nombre: "og-catalogos-y-sistemas",
    html: conCaptura({
      etiqueta: "Tienda por WhatsApp en 5 Días",
      titulo: "Tu tienda lista en 5 días.",
      lima: "Los pedidos te llegan al WhatsApp.",
      pie: "<b>Desde 800 USD</b> · Sistemas a medida",
      img: captura("caravana"),
      img2: captura("arata-print"),
    }),
  },
  {
    nombre: "og-portafolio",
    html: pagina(`
      ${proyectos
        .map(
          (p, i) =>
            `<div class="marco" style="right:${[-30, 250, -10, 270][i]}px;top:${[70, 150, 340, 410][i]}px;width:300px;transform:rotate(${[-4, 3, 4, -3][i]}deg)"><img src="${captura(p.slug)}"></div>`
        )
        .join("")}
      <div class="wrap" style="width:640px">
        ${logo}
        <span class="badge"><span class="dot"></span>Portafolio</span>
        <h1 style="font-size:68px">Trabajos reales, <span class="lime">negocios reales.</span></h1>
        <div class="pie" style="width:1072px"><span>${proyectos.map((p) => p.nombre).join(" · ")}</span><b>aratasan.com</b></div>
      </div>`),
  },
  ...proyectos.map((p) => ({
    nombre: `og-caso-${p.slug}`,
    html: conCaptura({ etiqueta: `${p.nombre} · ${p.etiqueta}`, titulo: p.titulo, pie: "Caso de Arata San", img: captura(p.slug), img2: captura(p.slug, 2) }),
  })),
];

(async () => {
  const navegador = await chromium.launch();
  const page = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const pz of piezas) {
    await page.setContent(pz.html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const png = await page.screenshot({ type: "png" });
    const salida = path.join(raiz, "public/og", `${pz.nombre}.png`);
    await sharp(png).png({ palette: true, quality: 88, compressionLevel: 9, effort: 10 }).toFile(salida);
    console.log(pz.nombre, Math.round(fs.statSync(salida).size / 1024), "KB");
  }
  await navegador.close();
})();
