---
name: meta-ads
description: Operación del Meta Ads CLI (`meta`) ya instalado. Úsalo cuando el usuario quiera listar/crear/actualizar campañas, ad sets, ads, creatives, querys de insights con filtros y breakdowns, o manejar catálogos y datasets de Meta. Incluye recipes (reporte diario de spend/CTR/conversions, crear campaña en PAUSED para A/B, audit de cuenta, automatización con jq) y patrones de output (table/json/plain). Si el CLI aún no está instalado, redirige al skill `meta-ads-setup`. Triggers: "meta ads campaign list/create", "insights de mi cuenta meta", "crear campaña meta", "reporte de ads", "spend de la última semana", "ROAS de campaña X", "crear ad creative", "listar adsets meta".
---

# Meta Ads CLI — Uso operativo

CLI: `meta` (instalado vía `uv tool install meta-ads`). Auth pre-cargada desde `~/.env-meta-ads` (variables `ACCESS_TOKEN` y `AD_ACCOUNT_ID`).

**Si el comando `meta` no existe o `meta auth status` falla, deriva al skill `meta-ads-setup` antes de continuar.**

---

## Cheatsheet de comandos

```bash
# Auth
meta auth status

# Listing
meta ads adaccount list
meta ads page list
meta ads campaign list
meta ads adset list
meta ads ad list
meta ads creative list

# Insights (reads)
meta ads insights get --date-preset last_7d --fields spend,impressions,clicks,ctr,cpc
meta ads insights get --campaign_id <ID> --date-preset last_30d --fields spend,conversions,roas
meta ads insights get --breakdowns age,gender --date-preset last_7d

# Crear (todo se crea PAUSED por default)
meta ads campaign create --name "..." --objective OUTCOME_SALES --daily-budget 5000
meta ads adset create <CAMPAIGN_ID> --name "..." --optimization-goal LINK_CLICKS --billing-event IMPRESSIONS --bid-amount 500 --targeting-countries US
meta ads creative create --name "..." --page-id <PAGE_ID> --image ./img.jpg --body "..." --title "..." --link-url "..." --call-to-action SHOP_NOW
meta ads ad create <ADSET_ID> --name "..." --creative-id <CREATIVE_ID>

# Activar
meta ads campaign update <ID> --status ACTIVE
meta ads adset update <ID> --status ACTIVE
meta ads ad update <ID> --status ACTIVE

# Catálogos
meta ads catalog create --name "..."
meta ads product-item create --catalog-id <ID> --retailer-id <SKU> --name "..." --url "..." --price "999" --currency USD --image-url "..."
meta ads product-set list --catalog-id <ID>

# Datasets (pixels)
meta ads dataset create --name "..."
meta ads dataset connect <DATASET_ID> --ad-account-id <AD_ACC_ID> --catalog-id <CATALOG_ID>
```

**Notas**:
- Budgets en **centavos de la moneda** del ad account (`5000` = `$50.00`)
- Bid amounts también en centavos
- IDs de ad account siempre con prefijo `act_`
- Output formats globales: `-o table` (default, humano), `-o json` (para `jq`), `-o plain` (para `awk/cut/sort`)
- Modo no interactivo: `--no-input --force` (para CI/scripts)

---

## Recipes comunes

### 1. Reporte de los últimos 7 días (resumen de cuenta)

```bash
meta ads insights get --date-preset last_7d \
  --fields spend,impressions,clicks,ctr,cpc,actions
```

Para parsear con jq:
```bash
meta ads insights get -o json --date-preset last_7d \
  --fields spend,impressions,ctr | jq '.[0]'
```

### 2. Reporte por campaña (spend + ROAS, top performers)

```bash
meta ads campaign list -o json --fields id,name,status | \
  jq -r '.[] | select(.status=="ACTIVE") | .id' | \
  while read id; do
    echo "=== $id ==="
    meta ads insights get --campaign_id "$id" --date-preset last_30d \
      --fields name,spend,purchase_roas,conversions
  done
```

### 3. Crear campaña + adset + creative + ad (queda en PAUSED)

```bash
# 1) Campaign
CAMPAIGN_ID=$(meta ads campaign create -o plain \
  --name "Test - PAUSED" --objective OUTCOME_TRAFFIC --daily-budget 1000 \
  | awk '{print $1}')

# 2) AdSet
ADSET_ID=$(meta ads adset create "$CAMPAIGN_ID" -o plain \
  --name "Test AdSet" --optimization-goal LINK_CLICKS \
  --billing-event IMPRESSIONS --bid-amount 200 \
  --targeting-countries US | awk '{print $1}')

# 3) Creative (necesita PAGE_ID — obtener con `meta ads page list`)
CREATIVE_ID=$(meta ads creative create -o plain \
  --name "Test Creative" --page-id <PAGE_ID> \
  --image ./hero.jpg --body "Headline" --title "CTA" \
  --link-url "https://example.com" --call-to-action SHOP_NOW \
  | awk '{print $1}')

# 4) Ad (queda PAUSED — listo para revisar antes de activar)
meta ads ad create "$ADSET_ID" --name "Test Ad" --creative-id "$CREATIVE_ID"
```

