# The fork — "El vado" (draft v2, 2026-10-25)

How the trail splits for people with debts, what each side does, how they come back together, and
what the map has to show. Same step model as [map-ch1-ch2.md](map-ch1-ch2.md): lesson, real action
in the app, signal, when to change course. What the app and API need for it is in
[product-requirements-debts.md](product-requirements-debts.md). Every figure used here is graded in
[methods/evidence-register.md](methods/evidence-register.md).

**Status: draft for Bruno's review.** Nothing is in code. Chapter 1 is still under review.

## What changed since draft v1 (Bruno's feedback, 2026-10-25)

1. **"Con deudas"** means a recorded *pasivo* with a balance still to pay. A truck recorded only as
   an *activo* is not a debt. Its loan is.
2. **El vado has one stone for the paying**, not one per debt: "Limpiá tus deudas", with two exits
   (all clean, or "sigo por mi cuenta").
3. **The route is kept as a string reference inside the step.** No storage design now.
4. **The achievement is to leave the red:** no pasivo with a balance to pay and, along the way, a
   net worth that isn't negative. The "total doesn't rise" baseline is also a string in the step.
5. **Both routes aim at a colchón.** Route A builds it deeper and faster; route B keeps feeding a
   small one while crossing.
6. **Debt data (rate, cuotas, due date) is planned, not assumed.** See the requirements file.
7. **Numbers:** every old figure was dropped or regraded in the evidence register.

## The idea in one paragraph

One trail, two ways across the same river. Everyone ends at the same aguada, so neither route is
better or worse. With no debts you cross by the bridge; with debts, by the vado: stepping stones,
one at a time. The map never says "route with debts". Debt is not a moral failure, and the fork
must read as terrain, not as a verdict.

## Palabras del patrimonio (to teach before the fork)

Chapter 1 loads *activos* and *pasivos* before anyone has been told what they are. Proposed lesson
for 1.7 and 1.8 (**not applied**, chapter 1 is still being reviewed):

- **Activo:** lo que tenés y vale plata. Ahorros, dólares, inversiones, una camioneta, una casa.
- **Pasivo:** lo que debés. Tarjeta, préstamo, cuotas. "Pasivo" es otra forma de decir deuda.
- **Patrimonio neto:** lo que tenés menos lo que debés.
- **La camioneta es un activo.** Si la estás pagando en cuotas, lo que te falta pagar es un pasivo.
  Anotar la camioneta sin su préstamo muestra un patrimonio más alto que el real.
- A note on the vocabulary: it's common to hear that a car is a "pasivo" because it costs money to
  keep. That's a different use of the word. In the app *activo* means what you have and *pasivo*
  what you owe, so that the net-worth sum works. The lesson should say so in one line.

In the UI the type label could read "Pasivo (deuda)" so the two words travel together.

## The fork

| Question | Proposal |
|---|---|
| **Where is it decided?** | Stone 1.8 "Lo que debés". The only decision point. |
| **What counts as "con deudas"?** | At least one pasivo with a balance to pay above zero. Things recorded only as activos don't count. |
| **Who decides?** | The app suggests ("Tu camino va por el vado. ¿Seguimos así?") and the person confirms. |
| **Where is the choice kept?** | As a string reference in the step. How it is stored is a later requirement. |
| **Reversible?** | Yes, any time, both ways. |
| **User-facing names** | "Por el puente" and "Por el vado". "Ruta A/B" are internal. |

## The two routes

```
Both:    1 Sabé dónde estás parado  →  2 Cada peso, en su lugar
                                            │
            por el puente (sin deudas)      │      por el vado (con deudas)
                                            │
Route A:  A.1 Por si aparece una deuda      │  Route B:  3.1 Tu colchón mínimo
          3.1 Tu colchón mínimo             │            V.1 Lo que cuesta deber
          3.2 ¿Cuánto es suficiente?        │            V.2 Elegí cómo cruzar
          3.3 ¿Dónde guardarlo?             │            V.3 Frená la deuda nueva
          3.4 Pagate primero (a fondo)      │            V.4 Limpiá tus deudas
          3.5 Usalo y rellenalo             │            3.2 ¿Cuánto es suficiente? … 3.5
                                            ▼
Both:    La cuesta  →  La cumbre
```

