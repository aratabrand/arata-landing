# 02 — Modelo de datos e integraciones

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Borrador | 0.1 | 10 nov 2026 | Santiago |

**Base: Neon, proyecto `arata-panel`** (D-108). Nunca la base de un catálogo. El SQL real y probado está en `db/panel/` (`001_cuentas.sql` de Better Auth y `002_panel.sql` del panel); lo de abajo es el **resumen de la primera versión, escrita para Supabase**. Diferencias con lo real:

- No hay RLS ni `auth.users`: la base no se expone al navegador; solo el servidor consulta y filtra por `negociosDe(usuarioId)` (`lib/panel/sesion.ts`).
- Los usuarios están en la tabla `"user"` de Better Auth (`miembros.usuario_id` es `text`).
- `negocios` tiene `slug` y `tipo` (`agencia` | `pagina-web`; no admite catálogo).
- Variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (no las de Supabase).

El contrato es `content/panel/tipos.ts`. Todo lo que venga de Supabase **debe devolver esas formas** a través de `lib/panel/datos.ts`, así la interfaz no cambia.

---

## 1. Cómo fluye el dato

```
 GA4 Data API ─┐
 Instagram API ─┼─► n8n (cada noche, 2 a. m.) ─► Supabase: metricas_diarias, fuentes_visitas
 Ventas* ───────┘                                      │
                                                       ▼
 Cliente en el panel ─► Supabase (clientes, proyectos, config_sitio) ◄─► Next.js /panel
                                                       │
                                     guardar config ──►└─► revalidar la página del cliente
```
\* Ventas según el cliente (P-3): pedidos registrados en el panel, pedidos de WhatsApp que n8n ya procesa, Shopify o Wompi.

---

## 2. Tablas (Supabase / Postgres)

Todas llevan `negocio_id` y **RLS encendido**. Nombres en español, igual que los tipos.

```sql
-- Negocios: una fila por cliente de Arata San
create table negocios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text not null,
  rubro text,
  ciudad text,
  sitio text,                 -- URL pública
  instagram text,             -- @usuario
  instagram_id text,          -- id de la cuenta business (para la API)
  ga4_propiedad text,         -- "properties/123456789"
  whatsapp text,              -- 57XXXXXXXXXX
  plan text,
  demo boolean not null default false,
  creado timestamptz not null default now()
);

-- Quién puede entrar a qué negocio
create table miembros (
  negocio_id uuid references negocios on delete cascade,
  usuario_id uuid references auth.users on delete cascade,
  rol text not null default 'dueno' check (rol in ('dueno','equipo','arata')),
  primary key (negocio_id, usuario_id)
);

-- Una fila por negocio y día (la llena n8n)
create table metricas_diarias (
  negocio_id uuid references negocios on delete cascade,
  fecha date not null,
  ventas bigint not null default 0,          -- COP
  pedidos int not null default 0,
  visitas int not null default 0,            -- GA4 sessions
  clics_whatsapp int not null default 0,     -- GA4 evento clic_whatsapp
  ig_visualizaciones int not null default 0,
  ig_alcance int not null default 0,
  ig_interacciones int not null default 0,
  ig_seguidores_nuevos int not null default 0,
  actualizado timestamptz not null default now(),
  primary key (negocio_id, fecha)
);

create table fuentes_visitas (
  negocio_id uuid references negocios on delete cascade,
  fecha date not null,
  fuente text not null,                      -- Instagram, Google, Directo, WhatsApp, Facebook…
  visitas int not null,
  primary key (negocio_id, fecha, fuente)
);

create table clientes (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  nombre text not null,
  telefono text not null,
  correo text,
  ciudad text,
  estado text not null default 'nuevo' check (estado in ('nuevo','activo','recurrente','inactivo')),
  origen text check (origen in ('Instagram','Google','WhatsApp','Referido','Página')),
  notas text,
  creado date not null default current_date,
  unique (negocio_id, telefono)
);

create table ventas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  cliente_id uuid references clientes on delete set null,
  producto text not null,
  unidades int not null default 1,
  valor bigint not null,                     -- COP
  canal text check (canal in ('WhatsApp','Página','Instagram','Local')),
  fecha timestamptz not null default now()
);

create table proyectos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  titulo text not null,
  descripcion text,
  fase text not null default 'por-hacer' check (fase in ('por-hacer','diseno','construccion','revision','entregado')),
  responsable text not null default 'Arata San' check (responsable in ('Arata San','Tu equipo')),
  prioridad text not null default 'media' check (prioridad in ('alta','media','baja')),
  fecha_limite date,
  orden int not null default 0
);

create table tareas (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos on delete cascade,
  texto text not null,
  hecha boolean not null default false,
  orden int not null default 0
);

-- Configuración editable del sitio (una fila por negocio) + historial
create table config_sitio (
  negocio_id uuid primary key references negocios on delete cascade,
  datos jsonb not null,                      -- forma de ConfigSitio (tipos.ts)
  actualizado timestamptz not null default now(),
  actualizado_por uuid references auth.users
);
create table config_sitio_versiones (
  id bigint generated always as identity primary key,
  negocio_id uuid not null references negocios on delete cascade,
  datos jsonb not null,
  creado timestamptz not null default now(),
  creado_por uuid references auth.users
);
```

