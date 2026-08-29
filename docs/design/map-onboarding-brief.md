# Map onboarding brief

The real payoff. Marcos's first ten minutes after signup. Condensed from
`app/dashboard/mapa/map-context.json` — read that file for the full step list.

## The core idea

**Onboarding and the map are the same experience.** Signup collects the minimum
(name, email, password), then drops Marcos directly onto the trail at step **1.0 —
"Primera Apacheta"**. The map's step card *is* the onboarding UI, and it's the reusable
component every later step uses.

The current `app/onboarding/page.tsx` is a separate 6-step form (name → 3 scored quiz
questions → generic message → email/password) that never connects to the map. The quiz
only sets notification frequency. **Assume we fold signup into the map and drop or
relocate the quiz** (a short, optional "¿dónde estás hoy?" could live as an early step
that sets the starting cairn instead of just a notification cadence).

## The map metaphor in UI terms

From `map-context.json` → `designPrinciples`:

- **The map is a path, not a to-do list.** Visual metaphor: a mountain trail. A single
  winding line connecting cairns from the pampa (bottom) to the hilltop (top).
- **The current step is the hero** — most prominent, most detailed, clearest app
  instruction.
- **Future steps are mystery** — title + icon only, no full content. Curiosity motivates.
- **Completed steps are memory** — visible but de-emphasized. Apachetas already placed.
- **Mobile-first.** The step card feels like a guide, not a document.
- **No infinite scroll.** One step at a time with context of where you are on the whole
  trail — not a vertical dump of every step.

Illustration direction for the trail art: `app/dashboard/mapa/mapprompt` — hand-drawn
parchment (Binding of Isaac world-map feel), rocky granite Sierras Chicas, Río Suquía,
cairns in three sizes, dark-red dashed path, completed/active/locked states.

## Step-card anatomy (the reusable component)

Every step in `map-context.json` carries the same fields — the card renders them the same
way every time (see `components/map/step-card.tsx`):

| Field | Role in the card |
|---|---|
| `type` | `major` (main milestone) · `minor` (sub-step) · `chapter` (concept close) — drives size/emphasis |
| `level` / `stepId` | small eyebrow: "Paso 1.1.2" |
| `title` | human title, no jargon — `h3` |
| `description` | one line: what you'll understand or do |
| `longDescription` | the actual lesson — short paragraphs, "ver más" to expand |
| `appInstruction` | exactly what to do in the app, with the nav path |
| `teachingConcepts` | optional — the economics covered, as calm credibility bullets |
| `validation` | how completion is checked (see below) — drives the button(s) |

### Validation types → button behavior

- `api` — checked automatically against the user's real data. Card shows progress, no
  manual button. ("5 movimientos registrados: 3/5")
- `acknowledged` — conceptual step. One button: **"Entendido, siguiente apacheta"**.
- `api_or_acknowledged` / `acknowledged_or_api` — auto-check, or an escape-hatch button
  ("No tengo deudas, continuar").
- `pwa_or_acknowledged` — push subscription detected, or a skip button.
- `children_completed` — parent step; completes when all sub-steps are done.
- `api_and_acknowledged` — both required.

Progress is stored per `stepId` in `localStorage` first, migratable to API.

## The 5 chapters (what Marcos sees waiting)

| # | Chapter | Tagline | App features |
|---|---|---|---|
| 1 | Conocé el camino | El primer paso es mirar. | inicio |
| 2 | Presupuesto — Gestiona tus recursos | Dale un nombre a cada peso antes de gastarlo. | presupuesto, historial |
| 3 | Protección — Antes de crecer, protegerse | Construí el escudo. Después escalá. | patrimonio, seguidor-ahorro |
| 4 | Lo que enseña el camino | El interés compuesto no perdona. | patrimonio, seguidor-ahorro |
| 5 | Libertad — La cima | Construí lo que dura. | patrimonio, seguidor-ahorro, presupuesto |

Chapters 1–3 are fundamentals. **4–5 are the aspiration** — investing, long-term planning,
retirement, financial freedom. Marcos must be able to see them (locked, mysterious) from
his very first session. That visible-path-ahead is what keeps him from bouncing.

## First-session flow (steps 1.0 → 1.2)

1. **1.0 Primera Apacheta** (`major`) — "Bienvenido al camino. Acá empieza todo." Install
   the PWA + enable notifications. Validation: push subscription exists, or "Ya lo hice".
2. **1.1 Empezá a registrar** (`major`, `children_completed`) — parent of 1.1.1–1.1.3.
3. **1.1.1 Conocé el Centro de Ayuda** (`minor`, `acknowledged`) — where to get unstuck.
4. **1.1.2 Anotá tu balance** (`minor`, `api`) — first income movement, or import from
   Excel, or just the current bank balance.
5. **1.1.3 Seguí registrando** (`minor`, `api`) — log 5 expense movements. The habit
   starts here.
6. **1.2 Gastá menos de lo que ganás** (`chapter`, `acknowledged`) — the grandma rule.
   Close of Capítulo 1.

## Onboarding design goals

- Marcos reaches a **first real action within ~2 minutes** of signup (log one movement).
- He **sees the full trail** — all 5 chapters — before he does anything.
- No screen is text-dense. One idea, one action, one button.
- The tone is [brand-voice.md](brand-voice.md): calm, vos, direct, no shaming, small wins
  are real wins.
- Every celebration is proportional: "Apacheta colocada" — not confetti and trumpets.

## Related

- [persona.md](persona.md) · [brand-voice.md](brand-voice.md) ·
  [design-tokens.md](design-tokens.md) · [landing-brief.md](landing-brief.md)
- Full step data: `app/dashboard/mapa/map-context.json`
- Current components: `components/map/` (`map-view`, `step-card`, `step-node`, `trail-path`)
