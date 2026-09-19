# Landing page brief

The marketing page at `/`. Its job: get **Marcos** ([persona.md](persona.md)) to start the
map. It's also our **design north-star** — whatever tone, type, color, and motion we lock
here, the rest of the product inherits.

## Current state

`app/page.tsx` renders `Header → Hero → About → FAQ` with `Features` and `Footer`
commented out and a Malvinas banner appended. Three palette eras coexist, no font loads,
the logo strobes. We are rebuilding it, not patching it.

## The one message

> **Construí patrimonio, un paso a la vez — aunque la economía esté en contra.**

Lead with the **aspiration** (get ahead, beat inflación, make your money work). Deliver the
reassurance that it starts from wherever Marcos is, with no shaming and no homework.

## Single call to action

**"Comienza tu Camino" → `/onboarding`.** Repeated in the nav, the hero, and a closing
band. Nothing competes with it. No secondary "learn more" button fighting for attention.

## Reference to borrow from

- **Duolingo — the path screen.** The winding trail, locked nodes, one active step, the
  small "why this works" note. This is the structural spine. Hand Figma a screenshot.
- **Headspace / Finch — the calm.** We pull tone from here, not from Duo's loud
  gamification. Muted color, generous whitespace, gentle motion.
- Net: *Duolingo's structure, Headspace's temperament.*

## Show the product

The hero must contain a **visual of the actual trail map** — the single most compelling
asset we have, currently nowhere on the page. Options: render the real `<MapView>` in a
demo state, or a static illustrated version per `app/dashboard/mapa/mapprompt` (hand-drawn
parchment, cairns, Sierras de Córdoba). Decide during design.

## Section structure

1. **Sticky nav** — logo + wordmark, 2–3 anchor links, "Comienza tu Camino" button.
   Minimal, `backdrop-blur`, hairline bottom border.
2. **Hero** — eyebrow, `display` headline (the one message), one line of subtext, the CTA,
   and the trail-map visual. Above the fold on mobile.
3. **Cómo funciona — the trail.** The 5 Capítulos as a small vertical trail reusing the
   real map's cairn/node language. Doubles as product explainer *and* as the bridge that
   makes "start the map" feel like step one of a path already drawn. Titles from
   `map-context.json`:
   1. Conocé el camino — *el primer paso es mirar*
   2. Presupuesto — *dale un nombre a cada peso*
   3. Protección — *construí el escudo antes de escalar*
   4. Lo que enseña el camino — *el interés compuesto no perdona*
   5. Libertad — *la cima*
4. **La realidad argentina.** The differentiator, in plain language: inflación eats
   salaries, the peso loses value, the dólar matters. The local kit — plazo fijo UVA, FCI,
   CEDEARs, dólar MEP — is built in. "Te enseña con esta realidad, no a pesar de ella."
5. **La regla de la abuela.** The credibility layer — `coreRule` + the 5 grandma
   principles, presented calmly. This is Apacheta's "research shows…".
6. **Learn by doing.** One sentence + a small visual: every cairn is a real action inside
   the app, verified automatically. *La lección es la acción.*
7. **FAQ.** Keep the existing content from `components/home/faq.tsx`, restyled to tokens.
8. **Closing CTA band.** The message again, the button again. "Es gratis."
9. **Footer.** Real footer — rebuild `components/home/footer.tsx` off tokens (it currently
   uses `gray-*` / `green-*`). Logo, one line, essential links, © line. No fake social
   icons linking nowhere.

## Constraints

- Mobile-first. Marcos is on his phone.
- Fully Spanish, Argentine, **vos**.
- Every color a token or a named brand scale — see [design-tokens.md](design-tokens.md).
- Manrope, the 5-size type scale, `py-20/28` sections, 2 shadow levels, fade-in on scroll.
- Works in dark mode (tokens already support it).
- No spinning logo. No stock photography. Illustration + type + landscape texture.

## Out of scope

Pricing page, blog, testimonials (we have none yet), account/settings, the dashboard.

## Related

- [persona.md](persona.md) · [brand-voice.md](brand-voice.md) ·
  [design-tokens.md](design-tokens.md) · [map-onboarding-brief.md](map-onboarding-brief.md)
