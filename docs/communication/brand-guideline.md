# Apacheta — brand guideline

The first setup file. If you had to build a landing (or a post, or a blog page) from scratch
with only this file, you should be able to. Visual tokens live in
[`docs/design/design-tokens.md`](../design/design-tokens.md); this file is the message.

## 1. What Apacheta is

**Apacheta is a compilation of the best methods for handling money and building wealth,
reworked for Argentina and turned into a path you walk inside an app.**

- **Compilation:** we benchmarked what works (see [methods/](methods/README.md)) and put it
  in one place, in order. We didn't invent personal finance; we curate and sequence it.
- **Reworked for Argentina:** inflación, peso, dólar, cuotas, plazo fijo UVA, FCI, CEDEARs,
  dólar MEP, ANSES. Methods made for the US are translated, not pasted.
- **A path, not a course:** each step is a **cairn (apacheta)** you place by doing a real
  action in the app. *La lección es la acción.* The map is the method.

### Name and metaphor

An *apacheta* is a stone cairn travelers leave on the trails of the Sierras Cordobesas: an
offering, a mark of progress, a sign for whoever comes next that the path is real. Córdoba is
the real geography: pampa → Río Suquía → sierras → cima. Native scrub only (espinillo,
algarrobo, molle, tala). 

## 2. The one message

> **Seguí el camino para salir de deudas, ahorrar más y construir patrimonio.**

Supporting line (aspiration, for Marcos): *Construí patrimonio, un paso a la vez — aunque la
economía esté en contra.*

Supporting line (credibility, for the builder/peer): *Los mejores métodos, juntos, en orden y
adaptados a Argentina.*

Rule: one message per surface, never all three at once. The hero leads with the aspiration,
the "how it works" section with the compilation, the blog/LinkedIn with whichever the post is
about.

## 3. Pillars (what we can say and prove)

| Pillar | Claim | Proof / where it lives |
|---|---|---|
| **Compilación curada** | Los mejores métodos, en un solo lugar y en orden. | Internal research in [methods/](methods/README.md) (not shown publicly) |
| **Hecho para Argentina** | Te enseña con esta realidad, no a pesar de ella. | Local kit built in: UVA, FCI, CEDEARs, MEP |
| **El camino es el método** | Cada piedra es una acción real, verificada en la app. | The map, `map-context.json` |
| **Quieta como una piedra** | La constancia le gana a la ansiedad. Ni apurarse ni abandonar. | Persever-vs-obstinate framing ([audiences.md](audiences.md)) |
| **Sin vergüenza** | Empezás desde donde estás. | Voice rules below |

"Quieta como una piedra" is the personality: a cairn doesn't rush and doesn't move. It stays,
and you add one more stone.

## 4. Positioning (who we are vs. what's out there)

- **Not a bank** (cold, forms) and **not a guru** (humo, "si querés podés").
- **Not a course** (homework) and **not a tracker alone** (Excel with extra steps).
- **Duolingo's structure, Headspace's temperament** (from the landing brief): a visible path
  with one active step, told calmly.
- Against *humo*: we cite sources, we show the trade-offs, we say when something is risky and
  when we don't know.

## 5. Voice

**Calm, honest, direct.** Same values everywhere; the register changes by channel.

### Always
- **Vos**, never tú or usted. **Comenzá, Anotá, Seguí, Empezá, Mirá.** (Not *Comienza*,
  *Anota*, *Sigue*.)
- **Imperatives, active voice, short sentences, one idea per sentence.**
- **Name the Argentine reality with its real words.**
- **Human titles, not jargon.** "¿Cuánto te queda?" not "Análisis de saldo disponible".
- **Informar, después señalar el próximo paso.** Never lecture.

### Never
- Shame about debt or spending. Debt is not a moral failure.
- Promise returns. No "hacete rico", no "libertad en X meses".
- Motivational-poster language ("¡Vos podés!", "el éxito te espera").
- Stock finance phrases ("te recomendamos que registres…").
- Quote a number we haven't verified against its original source.

### Register by channel

| Channel | Who speaks | Register |
|---|---|---|
| Landing, app, `/camino` | Apacheta | Third-person-free, imperative to "vos". Calm, brand voice. |
| Blog, `/herramientas` | Apacheta | Explanatory, sourced, "Actualizado el…". Same vos. |
| LinkedIn — **Bruno's profile** | Bruno (first person) | "Estoy armando…", "esto aprendí…". Developer + builder tone, build in public, honest about mistakes. |
| LinkedIn — **Apacheta page** | Apacheta | Brand voice, shorter, re-shares Bruno's posts. |

Bruno's voice and the brand voice share values (honest, no shaming, vos, sources). They differ
in person (yo vs. vos) and topics (how it's built vs. how to use it). Details in
[channels.md](channels.md).

## 6. Sources policy (decided 2026-09-30)

**No "inspirado en…" or source credit lines in any public copy** (landing, map, blog,
LinkedIn, posts). That wording is removed everywhere and must not come back.

1. **Everything public is written in Apacheta's own words**, with our own names
   (*apachetas*, *el camino*, our step titles) and Argentine examples. Never reuse another
   method's brand words (e.g. "Baby Steps").
2. **Never copy text, structure or examples verbatim** from a source.
3. **Numbers still need a verified original** before use, because accuracy matters even when
   we don't name anyone. The verification trail lives only in the internal
   [methods/](methods/README.md) research notes, which are **not public copy**.
4. **What is ours:** the selection, the order, the Argentine adaptation, and turning each idea
   into a verified action (the map).

## 7. Landing-from-scratch checklist

A landing built from this file has, in this order:

1. **Hero:** the aspiration line + the one CTA ("Comenzá tu camino") + a visual of the trail.
2. **The compilation:** "Los mejores métodos, juntos, en orden", told calmly, in our own words.
3. **Cómo funciona:** the trail, 5 chapters, names from [trail-naming.md](trail-naming.md).
4. **Hecho para Argentina:** inflación, peso, dólar, the local kit.
5. **La regla de la abuela:** *Gastá menos de lo que ganás. Todo lo demás es técnica.*
6. **La lección es la acción:** each cairn = a real action, verified.
7. **FAQ**, **closing CTA** ("Tu primera piedra te espera."), **footer**.

One CTA, repeated; nothing competes with it. Mobile-first. No stock photos. Illustration,
type and landscape only.

## 8. Visual summary (see tokens for detail)

- **Palette:** Coffee Bean (ink), Muted Teal (action/progress), Burnt Peach (spending/warmth),
  Berry Crush (destructive only), Ash Grey (calm surfaces).
- **Type:** Manrope. **Feel:** parchment map, hand-drawn cairns, Sierras de Córdoba.
- **Mascot:** none for now; the cairn is the character and it grows as you progress. Possible
  later: **Ceibo**, Bruno's dog (idea only, not decided, not in any copy yet).

## Open items

- Decide the final public name for the method (*"el camino de Apacheta"*? *"las 5 etapas"*?).
- Add the Magnín ideas to the map (see [methods/](methods/README.md)) and fix naming
  conflicts ([trail-naming.md](trail-naming.md)).
- `docs/design/landing-brief.md` still says "Comienza tu Camino" (tú) and "no parallax";
  update after this file is approved.
- Footer/legal line for disclaimers ("no es asesoramiento financiero"), wording to decide.
- **Chapters and steps are being replanned** (see [trail-naming.md](trail-naming.md)); the
  five-chapter structure above is provisional.
