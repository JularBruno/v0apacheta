# Debts: product requirements and tasks (proposal, 2026-10-25)

What the app and the API would need so that the fork in [map-bifurcation.md](map-bifurcation.md)
works: rate, cuotas and due date per debt, ordering, and notifications. **A proposal to implement
later.** Nothing here is code, and nothing has been added to `TASKS.md`.

Tasks use the `TASKS.md` shape (title, `Status`, `Repos`, `Acceptance`) so they can be pasted in
when you decide. They carry provisional ids `D-…`; real `T-n` numbers get assigned then. The two
repos stay separate: each task names its repo and never spans both.

## What exists today (read-only check)

| Piece | Where | State |
|---|---|---|
| Liability | `FinancialElement` in both repos | name, type, currency; balance is derived from movements |
| Totals | Patrimonio response | `totalAssets`, `totalLiabilities`, `netWorth` |
| Push notifications | `neptuno/src/notifications` | `web-push` via stored subscriptions; **one weekly cron**, Wednesdays 18:00 Argentina time |
| Notification copy | `notifications.service.ts` | Spanish, "Apacheta" title, link to the dashboard |
| Payment reminders | `Payment` entity: title, amount, monthly or one-time, `period`, `isPaid`, category, tag | Exists. Observed: `period` is an integer in the API and a string in the app's schema |
| Debt alerts | `notificationPlan.debtAlerts` in `map-context.json` | Written as text, not implemented |

## Data model for a debt

Optional fields, **only valid on liabilities**. Everything stays optional so the first load stays
quick (stone 1.8 asks name and balance only; V.2 asks the rest).

| Field | Type | Meaning | Why |
|---|---|---|---|
| `debtKind` | `card`, `personal_loan`, `installments`, `mortgage`, `other` | What kind of debt | Sets sensible questions; cards and installments behave differently |
| `rate` | number, percent | The rate as written on the statement | Ordering by cost and showing what it costs |
| `rateKind` | `TNA`, `TEA`, `CFT` | Which rate it is | People copy whatever their statement prints; the app converts |
| `installmentsTotal` | integer | Total cuotas | Remaining cuotas |
| `installmentsPaid` | integer, at most the total | Cuotas already paid | Same |
| `installmentAmount` | number | Amount of one cuota | Planning |
| `interestFree` | boolean | Sold as "sin interés" | Teaching: the cost sits elsewhere |
| `dueDay` | integer 1 to 31 | Day of the month it is due | Reminders |
| `closingDay` | integer 1 to 31, optional | Statement closing (cards) | Context for the card |
| `minimumPayment` | number, optional | Minimum due | Planning |

**Computed on read, never stored:**
- `effectiveAnnualRate` (TEA). For `TNA`: `(1 + TNA/12)^12 − 1`. For `TEA`: itself. For `CFT`:
  shown as given (the CFT is already expressed as an annual effective rate). The conversion is the
  BCRA's own method (evidence register, **E1**).
- `installmentsRemaining` = total minus paid.
- `nextDueDate`: the next date for `dueDay`, clamped to the last day of short months (day 31 in
  February becomes the 28th or 29th).

**Ordering for the vado:**
- *Más chica primero:* by balance, ascending. Needs nothing extra.
- *Más cara primero:* by `effectiveAnnualRate`, descending. Debts without a rate go last, with a
  visible hint: "Cargá la tasa de [deuda] para ordenarla".
- Debts in different currencies compare on the converted amount the API already computes.

**Open modelling questions** (decide before building):
1. UVA-indexed loans (a mortgage): the balance grows with inflation, so "the rate" means something
   different. Add `indexation` (`none`, `uva`, `other`), or leave these to "sigo por mi cuenta"?
2. Where does the due date live: on the debt (my recommendation, it belongs with the balance) or on
   the existing `Payment` reminders? A later link between them could cover both.
3. In production the API's `sync({ alter: true })` is a dev convenience. A real migration is needed
   before these columns reach production.

## Notifications

**Principle:** a reminder is a hand on the shoulder, not a scolding. Vos, short, no figures of
interest, no "¡vos podés!".

| Notification | When | Example copy |
|---|---|---|
| Due soon | Each morning, for debts whose due day is 3 days away and today (the days are a setting) | "En 3 días vence [Tarjeta]. ¿Ya lo tenés separado?" / "Hoy vence [Tarjeta]." |
| Progress | When a payment is recorded and the balance falls past a milestone | "Ya pagaste una parte de [deuda]. Seguí así." |
| Cleared | When a balance reaches zero | "Cruzaste [deuda]. Una piedra menos." |
| Colchón | Already planned: 50% and 100% of the savings goal | "Llegaste a la mitad de [Colchón]." |

**Mechanism:**
- A **new daily job** in the notifications cron, 09:00 Argentina time, with the explicit time zone
  the weekly job already uses (production runs in UTC). The weekly job stays as it is.
- It finds liabilities with a balance above zero whose next due date matches a chosen offset, and
  sends through the existing push path.
- **Idempotent:** a debt is never reminded twice for the same due date, even if the job runs twice
  or restarts. Needs a small log or a "last reminded" mark.
- **User control:** a setting to turn debt alerts off and to choose the offsets. Off means off.
- **Progress and cleared** fire from the moment a movement is saved on a liability, not from a cron.
- The notification links to that debt's page in Patrimonio.
- **In the app too:** a "Próximos vencimientos" list, so the reminder doesn't depend on push being
  allowed.