**Vistas calculadas** (no se guardan dos veces):
- `clientes_resumen`: une `clientes` con `ventas` → `compras` (count), `total_comprado` (sum), `ultima_compra` (max). Es lo que llena `Cliente.compras/totalComprado/ultimaCompra`.
- `productos_top_30d`: `ventas` de los últimos 30 días agrupadas por `producto`.

### Seguridad (RLS)

```sql
-- Función de ayuda: ¿el usuario es miembro del negocio?
create function es_miembro(n uuid) returns boolean language sql security definer stable as $$
  select exists (select 1 from miembros where negocio_id = n and usuario_id = auth.uid());
$$;

alter table clientes enable row level security;
create policy "miembros leen y escriben sus clientes" on clientes
  for all using (es_miembro(negocio_id)) with check (es_miembro(negocio_id));
-- Igual para ventas, proyectos, config_sitio, config_sitio_versiones.
-- tareas: using (es_miembro((select negocio_id from proyectos p where p.id = proyecto_id)))
-- metricas_diarias y fuentes_visitas: solo SELECT para miembros; escribe n8n con la service key.
```

- La **service key** de Supabase solo vive en n8n y en variables del servidor. Nunca en el navegador ni en el repo.
- El navegador usa la **publishable key** + la sesión del usuario; RLS hace el resto.

---

### Tablas nuevas (D-119, `010_historial_avisos_ciudades.sql`)

| Tabla | Qué guarda |
|---|---|
| `panel_historial` | Quién (`usuario_id`, `quien`), qué (`accion`, `entidad`, `titulo`), cuándo (`creado`) y qué cambió (`cambios`: campo, antes, después). `proyecto_id`/`cliente_id` sin llave foránea: sobrevive al borrado. `importante` = también se avisa al celular |
| `notificaciones_vistas` | Hasta cuándo vio cada persona sus notificaciones (contador de sin ver) |
| `push_suscripciones` | Un dispositivo por fila (endpoint del navegador + llaves públicas). Se borra sola si el dispositivo ya no acepta avisos |
| `avisos_enviados` | Un aviso de vencimiento por proyecto, tipo y día (no se repite) |
| `paises` | Los 249 países (código ISO y nombre en español) |
| `ciudades` | Ciudades de Colombia (74 principales + las que se agreguen desde el panel), con departamento |
| `clientes.pais`, `clientes.ciudad_id` | Desde las listas. `clientes.correo` y `clientes.ciudad` (texto) quedan sin uso |

## 3. Definición de cada métrica

Escrita para que el número del panel siempre se pueda explicar.

