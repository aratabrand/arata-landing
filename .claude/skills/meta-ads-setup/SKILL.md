---
name: meta-ads-setup
description: Guía interactiva de instalación end-to-end del Meta Ads CLI desde cero. Úsalo cuando el usuario quiera instalar, configurar o "setup" el CLI de Meta para anuncios (`meta-ads`, `pip install meta-ads`, `uv tool install meta-ads`). Cubre verificación de Python, instalación del paquete, creación de System User en Meta Business Suite, Ad Account, asignación de Page, creación de App en developers.facebook.com, generación de token con scopes correctos, guardado seguro de credenciales y persistencia en shell. Diseñado para usuarios sin experiencia previa con Meta Marketing API — espera screenshots en momentos clave y maneja troubleshooting de errores comunes. Triggers: "instalar meta ads", "configurar meta-ads cli", "set up meta ads", "how to install meta-ads", "tutorial meta ads cli", "configurar ads cli desde cero".
---

# Meta Ads CLI — Guía de Instalación

Esta skill guía al usuario, paso a paso, desde cero hasta tener el CLI `meta` autenticado y listo para operar campañas de Meta. **No avances al siguiente paso sin verificar que el actual quedó bien** — pide screenshot cuando el paso involucre la UI de Meta.

## Filosofía

- **Tono cercano, paciente, en español** (la audiencia puede no haber tocado nunca developers.facebook.com).
- **Una instrucción a la vez**, no listas de 10 pasos juntas.
- **Verifica con screenshot** cada vez que el usuario navegue UI de Meta — los layouts cambian y los nombres en español/inglés varían.
- **No pegues el access token al chat** después de guardarlo — escríbelo directo a archivo con permisos 600.

---

## Fase 1 — Pre-flight check (terminal local)

Antes de tocar Meta, valida el entorno del usuario:

```bash
python3 --version    # necesita >= 3.12
which uv             # idealmente uv instalado; si no, usar pip3
pip3 --version       # fallback
```

**Si Python < 3.12**:
- macOS: `brew install python@3.12` o sugerir `python.org` instaladores
- Windows: descargar de python.org
- Linux: `apt install python3.12` o equivalente

**Si no tiene uv**: instalarlo con `curl -LsSf https://astral.sh/uv/install.sh | sh` (recomendado) o usar pip3 directo. uv es más limpio porque aísla el CLI.

---

## Fase 2 — Instalar el CLI

```bash
uv tool install meta-ads
# o si no tiene uv:
pip3 install meta-ads
```

**Verificar**:
```bash
meta --version    # debe mostrar "meta, version 1.x.x"
meta --help       # debe mostrar comandos `ads` y `auth`
```

Si `meta` no se encuentra después de instalar con uv, el directorio `~/.local/bin` no está en `PATH`. Sugerir: `uv tool update-shell` o agregar `export PATH="$HOME/.local/bin:$PATH"` a `.zshrc`/`.bashrc`.

---

## Fase 3 — Meta Business Suite (UI)

> ⚠️ Cada sub-paso requiere screenshot del usuario para verificar.

### 3.1 — Acceder al Business Portfolio

