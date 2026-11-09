// Interruptor de lanzamiento del sitio v2 (Fase 5 → Fase 6, D-088).
//
// Vercel solo publica `main` en www.aratasan.com: lo que hay en la rama se ve
// únicamente en el preview. Al lanzar, en el mismo PR:
//   1. Poner V2_PUBLICADO = true  → se indexa la v2, entra al sitemap, cambia el
//      JSON-LD de la agencia y /llms.txt pasa a la versión v2.
//   2. Mover el Inicio v2 a "/" y cambiar INICIO a "/" (ver 06-seo-geo-velocidad.md §6).
export const V2_PUBLICADO = false;
