# Design tokens

Human-readable version of `tailwind.config.ts` + `app/globals.css`, plus the proposed
additions we haven't implemented yet. Hand this to Figma to seed styles/variables.

Legend: ✅ already in code · 🔶 proposed, not yet in code

## Color — brand palette ✅

Named: **Coffee Bean** (ink) / **Muted Teal** (primary) / **Burnt Peach** (spending) /
**Berry Crush** (destructive) / **Ash Grey** (surfaces).

| Role | Name | Hex (DEFAULT) | Notes |
|---|---|---|---|
| Primary / CTAs | Muted Teal | `#7aafa7` | hover `#5d9990` (500), `#477871` (600). Text on top = Coffee Bean. |
| Ink / body text / sidebar | Coffee Bean | `#1b0e13` | Near-black with a plum cast. |
| Spending / accent / "warm" storytelling | Burnt Peach | `#cb7352` | 500 `#cb7352`, 600 `#aa5c3e`. |
| Destructive only — delete, cancel, errors | Berry Crush | `#aa4465` | Never use for anything non-destructive. |
| Muted surfaces & borders | Ash Grey | `#9db9b8` | Soft teal-grey. |

Each has a full 50–900 scale in `tailwind.config.ts`.

### Color meaning (enforce this)

- **Teal = action / progress / income.** The only "click me" color.
- **Peach = money leaving / spending / gentle warning.** Storytelling warmth.
- **Berry = destructive.** Delete, irreversible, error. Nothing else.
- **Coffee Bean = text & structure.**
- **Ash Grey / background = calm.** Most of the page is quiet.

## Color — semantic tokens ✅

Defined as HSL CSS variables in `app/globals.css`, light + `.dark`. Approx light values:

| Token | Light | Meaning |
|---|---|---|
| `--background` | `#f4f8f7` (178 15% 97%) | page ground |
| `--foreground` | `#1b0e13` (337 32% 8%) | body text |
| `--card` / `--popover` | `#ffffff` | raised surfaces |
| `--primary` | `#7aafa7` (171 25% 58%) | CTAs |
| `--secondary` | `#e8efee` (178 17% 92%) | quiet surface |
| `--muted-foreground` | `#5b4a52` (337 20% 38%) | labels, secondary text |
| `--accent` | `#cb7352` (16 54% 56%) | spending / expenses |
| `--destructive` | `#aa4465` (341 43% 47%) | errors, delete |
| `--border` | `#c9d9d7` (178 17% 82%) | hairlines |
| `--ring` | `#7aafa7` | focus ring |

Dark mode inverts to a Coffee-Bean ground (`337 32% 6%`) with teal-tinted text.

**Rule: never use raw Tailwind colors (`gray-*`, `green-*`, `teal-600`, `bg-white`).**
Always a token or a named brand scale. The current dashboard and `components/home/footer.tsx`
violate this — treat that as debt to clean up.

### Chart colors ✅

`--chart-1` teal (income) · `--chart-2` peach (expenses) · `--chart-3` berry (warnings) ·
`--chart-4` ash grey · `--chart-5` medium coffee.

## Typography 🔶

**Current state is broken:** `app/globals.css` declares `Inter`, `app/page.tsx` uses a
`font-manrope` class that is never defined, and `app/layout.tsx` loads **no font** via
`next/font`. Everything renders in a system fallback.

**Proposed:** one typeface — **Manrope** (calm geometric sans, already the intent) — loaded
via `next/font` in `app/layout.tsx`, exposed as `--font-sans`.

Fallback stack: `Manrope, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`

### Type scale 🔶 (5 sizes — do not add more)

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `display` | 3rem → 3.75rem (mobile → desktop) / 1.05 | 700 | hero headline only |
| `h2` | 1.875rem → 2.25rem / 1.15 | 700 | section titles |
| `h3` | 1.25rem / 1.3 | 600 | card titles, step titles |
| `body` | 1rem, long-form 1.125rem / 1.6 | 400 | paragraphs |
| `small` | 0.875rem / 1.4 | 500 | labels, captions, eyebrows |

Eyebrow style: `small`, weight 700, `uppercase`, `tracking-widest`, in `--primary` or
`--accent`. (Already used in `about.tsx` / `faq.tsx` — formalize it.)

## Spacing & layout 🔶

- Base unit: **4px** (Tailwind default).
- Section vertical padding: `py-20` mobile / `py-28` desktop.
- Content container: `max-w-6xl` (landing), `max-w-4xl` for text-heavy sections (FAQ).
- Gutter: `px-4 sm:px-6 lg:px-8`.
- Card padding: `p-6` mobile / `p-8` desktop.

## Radius ✅

`--radius: 0.75rem` (12px). Tailwind maps `lg = radius`, `md = radius - 2px`,
`sm = radius - 4px`. Cards/dialogs use `rounded-2xl` (16px) in the map components — pick
one: **`rounded-xl` (12px) for inputs/buttons, `rounded-2xl` (16px) for cards/sheets.**

## Elevation 🔶 (2 levels max)

- **`shadow-sm`** — resting cards, FAQ items.
- **`shadow-xl`** — the active/focused thing (step card, modal, hero product shot).
- One border color (`--border`). No mid-tier shadows, no colored shadows.

## Motion 🔶

- Scroll-in: fade + 8px rise, ~300ms, ease-out. Once, not on every re-enter.
- Hover: color/opacity only, 150ms.
- No parallax, no auto-playing loops. The spinning logo is retired.
- Map: the "player" cairn advancing along the trail is the one place motion is allowed to
  be expressive.

## Known config bug

`safelist` is nested inside `theme` in `tailwind.config.ts`. It belongs at the **top
level**. Currently the safelist does nothing and it confuses Tailwind IntelliSense.

## Related

- [brand-voice.md](brand-voice.md) · [landing-brief.md](landing-brief.md)
