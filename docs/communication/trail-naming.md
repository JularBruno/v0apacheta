# Trail naming — canonical map

One list of chapter and step names, in vos, that every surface uses. Source today is
`app/dashboard/mapa/map-context.json` (full content) and `lib/trail/chapters.ts` (landing).
This file **proposes** the canonical names and lists conflicts. Nothing here is in code yet.

Legend: ✅ keep · ✏️ rename proposed · ⚠️ conflict/bug · ➕ missing (from [methods/](methods/README.md))

## The five chapters

| # | Canonical title | Tagline | Landing desc (one line) | Notes |
|---|---|---|---|---|
| 1 | **Conocé el camino** | El primer paso es mirar. | Anotás cada peso que entra y sale. En un mes tenés un mapa real de tu plata. | ⚠️ `map-context` has "Conoce" (tú) |
| 2 | **Presupuesto** | Dale un nombre a cada peso. | Decidís en papel, antes de que empiece el mes, en qué importa gastar. | ✅ |
| 3 | **Protección** | Construí el escudo. Después escalá. | Fondo de emergencia primero. Salir de deudas después. | ✅ |
| 4 | **Lo que enseña el camino** | El interés compuesto no perdona, ni a favor ni en contra. | Plazo fijo UVA, FCI, CEDEARs, dólar MEP. Ahorrás e invertís, mes a mes. | ✏️ title is vague; consider "Hacer crecer tu plata" |
| 5 | **La cima** | Libertad: tus activos cubren tu vida. | El trabajo pasa a ser una elección, no una obligación. | ⚠️ `map-context` says "Libertad — La cima"; decide one |

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