- On route B the aguada is visited twice: a small first fill before the vado (3.1), and the rest
  after it. Step ids stay put; only the order differs per route.
- **Default entry** is after chapter 2: the budget frees the money that pays the debt. The list is
  a single ordered array, so moving the start is cheap.

## Route B: El vado

Teach before act (naming rule 4): V.1 and V.2 come before V.4.

| # | Title | Type | Lesson | Action in the app | Signal it worked | Change course |
|---|---|---|---|---|---|---|
| 3.1 | Tu colchón mínimo | hacer | Un mínimo líquido para que un imprevisto no te devuelva al crédito. Es un escudo, no una inversión. | Patrimonio → nuevo activo "Fondo de emergencia inicial" con lo que tengas separado. | Un activo cargado con ese fin. | Si no llegás a juntarlo en un mes, empezá con lo que haya. No frena el camino. |
| V.1 | Lo que cuesta deber | principio | La deuda de consumo crece sola. La **TNA** es la tasa anunciada; la **TEA** suma el efecto de pagar interés sobre interés; el **CFT** suma además comisiones, seguros e impuestos. Las cuotas "sin interés" no son gratis: el costo está en el precio o en lo que dejás de hacer con esa plata. El enojo va contra el mecanismo, no contra vos. | Buscar en tus resúmenes la tasa, el CFT y el vencimiento de cada deuda. | Tenés esos datos a mano ("entendido"). | — (enseña) |
| V.2 | Elegí cómo cruzar | hacer | Hay dos órdenes: la más chica primero (ves avanzar rápido) o la más cara primero (pagás menos interés en total). Sirve el que podés sostener. Mientras cruzás, un aporte chico al colchón sigue. | En cada pasivo: tasa, cuotas y vencimiento (opcionales). Elegir el orden y un aporte chico al colchón. | Un orden elegido. Señal: todos los pasivos con vencimiento cargado. | Si el orden elegido se estanca dos meses seguidos, cambiás de orden. No abandonás la meta. |
| V.3 | Frená la deuda nueva | hacer | No se achica una deuda mientras se suma otra. | Dejar de usar la tarjeta y las cuotas nuevas (afuera de la app) y bajar el límite de esa categoría en Presupuesto. | El total de tus pasivos no sube respecto del que anotaste al terminar V.2 (la referencia queda en el paso). | Si sube dos meses, mirá qué gasto la alimenta (2.3). Volvés un tramo, no empezás de cero. |
| V.4 | Limpiá tus deudas | hacer, **dos salidas** | Una piedra por vez: al terminar una deuda, ese pago pasa a la siguiente. Hasta que no quede saldo a pagar. | Pagar y registrar cada pago en Patrimonio, siguiendo el orden de V.2. | **Salida 1:** ningún pasivo con saldo a pagar. Hito intermedio: tu patrimonio neto deja de ser negativo ("salís del rojo"), si empezaste en negativo. **Salida 2:** "Sigo por mi cuenta" (una deuda larga o barata, pagada al día). El mapa sigue; los avisos de vencimiento se quedan. | Si pagás y el saldo no baja dos meses, el interés se está comiendo el pago. No es falta de esfuerzo: cambiá el orden, subí el ingreso, bajá un gasto fijo o hablá con quien te prestó. |

Notes:
- **V.4's second exit** keeps the map from stalling for years on a cheap, long debt. It is a
  conscious choice, never a "saltear". The person can reopen V.4 at any time.
- **No product recommendations.** The screen never names a bank or credit line. The legal notice
  ("no es asesoramiento financiero") must be visible here; its wording is a lawyer's job.
- **Old 3.4's "se salta si no tenés deudas"** becomes the route itself (see Old → new).

## Route A: por el puente, and a deeper colchón

Without debts there is nothing competing for the surplus, so route A turns the aguada into the
real goal of this stretch. The aguada is the same for both routes; what differs is how much of the
surplus goes into it and when. Chapter 3 isn't designed yet, so these ids are provisional.

