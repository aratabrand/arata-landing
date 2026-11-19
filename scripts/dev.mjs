// `npm run dev` (D-135): el CSS del panel se compila aparte de Next (tailwind.panel.config.ts), así que
// aquí se genera una vez y se queda vigilando los archivos del panel mientras corre `next dev`.
// Sirve igual en Windows, macOS y Linux. Para construir: `npm run build` (ya lo genera antes).
import { spawn, spawnSync } from "node:child_process";

const ARGS_CSS = ["tailwindcss", "-c", "tailwind.panel.config.ts", "-i", "styles/panel.src.css", "-o", "styles/panel.generated.css"];
const aparte = { stdio: "inherit", shell: true };

const primero = spawnSync("npx", [...ARGS_CSS, "--minify"], aparte);
if (primero.status !== 0) process.exit(primero.status ?? 1);

const css = spawn("npx", [...ARGS_CSS, "--watch=always"], aparte);
const next = spawn("npx", ["next", "dev", ...process.argv.slice(2)], aparte);

const cerrar = (code) => {
  css.kill();
  next.kill();
  process.exit(code ?? 0);
};
next.on("exit", cerrar);
css.on("exit", (code) => code && cerrar(code));
process.on("SIGINT", () => cerrar(0));
process.on("SIGTERM", () => cerrar(0));
