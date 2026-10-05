# Brief for the next chat — design the method map

Paste this (or point Claude at this file) to start a fresh chat focused on the **method
design**: turning the compilation into a pedagogic path of cairns.

---

## Goal

Design the Apacheta **map as a method**: an ordered set of chapters and cairns (steps), each
with a **lesson, a real action in the app, a validation rule, and an internal source note**. Output
is a spec Bruno approves, then an implementation plan. No code in this chat until the spec is
approved.

## Read first (in order)

1. `docs/communication/README.md`
2. `docs/communication/brand-guideline.md`
3. `docs/communication/audiences.md`
4. `docs/communication/methods/README.md` + the three source files
5. `docs/communication/trail-naming.md`
6. `app/dashboard/mapa/map-context.json` (current content, validation types, unlock rules)
7. `lib/trail/chapters.ts` (landing chapters)

## Already decided

- The map is the method; each step is a cairn placed by a real action ("la lección es la
  acción").
- Order of fundamentals follows Ramsey's logic, reworked for Argentina.
- Voice: vos, calm, honest, no shaming, no promises.
- Persona adds: perseverance vs. obstinacy, "quieta como una piedra", the path really leads
  to wealth.
- No source credits in public copy; everything in our own words and names.
- No number goes public until verified at the original. First we design the method and the
  *information each step must contain*; then we verify numbers for the ideas that survive.

## To design in this chat

1. **The pedagogic model of a cairn.** What every step contains (lesson, why, action, how to
   know it worked, numbers-to-verify, "when to stop / change course").
2. **Sequence.** Resolve: teach-before-act (3.5 before 3.4); full fund vs. debt order;
   where the Magnín ideas land (risk ladder, avoid ruin, benchmark, ikigai, concentration);
   where "dar" lives.
3. **Perseverance vs. obstinacy as a built-in mechanic.** A metric the user can see, and a
   review point that allows "esto no funciona, cambiá" without shame.
4. **Information per step** (the data the map needs to show: sources, verified figures with
   "as of" date, Argentine tools named).
5. **Naming.** Finish the decisions in `trail-naming.md`.
6. **Map → content pipeline.** How each cairn feeds a blog post, a tool and a LinkedIn post.

## Constraints

- Map currently stores progress in localStorage per `stepId`; unlocking logic is in
  `map-context.json` (`unlockLogicPrinciples`). Changing order means changing unlock rules.
- Dashboard `mapa` and `/camino` share `lib/trail/chapters.ts`; keep them in sync.
- Blog/tools pages follow the SEO rules in the root `CLAUDE.md`.

## Open questions for Bruno

- Are chapters 4–5 actually content we can teach credibly now, or placeholders to label as
  "próximamente"?
- Do we keep 5 chapters or split/merge?
- (Closed) Quoting/credit policy: decided, see `../decisions.md` D1.
- Is there a legal/disclaimer line needed ("no es asesoramiento financiero")?