### 4. Audit rápido: campañas activas con bajo CTR

```bash
meta ads insights get -o json --date-preset last_14d \
  --fields campaign_name,spend,ctr,impressions \
  --level campaign | \
  jq '[.[] | select((.ctr | tonumber) < 1.0 and (.spend | tonumber) > 50)]'
```

### 5. Pausar una campaña

```bash
meta ads campaign update <CAMPAIGN_ID> --status PAUSED
```

### 6. Breakdown demográfico

```bash
meta ads insights get --date-preset last_30d \
  --breakdowns age,gender \
  --fields spend,impressions,ctr,conversions
```

Otros breakdowns útiles: `country`, `region`, `publisher_platform`, `platform_position`, `device_platform`, `placement`.

---

## Objetivos (`--objective`) más usados

| Objective | Cuándo usarlo |
|---|---|
| `OUTCOME_TRAFFIC` | Llevar gente al sitio (clicks) |
| `OUTCOME_AWARENESS` | Reach / brand recall |
| `OUTCOME_ENGAGEMENT` | Interacciones, comments, follows |
| `OUTCOME_LEADS` | Form leads (Lead Ads) |
| `OUTCOME_SALES` | Conversiones de compra (requiere Pixel) |
| `OUTCOME_APP_PROMOTION` | Instalaciones / engagement de app |

## Optimization goals comunes (`--optimization-goal`)

`LINK_CLICKS`, `LANDING_PAGE_VIEWS`, `IMPRESSIONS`, `REACH`, `OFFSITE_CONVERSIONS`, `LEAD_GENERATION`, `THRUPLAY` (video), `POST_ENGAGEMENT`.

## Calls to action válidos (`--call-to-action`)

`SHOP_NOW`, `LEARN_MORE`, `SIGN_UP`, `DOWNLOAD`, `BOOK_TRAVEL`, `CONTACT_US`, `GET_QUOTE`, `SUBSCRIBE`, `APPLY_NOW`, `WATCH_MORE`.

---

## Output formats

```bash
# Tabla legible (default)
meta ads campaign list

# JSON para jq / scripts
meta ads campaign list -o json

# Tab-separated para awk/cut/sort
meta ads campaign list -o plain
```

Flag global. Va antes del subcomando: `meta -o json ads campaign list`.

---

## Tips de automatización

- **Cron de reportes**: combinar `meta ads insights get -o json` con un script Python/Bun que pivotee y mande a Slack/Notion/Discord
- **Suspender campañas que pasen un threshold**: `meta ads campaign list -o json | jq` filter por CPA/spend → loop con `meta ads campaign update --status PAUSED`
- **Idempotencia**: chequear si un nombre de campaña ya existe antes de crear (`campaign list` + grep) para evitar duplicados en runs repetidos
- **Logs**: agregar `--debug` para troubleshooting (imprime el HTTP request al endpoint de Meta)
- **CI/CD**: usar `--no-input --force` para suprimir prompts interactivos. Exit codes: 0 = ok, 3 = auth, 4 = API error, 1 = generic

---

## Gotchas frecuentes

| Síntoma | Causa | Fix |
|---|---|---|
| `(#200) Permissions error` al crear ads | Falta `pages_manage_ads` o el system user no tiene control sobre la Page | Verificar permisos en Business Suite → Páginas → asignación |
| `Bid amount must be at least X` | Bid muy bajo para el optimization goal/país | Subir `--bid-amount` (recordar: en centavos) |
| Campaña creada sin error pero no aparece en Ads Manager | Filtro de UI por status — está en PAUSED | Cambiar filtro a "All" o activar con `--status ACTIVE` |
| `Invalid parameter` en insights | Field name mal escrito o no aplicable al level | Ver lista de fields válidos por level (account/campaign/adset/ad) |
| `--targeting-countries US` no funciona | Versión vieja del CLI o flag mal escrito | `meta --version` debe ser >= 1.0.1 |
| Insights vacíos en cuenta nueva | No hay tráfico todavía / fechas fuera de rango | Sanity-check con `--date-preset maximum` |

---

## Referencia: documentación oficial

- CLI: [Meta Ads CLI docs](https://developers.facebook.com/docs/marketing-api/ads-cli)
- Marketing API: [Marketing API reference](https://developers.facebook.com/docs/marketing-api)
- Targeting specs: `meta ads targeting search --query "..."` para encontrar interest IDs

Si el usuario pregunta por un comando exacto que no esté aquí, sugerir `meta ads <recurso> --help` para ver flags disponibles.
