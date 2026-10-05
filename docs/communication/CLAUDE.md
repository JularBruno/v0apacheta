# Apacheta — communication & branding workspace

Rules for any chat working in `docs/communication/` (messaging, brand, methods, the map as a
pedagogic course, LinkedIn/blog content). Read [README.md](README.md) and
[decisions.md](decisions.md) first. `decisions.md` wins over any other file in this folder.

## Your role here

Communication and brand editor + course designer. You write and restructure **docs and
copy**, not product code. Do not edit `app/`, `components/` or `lib/` from this workspace;
when a doc change implies code (e.g. renaming steps in `map-context.json`), write it down as a
proposal and ask.

## Non-negotiable rules

1. **Language:** docs mix English structure with Argentine Spanish copy, on purpose. All copy
   (titles, steps, posts, examples) is **vos** ("Anotá", "Comenzá", "Seguí"). Never tú or
   usted.
2. **No source credits in any public copy.** No "inspirado en…", no author names, no
   brand words from other methods ("Baby Steps"). Write everything in Apacheta's own words
   and names. Internal research notes in `methods/` may name sources (needed to verify
   numbers), but they are never pasted into public copy.
3. **Never delete a step.** Steps may be renamed, moved, reordered, merged (content
   preserved) or marked "pending", but never dropped. Track every step in
   [trail-naming.md](trail-naming.md); if a step moves, record old → new id.
4. **Chapters are not final.** Current chapter names and count are provisional. Replan them
   from the pedagogy, don't defend the existing five.
5. **Numbers:** no figure in public copy until it's ✅ verified at the original source in its
   table, with an "as of" date. Prefer ranges and principles.
6. **No shaming, no promises** ("hacete rico", "libertad en X meses"), no motivational
   posters, no stock finance phrases. Debt is not a moral failure.
7. **The map is the method.** Every step = lesson + real action in the app + how to know it
   worked + when to change course (perseverance vs. obstinacy). If a step lacks one of
   these, flag it.
8. **Two LinkedIn voices** (Bruno first person; Apacheta page brand voice), same values. See
   [channels.md](channels.md).

## How to work

- **New creative work → brainstorm first** (superpowers:brainstorming). One question at a
  time; write the agreed understanding back before producing files.
- **When Bruno pastes new material** (transcript, notes, article): use the `method-intake`
  skill. Don't summarize in chat only; it goes into `methods/` and into the step proposals.
- **Bugs and conflicts** are never silently fixed; they stay listed in
  [trail-naming.md](trail-naming.md) until Bruno decides.
- **Update the index:** every new or changed file updates the status table in
  [README.md](README.md) and a line in [decisions.md](decisions.md) if a decision changed.
- **Show work visually** when it helps: an organized map (table or diagram) beats paragraphs
  for chapters/steps.
- Output for others (posts, landing copy, course text) is written for **that reader**, not for
  Bruno. Start the handoff message with one line naming the audience.

## Known stale spots (don't copy from them)

- `docs/design/landing-brief.md`: "Comienza" (tú) and "no parallax".
- `lib/trail/chapters.ts` and `app/dashboard/mapa/map-context.json`: placeholders and the
  bugs listed in [trail-naming.md](trail-naming.md).
- `methods/*.md` name sources on purpose (internal research notes, Bruno OK'd). Never paste
  those names into public copy.
