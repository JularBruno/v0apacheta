# Channels

## Phase 1 — LinkedIn (now)

Goal: be **present in the community**, build credibility as a developer who builds and
teaches, and send the first curious people to Apacheta, without the product needing to be
perfect. The site and blog are still being built, so LinkedIn runs ahead of them.

### Two voices, one set of values

| | **Bruno (personal profile)** | **Apacheta (page)** |
|---|---|---|
| Person | First: "estoy armando…", "esto aprendí…" | Brand: imperative to "vos" |
| Topics | How it's built, decisions, mistakes, what I learned from the methods, tools I use | How to use the path, a method explained, a cairn of the week |
| Tone | Honest, technical-but-plain, a bit of humor; a little slang OK | Calm, short, no swagger |
| Role | The main channel. Where people meet a person. | Re-shares Bruno's posts; a home to link to |

Shared: honest, no shaming, vos, no promises, no unverified numbers, no source credit lines.

### Being present in the community (not just posting)

- **Comment before you post.** 3–5 thoughtful comments a day on builders, Argentine fintech
  and personal-finance people. Add substance; don't pitch.
- **Reply to every comment** on your own posts for the first hour.
- **Ask real questions.** "¿Cómo manejan el fondo de emergencia con la inflación?" is a post.
- **Share progress, not perfection.** A screenshot of the trail map mid-build beats a
  polished announcement.

### Post formats (start with these five)

1. **"Lo que aprendí armando X"** — one idea in your own words, the Argentine angle, one
   question. (e.g. "por qué el fondo de emergencia va antes que pagar deudas" and what
   changes with inflación.) No source names.
2. **Build log** — a screenshot/GIF of `/camino` or the map, one decision, one doubt.
3. **Método en una imagen** — the cairn sequence as a simple diagram (ties to the map).
4. **Error honesto** — something that broke or something you got wrong (the naming conflicts
   in this repo are a real example).
5. **Herramienta útil** — a small tool or calculator you built or use, with the link when it
   exists. (Seeds the later `/herramientas` pages.)

### First batch (draft ideas, not written posts)

1. "Estoy armando Apacheta: una compilación de métodos para manejar plata, pensada para
   Argentina." (intro + the benchmark idea + the cairn.)
2. "Por qué el orden importa más que la optimización, y qué cambia en Argentina."
3. "La línea finita entre perseverar y obstinarse" (how you measure it).
4. "Por qué cada paso es una piedra: la lección es la acción." (the map as method, a
   screenshot)
5. "Lo que rompí armando el mapa: 3 errores de naming." (honest build-in-public)

### Rules for every post

- One idea, one ending question or one clear next step.
- No figure unless it's in a *Numbers to verify* table as ✅.
- Own words only, no source credit lines (see [brand-guideline.md §6](brand-guideline.md#6-sources-policy-decided-2026-09-30)).
- No "hacete rico", no promises, no shaming.
- CTA only when something is ready to visit; otherwise ask a question.

### Cadence (proposal, adjust to your real time)

2–3 posts a week, daily commenting. Keep the log in `docs/communication/posts/` once you
start (one file per post: draft, final, link, result).

## Phase 2 — Blog and `/herramientas` (being built)

Follows the SEO rules in `CLAUDE.md` (static, metadata, JSON-LD, registry, "Actualizado el…").
Content comes **out of** the method files:

- One blog post per method idea ("Cómo salir de deudas: bola de nieve vs. avalancha en
  Argentina").
- One tool per calculable idea (snowball vs. avalanche, emergency-fund size, compound
  interest with inflación).
- Economics pages are update-sensitive: every number is verified and dated.

LinkedIn posts become the **hooks**; blog posts become the **depth**; tools become the
**reason to come back**.

## Phase 3 — Landing rewrite

Only after the brand guideline and trail naming are approved: rewrite `HERO`, `CHAPTERS`,
`CLOSING` in `lib/trail/chapters.ts` from [brand-guideline.md §7](brand-guideline.md#7-landing-from-scratch-checklist).

## Open items

- LinkedIn handle/URL of the Apacheta page (does it exist?).
- Link-in-bio target while the landing is not at `/`.
