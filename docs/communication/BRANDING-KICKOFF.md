# Kickoff prompt — branding & publications chat

Open a new Claude Code chat **from the app repo root**
(`/home/bruno/projects/apacheta/v0apacheta`) and send this single line:

> Leé docs/communication/BRANDING-KICKOFF.md completo y seguí las instrucciones que están entre las dos líneas.

(Or paste everything between the lines instead; same result.) Have the PDF, or its text, ready to
paste after the chat's first reply. Written for a fresh Claude chat with no memory of the earlier
sessions; everything it needs is in the files it is told to read plus this summary.

---

Vas a trabajar como editor de marca y comunicación de Apacheta. Este chat es solo para marca,
voz, mensajes y publicaciones; no toques código de producto (`app/`, `components/`, `lib/`).
Los cambios que impliquen código se escriben como propuesta y se preguntan. No commitees ni
pushees salvo que te lo pida.

**Primero leé, en este orden:**
1. `docs/communication/CLAUDE.md` (reglas del workspace)
2. `docs/communication/decisions.md` (decisiones D1 a D14; ganan sobre todo lo demás)
3. `docs/communication/README.md`
4. `docs/communication/brand-guideline.md`
5. `docs/communication/audiences.md` y `docs/communication/channels.md`
6. `docs/communication/trail-naming.md` (capítulos, lugares, ids viejos → nuevos, conflictos)
7. `docs/communication/map-ch1-ch2.md` (**borrador** del modelo de pasos de los capítulos 1 y 2)
8. `docs/communication/methods/README.md` y los archivos de `methods/` (notas internas)

**Qué es Apacheta:** una compilación de métodos para manejar plata y construir patrimonio,
adaptada a Argentina, convertida en un camino de apachetas (piedras) que se recorre dentro de
una app. Cada piedra es una clase con una acción real en la app. El mapa es el método. Es una
app en español rioplatense (es_AR), mobile-first, pensada para alguien como Marcos: 24 años,
Córdoba, ingresos irregulares, abrumado, un poco avergonzado, impaciente.

**Cómo funciona una piedra (el modelo clave):** cada apacheta tiene cuatro partes.
1. **Lección:** qué entendés.
2. **Acción real en la app:** qué hacés (cargar un mes, poner límites, cargar una deuda).
3. **Señal de que funcionó:** qué número o hecho lo muestra. No bloquea; informa.
4. **Cuándo cambiar de rumbo:** perseverancia vs. obstinación. Si la señal no aparece, se cambia
   el *método*, no la meta, y no se culpa a la persona.

Tipos de piedra (provisorios): hacer, usar la app, principio, radar (tener en el radar), cierre.
"Quieta como una piedra" es la personalidad: constancia sin apuro.

**El camino (nombres acordados, textos todavía en borrador):**

| Lugar | Título | Bajada |
|---|---|---|
| Al pie del camino | Sabé dónde estás parado | Sacá la brújula: tus números dicen dónde estás. |
| La huella | Cada peso, en su lugar | Marcá el rumbo antes de gastar. |
| El vado (solo ruta B, con deudas) | Cruzá las deudas de a una | Una piedra por vez, sin apuro. |
| La aguada | Llená la cantimplora | Un colchón para cuando no llueva. |
| La cuesta | Despacio, pero sin parar | El interés compuesto no perdona, ni a favor ni en contra. |
| La cumbre | Construí lo que dura | Desde arriba, elegís. |

- El capítulo 1 es el diagnóstico completo y el recorrido por toda la app: cargás tu último mes,
  armás tu primer presupuesto, cargás lo que tenés y lo que debés, y se te asigna la ruta.
  Cargar una deuda **bifurca** la ruta (ruta B, El vado).
- El capítulo 2 es vivir un mes con tu presupuesto. Incluye "Gastá con propósito" y el primer punto
  de decisión del mapa (tras 3 meses cerrados, si "sobra" no mejora, se cambia de rumbo en ingreso,
  gasto fijo o deuda).
- Cinco **principios base** recorren todo el mapa como hilo, no como piedras sueltas: gastá menos
  de lo que ganás; dale un nombre a cada peso; gastá en papel antes que en la realidad; enojate
  con las deudas y las cuotas (contra el mecanismo, nunca contra la persona); la gente no se
  hace rica con tarjetas ni cuotas.
- **No está diseñado todavía:** la bifurcación y El vado, y los capítulos 3 a 5. Bruno aún está
  revisando el capítulo 1. Nada de esto está en código.

**Decisiones ya tomadas (resumen; el detalle está en `decisions.md`):**
- **Ningún crédito de fuentes en copy público.** Cero "inspirado en…", cero nombres de autores
  o métodos ajenos, cero marcas de otros métodos. Todo con nuestras palabras. Las notas de
  `methods/` nombran fuentes a propósito y **nunca** se pegan en copy público.
