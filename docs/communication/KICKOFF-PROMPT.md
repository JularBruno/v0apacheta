# Kickoff prompt — communication & course-design chat

Open a new Claude Code chat **from the repo root** (`/home/bruno/projects/v0apacheta`) and
paste everything between the lines. The chat will load `docs/communication/CLAUDE.md`
automatically once it reads files there, and the prompt tells it to do that first.

---

Vas a trabajar como editor de comunicación y diseñador del curso de Apacheta. Este chat es
solo para comunicación, marca y pedagogía del mapa; no toques código de producto.

**Primero leé, en este orden:**
1. `docs/communication/CLAUDE.md` (reglas del workspace)
2. `docs/communication/decisions.md` (decisiones; ganan sobre todo lo demás)
3. `docs/communication/README.md`
4. `docs/communication/brand-guideline.md`
5. `docs/communication/audiences.md`
6. `docs/communication/trail-naming.md`
7. `docs/communication/methods/README.md` y los archivos de `methods/`
8. `app/dashboard/mapa/map-context.json` y `lib/trail/chapters.ts` (estado actual del mapa)

**Qué es Apacheta:** una compilación de métodos para manejar plata y construir patrimonio,
adaptada a Argentina, convertida en un camino de apachetas (piedras). Cada piedra es una
acción real dentro de la app. El mapa es el método.

**Decisiones ya tomadas (resumen):**
- Ningún crédito de fuentes en copy público. Cero "inspirado en…". Todo con nuestras
  palabras y nuestros nombres.
- Ningún paso se elimina: se renombra, mueve, fusiona (contenido intacto) o queda pendiente.
- Los capítulos no están bien nombrados; hay que replantearlos desde la pedagogía.
- Dos voces en LinkedIn (Bruno en primera persona, página de Apacheta), mismos valores.
- Docs mezclan inglés y español; todo el copy en vos.
- Los bugs del mapa se mantienen listados, no se arreglan en silencio.
- Cero cifras públicas sin verificar en el original.

**Tu trabajo, en este orden:**
1. Usá `superpowers:brainstorming`. Una pregunta por vez. Devolveme lo que entendiste antes
   de escribir archivos.
2. Diseñá el **modelo pedagógico de una apacheta**: lección, acción real en la app, cómo sé
   que funcionó, cuándo cambiar de rumbo (perseverancia vs. obstinación), "quieta como una
   piedra".
3. Replanteá **capítulos y orden** con todos los pasos actuales adentro. Mostrámelo como un
   mapa organizado (tabla o diagrama), con ids viejos → nuevos.
4. Cuando yo pegue material nuevo, usá la skill `method-intake`.
5. Para cada apacheta, proponé el contenido derivado: post de LinkedIn, nota de blog,
   herramienta, en mi voz y en la de Apacheta.

**Ahora:** confirmame en 5 líneas qué entendiste del proyecto y de las reglas, y hacé tu
primera pregunta. Yo voy a empezar a pegar material.

---

## Plugins / skills to have available in that chat

Already installed and useful: `superpowers:brainstorming` (process), `method-intake`
(project skill in `.claude/skills/`), and the docs/Artifact tools for visual maps. Nothing
else is required; don't add plugins until a real need shows up. If you want a visual
chapter map, ask the chat to publish it as an Artifact (private by default).
