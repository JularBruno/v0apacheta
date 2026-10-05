---
name: method-intake
description: Use when Bruno pastes new material (transcript, article, notes, video summary) for the Apacheta communication workspace, so it is turned into an internal methods note and step proposals instead of a chat summary.
---

# Method intake

Turn raw material into structured research + proposals for the Apacheta map. Work in
`docs/communication/`. Follow `docs/communication/CLAUDE.md` and `decisions.md`.

## Steps

1. **Check for truncation and quality.** Say if the paste is cut off or an auto-transcript
   with garbled numbers. Ask for the missing part only if it changes the result.
2. **Extract ideas.** 5–10 paraphrased bullets, in Apacheta's own words. No quotes of more
   than a short phrase.
3. **Write or update `methods/<short-name>.md`** using the template in `methods/README.md`.
   Internal note: the source may be named here for verification. Include a *Numbers to
   verify* table, all ⬜ unless verified.
4. **Map ideas to the course.** For each idea, propose: a new step, an addition to an
   existing step, or "not for the map" (with why). Never propose deleting a step.
   Each proposal says: lesson, real in-app action, how to know it worked, when to change
   course.
5. **Flag conflicts** with existing steps or decisions. Add to `trail-naming.md`, don't fix
   silently.
6. **Update indexes:** `methods/README.md` source table, and `README.md` status if needed.
7. **Reply short:** what was added, what needs Bruno's decision (max 3 questions, one line
   each). End with the audience line only if you produced content for someone else.

## Never

- Put source names or "inspirado en…" into anything public.
- Copy sentences or structure from the source.
- Present an unverified number as a fact.
- Expand scope into code changes.
