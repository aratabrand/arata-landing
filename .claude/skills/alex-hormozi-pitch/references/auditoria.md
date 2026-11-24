# Auditoría de una oferta

## 1. Qué reunir antes de puntuar

| Pieza | Dónde mirar (en Arata San) |
|---|---|
| La oferta como la ve el cliente | Página publicada, `content/servicios.ts`, `content/campanas/*`, `content/inicio.ts` |
| El anuncio o el canal que trae a la gente | `docs/campanas/*`, carruseles, mensaje de prospección (`lib/panel/clientes/prospectos.ts`) |
| El paso de agenda | `/agendar`, `content/agendar.ts`, `components/v2/BookingFlow.tsx` |
| La estrategia escrita | `docs/blueprint/01-estrategia-hormozi.md` |
| Prueba disponible | `content/proyectos.ts`, `content/casos-exito.ts`, `docs/portafolio.md` |
| Lo que se promete por fuera (reunión, propuesta) | Guion CLOSER, plantilla de propuesta |

## 2. Tabla de puntaje (1 a 5)

1 = no existe · 2 = existe pero débil o confuso · 3 = correcto · 4 = fuerte · 5 = difícil de mejorar. Cada nota lleva la evidencia (archivo:línea o URL) y una frase de por qué.

| # | Criterio | 5 se ve así |
|---|---|---|
| 1 | Resultado soñado | Titular en palabras del cliente, con resultado y no con funciones |
| 2 | Probabilidad percibida | Casos reales, cifras medidas y un testimonio visibles antes del llamado |
| 3 | Tiempo de espera | Plazo corto, visible arriba, con el primer avance claro |
| 4 | Esfuerzo y sacrificio | «Lo hacemos por ti», pago por partes y capacitación dichos donde aparece la duda |
| 5 | Pila de valor | Núcleo + bonos, cada uno con el problema que resuelve; total de valor frente al precio |
| 6 | Garantía | Con nombre, dice qué cubre, cómo se pide y el plazo; ataca el miedo principal del avatar |
| 7 | Escasez | Real, específica y visible (cupos), sin inventar |
| 8 | Urgencia | Fecha real, visible, que se apaga sola; ojalá ligada a la temporada del cliente |
| 9 | Nombre | MAGIC: avatar, resultado, plazo; corto |
| 10 | Precio y anclaje | Precio claro en la moneda del cliente, anclado contra el costo de seguir igual o la alternativa |
| 11 | Objeciones | Las 5 objeciones grandes respondidas con oferta (no solo con palabras) |
| 12 | Continuidad | Anuncio → página → agenda → reunión dicen lo mismo; el beneficio de la oferta llega a quien vende |

Puntaje total sobre 60. Menos de 30: rehacer la oferta. 30 a 44: arreglar las fugas. 45 o más: probar variantes.

## 3. Plantilla del informe

```markdown
# Auditoría de la oferta — [oferta] ([fecha])

| Estado | Fuente | Aprueba |
|---|---|---|
| Borrador | Skill alex-hormozi-pitch | [quien aprueba] |

## Resumen
- Puntaje: XX/60. [Una frase con el diagnóstico.]
- Las 3 fugas más grandes: …
- Lo que hay que decidir: …

## Puntaje
| # | Criterio | Nota | Evidencia | Por qué |

## Ecuación de valor
| Palanca | Hoy | Cómo subirla |

## Fugas en el camino del cliente
| Paso | Qué ve | Qué se pierde |

## Riesgos (inventado, escasez falsa, Ley 1480, garantía)
| Riesgo | Dónde | Qué hacer |

## Mejoras
### P0 — antes de gastar en anuncios
| # | Mejora | Palanca | Por qué | Esfuerzo | Decide |
### P1 — esta semana
### P2 — pruebas A/B

## Copy para elegir
(versiones A/B/C de lo que cambia)

## Qué no tocar
(lo que ya funciona)
```
