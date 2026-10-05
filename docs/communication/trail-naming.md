# Trail naming — canonical map

One list of chapter and step names, in vos, that every surface uses. Source today is
`app/dashboard/mapa/map-context.json` (full content) and `lib/trail/chapters.ts` (landing).
This file **proposes** the canonical names and lists conflicts. Nothing here is in code yet.

Legend: ✅ keep · ✏️ rename proposed · ⚠️ conflict/bug · ➕ missing (from [methods/](methods/README.md))

## The chapters (agreed 2026-09-30, copy still draft)

Each chapter has three parts: a **place on the trail** (small label above the title, replaces
"Capítulo N"), an **action title** in vos (max 5 words), and a **bajada** (one line). Details of
the naming system are in [decisions.md](decisions.md) D13.

| # | Place | Title | Bajada | Landing desc (draft, one line) | Replaces |
|---|---|---|---|---|---|
| 1 | Al pie del camino | **Sabé dónde estás parado** | Sacá la brújula: tus números dicen dónde estás. | Cargás lo que entra, lo que gastás, lo que tenés y lo que debés. Conocés la app entera y por dónde sigue tu ruta. | "Conocé el camino" |
| 2 | La huella | **Cada peso, en su lugar** | Marcá el rumbo antes de gastar. | Decidís en papel, antes de que arranque el mes, adónde va tu plata. | "Presupuesto" |
| 3 (ruta B only) | El vado | **Cruzá las deudas de a una** | Una piedra por vez, sin apuro. | Ordenás tus deudas y las cruzás de a una, a tu ritmo y sin culpa. | part of "Protección" (3.2, 3.4, 3.5) |
| 3 | La aguada | **Llená la cantimplora** | Un colchón para cuando no llueva. | Armás un fondo de emergencia para que un imprevisto no te mande a cero. | "Protección" |
| 4 | La cuesta | **Despacio, pero sin parar** | El interés compuesto no perdona, ni a favor ni en contra. | Ahorrás e invertís de a poco, mes a mes, y aprendés cuánta caída aguantás. | "Lo que enseña el camino" |
| 5 | La cumbre | **Construí lo que dura** | Desde arriba, elegís. | Diversificás, pensás en tu retiro y en qué querés construir. | "La cima" / "Libertad" |

Notes:
- **Chapter 1 place ("Al pie del camino") is assumed:** Bruno picked the title "Sabé dónde estás
  parado" and didn't confirm the place label.
- **Order of 3 (El vado) vs. 3 (La aguada) is open:** whether debts come before or after the full
  emergency fund. It changes numbering, not titles. See [decisions.md](decisions.md) Open.
- **"La cima" is kept** as the name of the last apacheta (5.3) and of the summit scenery.
- Bajadas and descs are drafts: no numbers, no promises, check again before they reach any page.

### Previous chapter names (superseded, kept for old → new tracking)

| # | Title | Tagline |
|---|---|---|
| 1 | Conocé el camino (`map-context` had "Conoce") | El primer paso es mirar. |
| 2 | Presupuesto | Dale un nombre a cada peso. |
| 3 | Protección | Construí el escudo. Después escalá. |
| 4 | Lo que enseña el camino | El interés compuesto no perdona, ni a favor ni en contra. |
| 5 | La cima ("Libertad — La cima" in `map-context`) | Libertad: tus activos cubren tu vida. |

## Steps

### Capítulo 1 — Conocé el camino
| Step | Current name | Status / proposal |
|---|---|---|
| 1.0 | Primera Apacheta | ✅ |
| 1.1 | Empezá a registrar | ⚠️ description is a placeholder: "El que no sabe guardar es pobre aunque etc." |
| 1.1.1 | Conocé el Centro de Ayuda | ⚠️ `1.1.2` prereq says `user.balance !== 0 (1.1.1 completo)`: wrong step reference |
| 1.1.2 | Anotá tu balance | ✅ |
| 1.1.3 | Seguí registrando | ✅ (+ ➕ perseverance-vs-obstinacy: "¿cómo sabés que funciona?") |
| 1.1.4 | — | ⚠️ referenced by `1.1` and `apiDataNeeded`, **does not exist** |
| 1.2 | Gastá menos de lo que ganás | ✅ la regla de la abuela |

### Capítulo 2 — Presupuesto
| Step | Current name | Status / proposal |
|---|---|---|
| 2.0 | Hacé un presupuesto | ✅ |
| 2.1 | Dale un nombre a cada peso | ✅ |
| 2.2 | Sabé cuánto te queda | ✅ |
| 2.3 | "HOLA HICE HASTA ACA ESPERAME Revisá tu historial" | ⚠️ **stray note in the title.** Fix to "Revisá tu historial" |
| 2.4 | Gastá en papel antes que en la realidad | ✅ |