| # | Title | Type | Lesson | Action in the app | Signal it worked | Change course |
|---|---|---|---|---|---|---|
| A.1 | Por si aparece una deuda | radar | Qué hacer si algún día debés, para no improvisar. Hoy no hace falta actuar. | Un vistazo al Vado. Nada que cargar. | "Entendido". | — |
| 3.1 | Tu colchón mínimo | hacer | Igual que en la ruta B. | Igual. | Igual. | Igual. |
| 3.2 | ¿Cuánto es suficiente? | hacer | El colchón se mide en meses de gastos esenciales, no en un monto mágico. Si tu ingreso es irregular, conviene más margen. | Seguidor de ahorro → meta "Colchón" = tus gastos esenciales de un mes (grupo "necesito" de 2.2) por los meses que elegís. | La meta existe con ese cálculo. | Si tus gastos esenciales cambian (alquiler, un hijo), recalculá. |
| 3.3 | ¿Dónde guardarlo? | principio | El colchón tiene que estar disponible rápido y no perder contra la inflación. Cada lugar tiene su compromiso entre liquidez, rendimiento y riesgo. Conocé las opciones; la elección es tuya y no es asesoramiento. | Patrimonio → cargar el colchón con el lugar y la moneda donde lo guardás. | El colchón está cargado con su moneda. | Si mes a mes pierde valor frente a lo que suben tus gastos, revisá dónde está. No lo gastes. |
| 3.4 | Pagate primero | hacer (hábito) | El ahorro es lo primero que separás el día del cobro, no lo que sobra. | Separar el aporte el día del cobro y registrarlo en Seguidor de ahorro. **Ruta A: todo el sobrante del presupuesto va al colchón hasta la meta.** | Aporte registrado en 3 meses seguidos (no bloquea). | Si dos meses no llegás, bajá el aporte y mantené el hábito. Cambia el monto, no la regularidad. |
| 3.5 | Usalo y rellenalo | principio | Usar el colchón en una emergencia no es fracasar: para eso está. Después se repone. | Cuando lo uses, registrar la salida y crear una meta de reposición. | Colchón repuesto, o un plan de reposición creado. | — |

**What makes the colchón "better" on route A:**
- It's sized from the person's own real essential spending, not from a rule of thumb.
- It has a stated place and currency, which is where Argentina bites (pesos lose value).
- A regular contribution on payday, with the whole budget surplus behind it.
- A rule for using it and for refilling it, so spending it isn't the end of it.
- Visible progress toward a goal the person set (the savings alerts at 50% and 100% already exist
  in the notification plan).

**On route B** the same stones come after the vado, and the small contribution chosen in V.2 keeps
a first cushion growing during the crossing.

**Exit from the aguada:** goal reached, or "sigo por mi cuenta" (saving on schedule). Same two exits
as the vado.

## Moving between routes

| Situation | What happens |
|---|---|
| Dijiste "no tengo deudas" y después cargás un pasivo con saldo | El mapa avisa: "Cargaste una deuda. El vado está disponible cuando quieras." No te mueve solo. |
| Estás en el vado y cargás una deuda nueva | V.3 vuelve a mostrarse y la deuda entra en el orden de V.2. |
| Terminás las deudas | V.4 se completa y el mapa te lleva a la aguada. |
| "Sigo por mi cuenta" | El mapa avanza; los avisos de vencimiento siguen; V.4 queda abierta. |
| Querés cambiar el orden a mitad de camino | V.2 se reabre. No se pierde nada. |

## Perseverance vs. obstinacy

- **Measured:** the balance of each pasivo and your net worth, month by month.
- **Perseverance:** the balance falls, even slowly.
- **Obstinacy:** you pay month after month and it doesn't fall. Repeating the same thing won't fix it.
- **What changes is the method, never the goal:** the order, the income, a fixed expense, a
  conversation with whoever lent you the money. The last three are the same three places where
  chapter 2 closes.
- **On the aguada:** if the contributions don't show up three months in a row, the problem is the
  mechanism (the transfer on payday), not the target.

## Visuals required

**Do we need a forked map, or only a change of landscape? Landscape only.**

- The trail is one curve computed at runtime through the cairns, with cards alternating sides.
  A branching path needs new geometry, and the second branch would be unused by most people.
- Both routes meet again at the aguada. The only difference people see is how they cross a river.
- Swapping the milestone after chapter 2 (bridge for vado) and adding four cairns for route B is
  the whole fork, with the least art.
