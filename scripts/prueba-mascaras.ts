// Prueba de las máscaras de los formularios (D-119). Correr:  npx -y tsx scripts/prueba-mascaras.ts
import { mascaraCelular, celularValido, mascaraPesos, mascaraDias, diasValidos, mascaraInstagram, completarUrl, urlValida } from "../lib/panel/mascaras";
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };
ok(mascaraCelular("3001234567") === "300 123 4567", "celular CO 300 123 4567");
ok(mascaraCelular("+57 300-123-4567") === "300 123 4567", "celular CO quita +57 y guiones");
ok(mascaraCelular("30012345678999") === "300 123 4567", "celular CO máximo 10 números");
ok(celularValido("300 123 4567") && !celularValido("200 123 4567") && !celularValido("300 123"), "celular CO válido solo si empieza por 3 y tiene 10");
ok(mascaraCelular("12015550123", "US") === "120 155 501 23" && celularValido("12015550123", "US"), "celular otro país: hasta 15 números");
ok(mascaraPesos("1250000") === "1.250.000" && mascaraPesos("$ 1.250.000abc") === "1.250.000" && mascaraPesos("") === "", "pesos con puntos de miles");
ok(mascaraDias("2") === "2" && mascaraDias("2,5") === "2,5" && mascaraDias("2.5") === "2,5" && mascaraDias("2,7") === "2,5" && mascaraDias("abc") === "", "días: enteros o medios");
ok(diasValidos("2,5") && !diasValidos("0") && !diasValidos("400"), "días válidos de 0,5 a 365");
ok(mascaraInstagram("arata.san.web") === "@arata.san.web" && mascaraInstagram("@@ara ta!") === "@arata" && mascaraInstagram("https://instagram.com/arata.san.web") === "@arata.san.web", "Instagram con @ y caracteres válidos");
ok(completarUrl("aratasan.com") === "https://aratasan.com" && completarUrl("http://x.co") === "https://x.co" && completarUrl("") === "", "página web: completa https://");
ok(urlValida("https://aratasan.com") && !urlValida("https://aratasan") && urlValida(""), "página web válida");
if (process.exitCode) console.log("HAY FALLAS");