## Order of work

`D-1` → `D-2` → `D-5`, `D-6` → `D-3`, `D-4`, `D-7` → `D-8`. `D-9` and `D-10` can start any time.

## Tasks

### D-1: Campos de deuda en los pasivos
Status: proposed
Repos: api

Add the optional debt fields above to the liability entity, its create and update DTOs, and
validation. Only liabilities may carry them.

Acceptance:
- Creating or updating an asset with any debt field is rejected with a clear message.
- Each field's range is validated (day 1 to 31, cuotas paid at most the total, rate at least 0).
- A liability with no debt fields behaves exactly as today.
- Tests cover valid, invalid and absent fields.
- A note for production: the columns need a migration, not `sync({ alter: true })`.

### D-2: Campos calculados de la deuda
Status: proposed
Repos: api

Return `effectiveAnnualRate`, `installmentsRemaining` and `nextDueDate` with each liability.

Acceptance:
- `TNA 60` returns `79,59` and `TNA 62,57` returns about `84,03` (the arithmetic in evidence
  register E2 and E4; reproducible, not market data).
- A `TEA` is returned unchanged; a missing rate returns `null`, not zero.
- `nextDueDate` clamps day 31 to the last day of short months and handles the year boundary.
- The conversion lives in one small tested function.

### D-3: Aviso diario de vencimientos
Status: proposed
Repos: api

A daily job at 09:00 Argentina time that sends the "due soon" push for debts with a balance.

Acceptance:
- Runs with an explicit Argentina time zone; the weekly job is untouched.
- A debt with zero balance, or with debt alerts turned off, sends nothing.
- Running the job twice on the same day sends one notification per debt per due date.
- Tests use a fake clock and a mocked push sender, including month ends.

### D-4: Preferencias de avisos de deuda
Status: proposed
Repos: api

Store and expose per-user debt-alert settings (on or off, which day offsets).

Acceptance:
- Defaults are defined and documented; an existing user without a record gets them.
- Only the owner can read or change their settings.
- Invalid offsets are rejected.

### D-5: Campos de deuda en la app
Status: proposed
Repos: app

Extend the types and zod schema, and the liability form, with a collapsed "Detalles de la deuda"
section (rate and its kind, cuotas, due day).

Acceptance:
- Nothing new shows for assets; for liabilities the section is closed by default and optional.
- The form never blocks saving a debt that has only name and balance.
- The type label reads "Pasivo (deuda)" so the two words travel together.
- Spanish copy in vos; field errors in plain words.

### D-6: Lista de deudas ordenada
Status: proposed
Repos: app

In Patrimonio, a list of debts showing TEA, remaining cuotas and next due date, with a toggle
between "más chica primero" and "más cara primero".

Acceptance:
- Debts without a rate sort last under "más cara primero" and show the hint to load it.
- The list matches the API's computed values; the app never recomputes the TEA.
- Works on a phone-width screen.

### D-7: Próximos vencimientos
Status: proposed
Repos: app

A short list of upcoming due dates, so reminders don't depend on push being enabled.

Acceptance:
- Shows the next few due dates, soonest first, with days remaining.
- Empty state is calm and says nothing about failure.

### D-8: Avisos de deuda en Configuración
Status: proposed
Repos: app

A switch for debt alerts and the choice of day offsets, using the settings from D-4.

Acceptance:
- Turning alerts off persists and stops the daily notification.
- If push permission isn't granted, the screen says so and points to the existing enable button.

### D-9: Pasos de la ruta por el vado en el mapa
Status: proposed
Repos: app

Add stones A.1 and V.1 to V.4 to `map-context.json` and the step registry, shown by route. The
route, and the baseline total for V.3, are kept as string references inside the step.

Acceptance:
- A person with a pasivo with balance sees the vado stones; a person without sees A.1.
- Loading a new pasivo later shows the "El vado está disponible" banner and never moves anyone.
- V.4 completes when no pasivo has a balance, or when the person picks "Sigo por mi cuenta".
- Old 3.4's "se salta" rule is replaced by the route rule, with no regression for existing users.

### D-10: Calculadora "¿Cuánto cuesta tu deuda?"
Status: proposed
Repos: app

A tool under `/herramientas`: TNA to TEA, and the same total payment applied in each order, to
show the interest difference. Follow the repo's content rules (static page, server-rendered
text, SEO block, security guardrails, registered in the registry).

Acceptance:
- The page text explains the formula before the widget (the widget isn't the only home of the content).
- The worked example matches evidence register E2; no market figure appears unless it is ✅ and dated.
- It passes the content guardrail tests listed in the repo's `CLAUDE.md`.

### D-11: Cerrar las filas ◐ del registro de evidencia
Status: proposed
Repos: none (docs; needs a person)

Acceptance:
- Every row in [methods/evidence-register.md](methods/evidence-register.md) that a step or tool
  uses is ✅ with its "as of" date, or removed from the copy.

### D-12: Aviso legal revisado
Status: proposed
Repos: none (needs a lawyer)

Acceptance:
- The wording of "no es asesoramiento financiero" is approved and shown on V.1 to V.4.

## Definition of done for the whole feature

- A person with two debts loads their rate, cuotas and due day, picks an order, gets a reminder
  before a due date, records a payment, sees the balance fall, and reaches "Cruzaste [deuda]".
- A person who switches alerts off gets none.
- No public text carries a figure that isn't ✅ in the evidence register.