| En el panel | Cálculo | Fuente |
|---|---|---|
| Ventas | Suma de `ventas.valor` en el periodo (COP, sin envío) | Ventas (P-3) |
| Pedidos | Número de filas de `ventas` en el periodo | Ventas |
| Ticket promedio | Ventas ÷ pedidos | Calculado |
| Mejor día | Máximo de ventas de un día en el periodo | Calculado |
| Visitas al sitio | GA4 `sessions` | GA4 Data API |
| Clics a WhatsApp | GA4 `eventCount` del evento `clic_whatsapp` (todos los botones de WhatsApp lo mandan) | GA4 |
| **Clientes que compran** | Pedidos ÷ visitas × 100 ("de cada 100 visitas, X compran") | Calculado |
| Visualizaciones en Instagram | `views` de la cuenta (Instagram Graph API, insights de la cuenta) | Meta |
| Cuentas alcanzadas | `reach` | Meta |
| Interacciones | `total_interactions` | Meta |
| Seguidores nuevos | `follower_count` (cambio diario) | Meta |
| De dónde llegan | GA4 `sessions` por `sessionDefaultChannelGroup` / `sessionSource`, agrupado a Instagram, Google, Directo, WhatsApp, Facebook, Otros | GA4 |
| Variación % | (periodo actual − periodo anterior del mismo largo) ÷ anterior × 100 | Calculado (`lib/panel/formato.ts`) |

> Regla de redondeo: pesos sin decimales; % con 1 decimal y coma (4,7 %). Formato `es-CO`.

---

## 4. Integraciones (flujos de n8n)

| Flujo | Cuándo | Qué hace | Credenciales |
|---|---|---|---|
| `panel-ga4-diario` | 2:00 a. m. | Para cada negocio con `ga4_propiedad`: pide a GA4 Data API (`runReport`) sesiones, evento `clic_whatsapp` y fuentes de **ayer** (y re-pide los últimos 3 días, GA4 consolida tarde). Hace `upsert` en `metricas_diarias` y `fuentes_visitas` | Cuenta de servicio de Google con acceso de lector a cada propiedad |
| `panel-instagram-diario` | 2:15 a. m. | Para cada negocio con `instagram_id`: insights de la cuenta del día. `upsert` en `metricas_diarias` | Token de larga duración de la app de Meta (renovar cada 60 días; el flujo avisa 7 días antes) |
| `panel-ventas` | Al momento | Cuando entra un pedido (WhatsApp/Sara, Shopify, Wompi o registro manual en el panel) inserta en `ventas` y hace `upsert` del cliente por teléfono | Según la fuente |
| `panel-ventas-diario` | 2:30 a. m. | Suma `ventas` de ayer → `metricas_diarias.ventas/pedidos` | Service key |
| `panel-estados-clientes` | 3:00 a. m. | Recalcula `clientes.estado` con las reglas de `01-arquitectura.md` §2.2 | Service key |
| `panel-alerta-fallo` | Si un flujo falla | WhatsApp a Santiago con el negocio y el error | — |

Todos los secretos van en las credenciales de n8n o en `.env` del servidor, **nunca commiteados** (CLAUDE.md §8).

---

## 5. De demo a real: equivalencias

| Hoy (demo) | Mañana (Supabase) |
|---|---|
| `content/panel/demo.ts` → `negocio` | `negocios` del usuario en sesión |
| `dias` (180 días generados) | `select * from metricas_diarias where negocio_id = $1 and fecha >= hoy - 180` |
| `fuentes`, `productosTop` | `fuentes_visitas` (30 días) y vista `productos_top_30d` |
| `ventasRecientes` | `ventas order by fecha desc limit 5` |
| `clientes` | vista `clientes_resumen` |
| `proyectos` | `proyectos` + `tareas` |
| `configSitio` | `config_sitio.datos` |
| `useGuardado` (navegador) | lecturas/escrituras a Supabase (Server Actions o cliente con RLS) |