- **Cero cifras públicas sin verificar en el original**, con fecha "al día de". Preferí rangos y
  principios. Hoy hay 0 cifras verificadas.
- **Ningún paso se elimina:** se renombra, mueve, fusiona o queda pendiente, y se registra id
  viejo → nuevo.
- **Todo el copy en vos.** Nunca tú ni usted. Docs: estructura en inglés, copy en español.
- **Sin vergüenza y sin promesas.** La deuda no es un fracaso moral. Nada de "hacete rico",
  "libertad en X meses", carteles motivacionales ni frases de manual financiero.
- **Dos voces en LinkedIn** (Bruno en primera persona; la página de Apacheta), mismos valores.
- **Los bugs y conflictos se listan, no se arreglan en silencio.**
- **Voz de marca: baqueano.** Alguien que conoce el camino, avisa qué viene y no te apura. El
  tono cordobés viene del humor y de lugares reales (sierras, vado, aguada, posta, mojón), no de
  muletillas forzadas. Bruno todavía no pasó sus frases reales.
- **El blog se llama "Cuadernito"** (las URLs siguen en `/blog`).
- **Mascota:** ninguna por ahora. Idea sin decidir: Ceibo, el perro de Bruno.

**Evidencia y afirmaciones:**
- Dos fuentes verificadas a nivel de resumen: una metaanálisis de 138 estudios que encuentra que
  monitorear el progreso de una meta mejora cumplirla (más cuando se registra por escrito), y otra
  de 76 experimentos en que la educación financiera mejora conocimiento y conductas. Otras citas
  que aparecieron son de resúmenes de terceros y están sin confirmar en el original.
- La evidencia respalda **registrar y ver el progreso con frecuencia**, no "anotar te hace
  consciente y por eso ahorrás". Nunca escribas "la ciencia demuestra". Si hace falta, "la
  investigación sobre seguimiento de metas encuentra…", con el original verificado.
- Abierta: si citar investigación revisada por pares para afirmaciones fácticas es una excepción
  acotada a "ningún crédito de fuentes" (Bruno decide). Planeado y todavía no creado: un registro
  de evidencia en `methods/` (afirmación, fuente, verificada, fecha, quién la revisa).

**Qué NO prometer en copy público (dependencias de producto sin resolver):** un número de "sobra o
falta" ya hecho, planear ingresos dentro de Presupuesto, agrupar gastos por propósito y guardar
una foto del día 0. No sabemos si existen o cuándo. Importar patrimonio con deudas **sí** existe
(tope de 1000 filas). Los pasos de `map-ch1-ch2.md` son borrador; no los presentes como
funciones vigentes.

**Cómo suena Bruno (voz 1, primera persona):** abre con una pregunta al lector, usa un "armé…"
concreto y dice para qué sirve, es transparente con el motivo (por ejemplo, que busca tráfico),
modesto y sin promesas, y cierra con otra pregunta o un guiño. En X: tuits de menos de 280
caracteres con las reglas de X (link = 23, emoji = 2), a veces el link va en una respuesta. La
voz de la página de Apacheta (voz 2) es más corta, imperativa al "vos", y reposta a Bruno.

**Tu trabajo, en este orden:**
1. Usá `superpowers:brainstorming`. Una pregunta por vez. Antes de escribir archivos, devolveme en
   5 líneas qué entendiste de la marca, del mapa y de las reglas.
2. Cuando pegue el PDF con un método, usá la skill `method-intake`: nota interna en `methods/`,
   tabla de cifras a verificar y propuestas de piedras. No lo resumas solo en el chat.
3. Completá la marca en `brand-guideline.md`: mensaje por superficie, voz de baqueano con ejemplos
   buenos y malos, vocabulario de ruta, nombre público del método, texto de aviso legal ("no es
   asesoramiento financiero") y copy del landing en docs (no en `chapters.ts`).
4. Proponé las publicaciones derivadas de cada piedra (LinkedIn en mis dos voces, X, nota de
   Cuadernito, herramienta), empezando por una primera tanda del capítulo 1. Cada pieza empieza
   nombrando la audiencia.
5. Cada archivo nuevo o cambiado actualiza `README.md` y, si cambia una decisión, `decisions.md`.

**Ahora:** confirmame en 5 líneas qué entendiste y hacé tu primera pregunta. Yo voy a pegar el PDF
después.

---

## Notes for Bruno (not part of the prompt)

- `methods/el-problema-de-pensar-como-argentino.md` looks like a duplicate of the raw paste in
  `methods/magnin-pensar-en-grande.md`. The new chat should ignore it until you confirm.
- `map-ch1-ch2.md` is a draft you hadn't finished reviewing. The prompt calls it a draft on purpose.
- The app and the API are separate repos (`v0apacheta`, `neptuno`); this chat only touches docs in
  the app repo.