Pedir que vaya a [business.facebook.com](https://business.facebook.com) y entre a **Configuración → Información del negocio**.

**Si no tiene un Business Portfolio**:
- Click en "Crear negocio" en el selector
- Nombre: idealmente el nombre comercial real (ej: dominio sin `.com`, nombre de marca)
- Email: el de contacto del negocio

**Si tiene varios**: elegir el correcto. El que tenga su Page de Facebook ya asignada es el indicado.

### 3.2 — Crear System User

En Configuración: **Usuarios → Usuarios del sistema → + Agregar**.

- **Nombre**: `ads-cli` o `meta-ads-cli` — **NO usar espacios** (Meta lo rechaza con error genérico "nombre no válido")
- **Rol**: **Admin** (no "Empleado", el CLI necesita admin)

Después de crearlo, anota el ID que aparece (ej: `61588841560660`).

### 3.3 — Verificar/crear Ad Account

En el sidebar: **Cuentas → Cuentas publicitarias**.

**Caso A: Vacío** (lo más común para usuarios nuevos):
- Click **+ Agregar → Crear una cuenta publicitaria nueva**
- Nombre: ej. "Horizontes IA Ads", "Mi Marca Ads"
- Zona horaria: la del usuario
- Moneda: **USD** recomendado (más fácil para clientes internacionales). MXN/EUR/etc si solo va a operar local
- ⚠️ Advertir al usuario: **una vez creada no se puede sacar del portfolio** (es permanente)
- **No requiere método de pago** todavía — pueden crear/listar campañas en PAUSED sin tarjeta

**Caso B: Ya hay una cuenta**: usarla. Verificar que esté asignada al system user.

### 3.4 — Asignar el system user a la Ad Account

Click en la cuenta publicitaria recién creada → **Asignar acceso**:
- Buscar `ads-cli`
- Permisos: **Control total** (todos los toggles en azul)
- Confirmar

Verificar: en la lista de "Personas con control total" debe aparecer `ads-cli`.

### 3.5 — Asignar Page al system user

En **Cuentas → Páginas**:
- Si no tiene Page: tiene que crear una en Facebook primero (afuera del Business Suite). Pausa el setup ahí.
- Si la tiene: click en la Page → **Asignar acceso** → buscar `ads-cli` → **Control total**

La Page es necesaria para crear ad creatives (todo anuncio se publica desde una Page).

### 3.6 — (Opcional) Pixel/Dataset y Catalog

Si el usuario va a usar conversion tracking o catalog ads, asignar también:
- **Orígenes de datos** → Dataset/Pixel → Asignar al system user
- **Cuentas → Catálogos** → Asignar al system user

Si no sabe qué son, saltar — no es bloqueante.

---

## Fase 4 — Meta for Developers (App)

### 4.1 — Crear App

Pedir que vaya a [developers.facebook.com/apps](https://developers.facebook.com/apps) y click **Create App**.

- **Nombre de la app**: ej. "Mi Negocio Ads CLI" (es interno, no se ve en ads)
- **Email**: el suyo
- **Caso de uso**: seleccionar **"Other"** (la primera ronda muestra presets — ignorarlos, click en "Other")
- **Tipo de app**: **Business**
- **Portfolio comercial**: seleccionar el que crearon en Fase 3.1

### 4.2 — Agregar caso de uso "Marketing API"

Después de crear, va a aparecer un modal/pantalla de "Agregar casos de uso":

- En "Destacados", marcar SOLO **"Crear y administrar anuncios con la API de marketing"**
- Las otras (Threads, Instant Games, FB Login, WhatsApp) NO marcarlas — agregan complejidad innecesaria
- Confirmar

### 4.3 — Asignar la app al System User

> 🚨 Esto es contraintuitivo. NO se hace desde "Roles de la app" en el panel de developers — eso es solo para usuarios personales de Facebook.

Volver a **Business Suite → Configuración → Cuentas → Apps**:
- Buscar la app recién creada
- Click → **Asignar acceso**
- Buscar el system user `ads-cli`
- Permisos: **Administrar app** o **Control total**
- Confirmar

---

## Fase 5 — Generar el token

Volver a **Configuración → Usuarios del sistema → ads-cli** → click **Generar token**.

- **App**: seleccionar la app que acaban de crear
- **Caducidad**: **Nunca** (system user tokens no necesitan rotación; si rota, se rompe el CLI silenciosamente)
- **Permisos / scopes**:
  - ✅ `business_management`
  - ✅ `ads_management`
  - ✅ `ads_read`
  - ✅ `pages_show_list`
  - ✅ `pages_read_engagement`
  - ✅ `pages_manage_ads`
  - ✅ `catalog_management` (solo si va a usar catálogos)
  - `read_insights` — si NO aparece en la lista, saltar; `ads_read` ya cubre insights de campañas

- Click **Generar token**
- **El token se muestra una sola vez**. Que lo copien inmediatamente.

---

## Fase 6 — Guardar credenciales (sin exponerlas)

> 🛡️ NO pegues el token al chat después de este punto. Escríbelo directo al archivo con el tool Write y borra cualquier referencia.

Crear `~/.env-meta-ads` con:

```
ACCESS_TOKEN=<el token que copiaron>
AD_ACCOUNT_ID=act_<numérico de la ad account>
```

**Nota crítica sobre AD_ACCOUNT_ID**:
- El ID se obtiene de Business Suite (sección Cuentas publicitarias) o con `meta ads adaccount list` después de cargar el token
- **Siempre prefijar con `act_`** — sin el prefijo, varios comandos del CLI fallan
- En screenshots de Business Suite el ID puede aparecer truncado — confirmar con `meta ads adaccount list` antes de guardar definitivo

Permisos:
```bash
chmod 600 ~/.env-meta-ads
```

---

## Fase 7 — Persistencia en shell

Auto-cargar las credenciales en cada terminal nueva. Detectar el shell activo:

```bash
echo $SHELL    # usualmente /bin/zsh en Mac, /bin/bash en Linux
```

**Para zsh** (`~/.zshrc`):
```bash
[ -f ~/.env-meta-ads ] && set -a && source ~/.env-meta-ads && set +a
```

**Para bash** (`~/.bashrc` o `~/.bash_profile`):
mismo snippet, mismo comportamiento.

Apéndalo al final del archivo (no sobrescribir):

```bash
printf '\n# Meta Ads CLI - auto-load credentials\n[ -f ~/.env-meta-ads ] && set -a && source ~/.env-meta-ads && set +a\n' >> ~/.zshrc
```

⚠️ **Antes de hacer esto, advertir al usuario**: las credenciales quedan disponibles en cualquier shell del sistema. Si comparte máquina o usa agentes que abren shells, considerar carga manual (`source ~/.env-meta-ads`) en lugar de auto-load.

---

## Fase 8 — Validación final

En una terminal nueva (o tras `source ~/.zshrc`):

```bash
meta auth status
# Esperado: "Authenticated (token: EAA...)"

meta ads adaccount list
# Esperado: tabla con la ad account creada en Fase 3.3

meta ads page list
# Esperado: tabla con la(s) Page(s) asignadas

meta ads campaign list
# Esperado: "No results." si la cuenta es nueva — eso es OK
```

Si todos responden, el setup está completo. Resumir al usuario:

- ✅ CLI instalado: `meta` v1.x
- ✅ Credenciales: `~/.env-meta-ads` (chmod 600)
- ✅ Auto-load: `~/.zshrc`
- ✅ Ad Account: `act_xxxxx`
- ✅ Page: nombre y ID

Sugerir paso siguiente: **"si quieres ahora generar reportes o crear campañas, invoca el skill `/meta-ads`"**.

---

## Troubleshooting (errores frecuentes)

| Síntoma | Causa | Fix |
|---|---|---|
| `meta: command not found` después de instalar | `~/.local/bin` no está en PATH | `uv tool update-shell` o agregar manual al `.zshrc` |
| "Elegiste un nombre de usuario del sistema no válido" | El nombre tiene espacios o chars inválidos | Usar `ads-cli` (kebab-case) o `adscli` |
| Token funciona pero `campaign list` da error 100 / API | Falta `ads_management` o `ads_read` en scopes | Regenerar token con scopes completos |
| `(#200) The user must be a system user...` | App no asignada al system user | Volver a Fase 4.3 — asignar app desde Apps en Business Suite |
| `(#190) Invalid OAuth access token` | Token revocado o expirado | Regenerar (Fase 5) — verificar que se eligió "Nunca" |
| `act_XXX not found` o "permission denied on ad account" | System user no asignado a ad account | Fase 3.4 — verificar control total |
| AD_ACCOUNT_ID truncado / cuentas no encontradas | Copiaste mal el ID del screenshot | `meta ads adaccount list` para obtener ID correcto |
| `meta auth status` dice "Not authenticated" pese a `.env` correcto | El shell no cargó el archivo | `source ~/.env-meta-ads` manual; verificar línea en `.zshrc` |

---

## Resumen para el usuario al terminar

Después del setup, el usuario tiene:

1. **CLI funcional**: `meta ads <subcomando>` desde cualquier terminal
2. **Sistema user permanente**: el token no expira, pero se puede revocar desde Business Suite si es comprometido
3. **Aislamiento del Business Portfolio**: el system user tiene permisos solo sobre los assets que se le asignaron — no sobre el resto de Facebook del usuario

Mencionar el skill complementario `/meta-ads` para uso operativo.