- The landing is the same for everyone: it keeps the bridge and adds a short caption about the vado.
- **Reconsider** only if route B grows into many chapters of its own.

| # | Asset | Where | State | Note |
|---|---|---|---|---|
| VIS-1 | Bridge | After chapter 2, route A and the landing | Exists (`bridge.webp`) | |
| VIS-2 | **Vado**: stepping stones across the river | After chapter 2, route B on the dashboard map | New | Same hand-drawn parchment style as the bridge, similar width. |
| VIS-3 | River | Top of the dashboard map | Exists (`river.webp`) | Decide whether the river at the top and the one at the crossing are the same one. |
| VIS-4 | **Aguada**: a spring or pool in the sierras | Start of the aguada | New | On route B the first fill (3.1) could use a smaller variant. |
| VIS-5 | Place label above each chapter title | Chapter cards | New (text) | Replaces "Capítulo N" with "Al pie del camino", "La huella", "El vado", "La aguada", "La cuesta", "La cumbre". |
| VIS-6 | Route marker on "Tu lugar en el mapa" (1.11) | Chapter 1 closing | New | A dotted line over the map: bridge or vado. |
| VIS-7 | Water level on the colchón cairn | Aguada | Optional | A canteen that fills as the savings goal fills. |
| VIS-8 | Stepping-stone cairns for V.1 to V.4 | Vado | Optional | Flat stones in the water instead of upright cairns. |
| VIS-9 | Landing caption and small inset: "¿Con deudas? Cruzás por el vado." | Landing | Optional | Static, same for everyone. |

All of these are proposals. `lib/trail/chapters.ts` and the map components stay untouched.

## Product dependencies (summary; detail in the requirements file)

| # | Assumption | What I found (read-only) | Needed |
|---|---|---|---|
| F1 | Evaluate "tiene deudas" and net worth | The Patrimonio response carries `totalLiabilities`, `totalAssets` and `netWorth`. | Likely none |
| F2 | Steps shown per route | `map-context.json` already has `conditional` steps. | Extend from one step to a whole tramo |
| F3 | Rate, cuotas, due date per debt | A liability has only name (max 20 characters), type, currency and balance. | New fields: see requirements |
| F4 | Reminders on due dates | The API sends push notifications from one weekly cron; a `Payment` entity exists for reminders. | Daily job and settings: see requirements |
| F5 | "Saldo baja mes a mes" | The balance comes from movements, so a history exists. | Product check |
| F6 | Route and baselines kept in the step | Bruno: a string reference in the step is enough. | None now |

## Old → new ids

| Old id | Old title | New | How |
|---|---|---|---|
| 3.1 | Fondo de emergencia inicial | 3.1 | Stays; retitled "Tu colchón mínimo"; on route B it comes before the vado |
| 3.2 | ¿Tenés deudas? | 1.8 | Already moved; it is the fork |
| 3.3 | Fondo de emergencia completo | 3.2, 3.3 | Split into sizing and placing (provisional, chapter 3 not designed) |
| 3.4 | Liquidá tus deudas | V.2, V.4 | Method teaching to V.2, paying to V.4 |
| 3.4 conditional note | "se salta si no tenés deudas" | the fork | Generalized from one step to a whole tramo |
| 3.5 | Cómo salir de la deuda | V.1, V.2, A.1 | Split: three teaching concepts to V.1, "elegí un método y comprometete" to V.2, the "aunque no tengas deuda" intent to A.1 |
| 3.6 | Métodos para ahorrar | 3.4 | "Pagarte primero"; provisional |
| — | — | V.3, 3.5 | New: Frená la deuda nueva, Usalo y rellenalo |

## Open questions

1. **Is the aguada gated?** I proposed the same two exits as the vado (goal reached, or "sigo por
   mi cuenta"). Do you agree, or should the aguada never block?
2. **Default months for the colchón.** I leave the number to the person. Should the app suggest one?
   It would need a verified source (row E14 in the register has none).
3. **Id scheme:** `V.1` to `V.4` keep chapter numbers stable but break the "chapter.step" pattern.
4. **One river or two** (VIS-3).
5. **Apply the activo/pasivo lesson to 1.7 and 1.8** in `map-ch1-ch2.md`, or wait until you finish
   reviewing chapter 1?
