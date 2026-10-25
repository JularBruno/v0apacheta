# Map steps — chapters 1 and 2 (draft 2026-10-19)

Full course model for the first two chapters: every step has a **lesson**, a **real action in the
app**, a **signal that it worked**, and a **when to change course** (perseverance vs. obstinacy).
Titles are action-first, in vos, max 5 words. Chapter names live in
[trail-naming.md](trail-naming.md). Old → new ids are recorded there too (D2).

**Status: draft for Bruno's review.** Nothing here is in code. Copy is internal draft, no numbers,
no promises. Source names don't appear (D1); where an idea comes from, see
[methods/](methods/README.md).

## Assumptions (change any of these)

1. **Chapter 1 includes the first budget** (Bruno, 2026-10-19: "presupuestar ingresos y gastos en
   este primero capítulo"). Old 2.0 and 2.1 merge into 1.5 with content intact.
2. **"Gastá con propósito" lives in chapter 2** as a principle (recommended option A; Bruno hasn't
   confirmed the chapter).
3. **Order of the route:** 1 → 2 → El vado (only with debts) → La aguada. See Open question.
4. **Signals are non-blocking where possible.** The current map blocks on a count (5 movements,
   3 categories). We keep one blocking minimum so the next step has data, and add a *signal* that
   only reports.

Step types (D9, provisional): **hacer**, **usar la app**, **principio**, **radar** (tener en el
radar), **cierre**.

---

## Chapter 1 — Al pie del camino · **Sabé dónde estás parado**
*Bajada:* Sacá la brújula: tus números dicen dónde estás.
*Goal of the chapter:* leave with real data loaded, a first budget, your net worth, your route
(A or B) and a day-0 photo, and know every screen of the app.

| # | Title | Type | Lesson | Action in the app | Signal it worked | Change course |
|---|---|---|---|---|---|---|
| 1.1 | Tu primera piedra | usar la app | El mapa es el método: cada piedra es una clase y una acción. Hay dos rutas. | Abrir el mapa y ver el recorrido completo. | "Ya lo vi" (botón). | — (orientación) |
| 1.2 | Traé tu último mes | hacer | No podés mejorar lo que no ves. Empezá con plata real, no con una hoja en blanco. | Importar desde Excel, migrar con IA o cargar a mano el mes pasado, más el saldo actual. | Movimientos del mes cargados y saldo inicial puesto (aunque sea 0). Alternativa: "arranco de cero hoy". | Si un mes entero se siente demasiado, bajá a una semana o al saldo solo. Misma meta, método más liviano. |
| 1.3 | Mirá adónde fue tu plata | usar la app | El historial es un espejo, no un juicio. | Historial → filtrar por categoría. | Abriste el historial y filtraste una vez. | Si todo cae en "otros", reordená categorías antes de sacar conclusiones. |
| 1.4 | Gastá menos de lo que ganás | principio | La regla madre. No es matemática, es comportamiento. Todo lo demás es técnica. | Ver ingresos menos gastos del mes cargado. | Ves tu número de "sobra" o "falta". No exige que sea positivo. | Si falta dos meses seguidos, no es falta de voluntad: mirá qué categoría pesa o si el ingreso alcanza. Cambiá el plan, no a vos. |
| 1.5 | Tu primer presupuesto | hacer | Cada peso con nombre. El presupuesto es un plan, no una restricción, y el primero nunca sale perfecto. | Presupuesto → poner límites en 3 o más categorías para el mes que viene, partiendo del mes importado. Planear también el ingreso esperado. | 3 o más categorías con límite. | Si se rompe la primera semana, ajustá los límites y seguí. Abandonarlo es la única forma de que no sirva. |
| 1.6 | Seguí registrando | hacer (hábito) | Un día no dice nada, una semana empieza a mostrar, un mes completa el cuadro. | Registro rápido en Inicio, el día que gastás. | Desbloquea con 5 gastos. Señal (no bloquea): anotaste en 3 días distintos de la semana. | Si a la segunda semana no aparece la señal, cambiá el método (recordatorio diario, importar del banco cada semana), no la meta. |
| 1.7 | Lo que tenés | hacer | Patrimonio neto = lo que tenés menos lo que debés. Ahorros, dólares e inversiones cuentan. | Patrimonio → cargar activos, o importar patrimonio por Excel. | Un activo cargado, o "no tengo". | Si no sabés el valor exacto, cargá una estimación y actualizala. Mejor aproximado que vacío. |
| 1.8 | Lo que debés | hacer, **bifurca** | Ver la deuda es el primer paso para ordenarla. La deuda no es un fracaso moral. El enojo va contra las cuotas y los intereses, no contra vos. | Patrimonio → cargar cada deuda como pasivo (nombre y saldo), o "no tengo deudas". | Un pasivo con saldo, o "no tengo". **Con deudas: ruta B (El vado). Sin deudas: ruta A.** | Si no querés mirar el número todavía, cargá solo la deuda más chica. Empezar chico cuenta. |
| 1.9 | Ayuda y avisos | usar la app | Hay un Centro de Ayuda y recordatorios para no depender de la memoria. | Ayuda; Configuración → recordatorio diario; instalar la app en el celular (ver nota). | "Entendido". El recordatorio es opcional. | Si los avisos molestan, bajá la frecuencia. No los apagues sin reemplazo. |
| 1.10 | Tus otras herramientas | radar | Dividir cuenta, Seguidor de ahorro, Importar y Donaciones existen y tienen su momento. | Un vistazo a cada una; ninguna es obligatoria acá. | "Entendido". | — |
| 1.11 | Tu lugar en el mapa | cierre | Una foto del día 0 es la base de toda comparación futura: sin punto de partida no se distingue progreso de tozudez. | Guardar foto inicial (saldo, patrimonio neto) y ver tu ruta (A o B). | La foto queda guardada. | — |

Principles in this chapter: 1 in 1.4, 2 in 1.5, 4 and 5 in 1.8.

### Notes on chapter 1
- **1.9 absorbs** the install-the-app instructions that lived in old 1.0 and the notification note
  from old 1.1.3. Content preserved, moved.
- **1.2 is the center of the chapter.** More loading methods will come (Bruno will add them); the
  step is written method-agnostic ("importar, IA o a mano") so a new method adds an option, not a
  new step.
- **1.5 depends on a product check:** planning *income* in Presupuesto (see dependencies).

---

## Chapter 2 — La huella · **Cada peso, en su lugar**
*Bajada:* Marcá el rumbo antes de gastar.
*Goal of the chapter:* live a month with your budget: follow it, compare plan with reality, spend
with a "para qué", plan the next month before it starts, close the month.

| # | Title | Type | Lesson | Action in the app | Signal it worked | Change course |
|---|---|---|---|---|---|---|
| 2.1 | Sabé cuánto te queda | usar la app | El presupuesto sirve si lo mirás mientras gastás. | Presupuesto → barra de cada categoría y gasto diario sugerido. | Un gasto registrado en una categoría con límite (existente). | Si una categoría se llena a mitad de mes, subí el límite con honestidad o bajá otra. No lo ignores. |
| 2.2 | Gastá con propósito | principio | El problema no es gastar: es gastar sin un "para qué". Los gustos entran, sin culpa. | Agrupar categorías por propósito (necesito, quiero, me suma, imprevisto). **Decisión de producto pendiente.** | Al cerrar el mes podés decir para qué fue cada gasto grande. | Misma fuga dos meses seguidos: cambiá la herramienta (límite más ajustado, débito, sacar la tarjeta guardada). Misma meta. |
| 2.3 | Compará plan y realidad | hacer | Plan contra realidad muestra dónde el plan era fantasía. | Historial + límites: elegir una categoría con desvío. | Revisaste al menos una categoría con desvío. | Desvío dos meses seguidos: el límite estaba mal puesto. Corregí el plan. |
| 2.4 | Gastá en papel antes que en la realidad | principio | Decidir antes del día 1 vale más que explicar después. | Presupuesto → actualizar límites del mes siguiente antes de que empiece. | Hay límites del mes siguiente creados antes del día 1. | Si siempre te olvidás, atá la tarea al día del cobro y activá el recordatorio. |
| 2.5 | Cerrá el mes | cierre | Una mirada corta al final del mes te dice qué cambiar. Tres preguntas, tuyas. | Resumen del mes: sobra o falta, categoría que más se pasó, un cambio para el próximo. | Cerraste un mes con un cambio anotado. | **Primer punto de decisión del mapa:** tras 3 meses cerrados, si "sobra" no mejora, miralo de frente: ¿ingreso, gasto fijo, deuda? Cambiás de rumbo en una de las tres, no repetís lo mismo. |

Principles in this chapter: 3 in 2.4.

### Notes on chapter 2
- **2.2 comes from the "spend with purpose" idea** in [methods/lecciones-de-la-cultura-japonesa.md](methods/lecciones-de-la-cultura-japonesa.md).
  The source is low quality; the lesson is ours and makes no claim about other cultures.
- **2.3 vs. 1.3:** 1.3 is the *first look* at last month. 2.3 is plan against reality, only
  possible once a budget has run. Not the same step.
- **2.5 is where perseverance vs. obstinacy first becomes concrete:** a fixed horizon (3 months), a
  measure ("sobra o falta") and three named places to change course.
- **2.4 improves the old check:** old 2.4 completed with a "Lo voy a hacer" button; now it can be
  verified by the next month's limits existing.

---

## Product dependencies (listed, not decided, not fixed)

| # | What the steps assume | What I found (read-only) | Needed |
|---|---|---|---|
| P1 | A visible "sobra o falta" for a month (1.4, 2.5) | The dashboard shows balance and spending totals. I didn't find a "sobra/falta" figure by that name. | Product check |
| P2 | Planning **income** inside Presupuesto (1.5) | No income field found in the budget code I looked at. | Product check; if absent, 1.5 plans spending only |
| P3 | Grouping categories by purpose (2.2) | Movements have tags; unclear if budget categories are tags and if a purpose layer fits. | Product decision |
| P4 | Day-0 photo (1.11) | Nothing found. | New feature, or reuse the first patrimonio snapshot |
| P5 | Habit signal "3 distinct days" (1.6) | Movements carry dates, so it looks feasible. Not verified. | Product check |
| P6 | Import of patrimonio with liabilities (1.7, 1.8) | Exists: Importar handles patrimonio and liabilities, cap 1000 rows (from code read 2026-10-19). | None |
| P7 | "No tengo" fallbacks | Today stored in localStorage per step. | Decide whether they stay local |

## Open question

- **Where does a person with debts go after chapter 1?** My draft sends them 1 → 2 → El vado. Your
  line "si tiene deudas, que vaya al vado" can also mean going straight after 1.8, with the budget
  chapter running after. The first keeps one budget habit before tackling debt; the second acts
  while the debt is fresh.
