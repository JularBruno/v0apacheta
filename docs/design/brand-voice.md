# Brand & voice

Source of truth for tone. Distilled from `app/dashboard/mapa/map-context.json`
(`metaphor`, `teachingPhilosophy`, `contentPrinciples`).

## The metaphor

**Apacheta** = a stone cairn left by travelers on the trails of the Sierras Chicas, near
Córdoba. Hikers place a stone on an existing cairn as they pass — an offering, a mark of
progress, a signal to those who follow that the path is real.

In the app, **each milestone is a cairn you build by taking a real financial action.**
Visible proof that you moved forward.

- **The journey:** financial health is a trail through the sierras, not a destination you
  teleport to. Starts on the flat pampa, crosses the Río Suquía, climbs gently through
  rocky granite foothills, reaches the hilltop.
- **Progress is earned** step by step, apacheta by apacheta. You cannot skip ahead.
- **Geography is real:** Córdoba, Argentina. Humid pampa at the foot of the Sierras
  Chicas (~550m). Native scrub: espinillo, algarrobo, molle, tala. Use this texture; don't
  invent dramatic peaks, snow, or cacti.

## Voice

**Calm, honest, direct.** Not motivational-poster language. It acknowledges that
Argentina's economy is hard. It celebrates small wins as real wins.

### Language rules

- Use **vos** (informal Argentine second person). Never *tú*, never *usted*.
- **Direct imperatives:** "Anotá tu ingreso" — not "Te recomendamos que registres tus
  ingresos."
- **No passive voice** in instructions.
- **Short sentences. One idea per sentence.**
- **Name the Argentine reality** by its real words: inflación, peso, dólar, cuotas, plazo
  fijo UVA, FCI, CEDEARs, dólar MEP, ANSES.
- **Human titles, not finance jargon.** "¿Cuánto te queda?" not "Análisis de saldo
  presupuestario disponible."

### No shaming — ever

- Debt is **not** a moral failure. Spending is **not** weakness.
- The map starts from where the user is, not from where they "should have been."
- The tone never lectures. It informs, then points at the next action.

## Teaching philosophy (the credibility layer)

This is Apacheta's version of Duolingo's "research shows…" notes. Surface these as short,
confident credibility lines — never as a wall of theory.

**Core rule:** *Gastá menos de lo que ganás. Todo lo demás es técnica.*

**Grandma principles:**
1. Gastá menos de lo que ganás
2. Dale un nombre a cada peso
3. Gastá en papel antes de gastar en la realidad
4. Enojate con las deudas y las cuotas
5. La gente no se hace rica con tarjetas de crédito ni cuotas

**Baby steps, adapted for Argentina:** initial emergency fund → full 3–6 month fund →
clear all debt → invest 15% → long-term goals → build wealth and give back.

**Learn by doing:** every map step requires a real action in the app. *La lección es la
acción.*

**Progressive unlocking:** you can't skip steps. Understanding compound interest doesn't
help if you don't yet know where your money goes. Cimientos primero.

## Character / mascot — open question

Apacheta has **no mascot** today. The cairn itself is the recurring motif. Options to
decide later: (a) keep the cairn as the "character" — it grows as you progress;
(b) add a quiet trail companion; (c) no character, lean on landscape + typography.
Default assumption for now: **(a)**.

## Logo behavior

The current landing logo cycles through brand colors every 2 seconds
(`components/home/spinning-logo.tsx`). This fights the "calm, not motivational-poster"
tone. Assume we **retire the animation** — static logo, or a single slow transition on
load at most.

## Related

- [persona.md](persona.md) — who we're saying this to
- [design-tokens.md](design-tokens.md) — the visual half of the same personality