### Capítulo 3 — Protección
| Step | Current name | Status / proposal |
|---|---|---|
| 3.0 | Conocé tu patrimonio | ✅ |
| 3.1 | Fondo de emergencia inicial | ✅ Ramsey step 1 |
| 3.2 | ¿Tenés deudas? | ✅ |
| 3.3 | Fondo de emergencia completo | ⚠️ order: Ramsey does debt *before* the full fund; map has 3.3 before 3.4 |
| 3.4 | Liquidá tus deudas | ✅ Ramsey step 2 |
| 3.5 | Cómo salir de la deuda | ⚠️ **teaches after acting**; move before 3.4 |
| 3.6 | Métodos para ahorrar | ✅ |

### Capítulo 4 — Lo que enseña el camino
| Step | Current name | Status / proposal |
|---|---|---|
| 4.0 | El secreto que pocos aplican | ✏️ "humo"-adjacent; consider "El interés compuesto" |
| 4.1 | Invertí el 15% de tus ingresos | ✅ Ramsey step 4 |
| 4.2 | Planeá 5 años adelante | ✅ |
| 4.3 | Mejorá tu calidad de vida con intención | ✅ |
| ➕ | Risk ladder / "¿cuánta caída aguantás?" | from Magnín *premio de emprender* |
| ➕ | "Que nada te deje en la lona" (avoid ruin) | from Magnín *pensar en grande* |

### Capítulo 5 — La cima
| Step | Current name | Status / proposal |
|---|---|---|
| 5.0 | Construí tu portafolio | ✅ (+ ➕ concentration risk) |
| 5.1 | Ahorrá para emprender | ✏️ could become "Elegí qué construir" (ikigai / circle of competence) |
| 5.2 | Tu fondo de retiro | ✅ |
| 5.3 | La cima | ⚠️ "aportá a los demás" has no action; Ramsey's step 7 (give) → tie to `/donaciones` |

## Conflicts between files

| Where | Says | Should say |
|---|---|---|
| `docs/design/landing-brief.md` | "Comienza tu Camino" | "Comenzá tu camino" (vos) |
| `map-context.json` stage-1 | "Conoce el camino" | "Conocé el camino" |
| `map-context.json` stage-5 | "Libertad — La cima" | pick one |
| `landing-brief.md` ch. 5 | "Libertad — la cima" | pick one |
| `design-tokens.md` | "no parallax" | not a message issue; decide separately |

## Conflicts found at intake (2026-09-30, not fixed)

| Where | Says | Issue |
|---|---|---|
| `map-context.json` 1.1.2 prereq | `user.balance !== 0` | Fails for someone whose real balance is zero. Adds to the wrong-step-reference bug above. |
| `map-context.json` 1.1.3 validation | 5 or more `expense` movements in total | Can be done in one sitting; doesn't test the habit it teaches. |
| `map-context.json` stage-4 principle vs. 4.1 | 25% saved / 25% of that invested vs. "invertí el 15%" | Two different percentages, both unverified. Decide which lever each one names. |
| `map-context.json` 3.2 vs. route branching | Debt question sits in Ch. 3 | The route forks on debt (D10); the question is needed at the end of Ch. 1. Decision pending. |
| `map-context.json` `grandmaPrinciples` #4 "Enojate con las deudas y las cuotas" vs. no-shaming rule | Anger at debt | Fine if aimed at the mechanism (cuotas, interest); reads as shame if aimed at the person. Needs a wording decision, and the principle has no apacheta yet. |
| `brand-guideline.md` §1 | "No snow, no cacti, no dramatic peaks" line removed (2026-09-30 16:03, by Bruno) | Not a conflict; noted so the scenery rule's removal is on record. Trailing space left on the line above. |

## Naming rules

1. Titles are human, in vos, max ~5 words, no jargon.
2. A step title names the **action or the insight**, never the feature ("Dale un nombre a cada
   peso", not "Configurar categorías").
3. One canonical name per step; landing, app, blog and posts quote it verbatim.
4. A step that teaches comes **before** the step that acts on it.

## Decisions needed from Bruno

1. Ch. 5 title: **"La cima"** or **"Libertad"**?
2. Ch. 4 title: keep "Lo que enseña el camino" or rename?
3. Move 3.5 before 3.4 (and the full fund after debt, as Ramsey)? This changes unlocking
   logic, so it belongs in the method-design chat.
