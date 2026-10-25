# Evidence register

**Internal note, not public copy.** Every factual claim that a step, post or tool wants to make
sits here with the state of its verification. Sources are named on purpose (rule D1 applies to
public copy only). Companion to the *Numbers to verify* tables in each method note.

**As of 2026-10-25.** Rule D8: a number or claim reaches public copy only with status ✅, and
then with its "as of" date.

| Mark | Meaning |
|---|---|
| ✅ | Original read, or arithmetic we can reproduce ourselves |
| ◐ | Abstract or a secondary write-up read; original not read. Usable internally, not yet in public copy |
| ⬜ | Unverified, or only a press report. Do not use |
| ❌ | Dropped: contradicted, borrowed from another country, or impossible to check |

## A. Debts (steps V.1 to V.4)

| # | Claim | Status | Source and note |
|---|---|---|---|
| E1 | The BCRA turns a nominal annual rate (TNA) into an effective monthly rate as `TNA × 30,41666 / 365`, and chains months by compounding. Since `365 / 30,41666 = 12`, that is the same as `TEA = (1 + TNA/12)¹² − 1`. | ✅ | BCRA, *Notas metodológicas de las tasas de interés y coeficientes de ajuste* (PDF, personal-loans series). Read 2026-10-25. The file's metadata says 2022 but its text cites 2023 material, so re-check the current version on bcra.gob.ar. |
| E2 | Worked example for a tool or post: TNA 60% with monthly compounding gives TEA 79,59%. | ✅ | Arithmetic from E1 (`1,05¹² − 1`). Reproducible; not a claim about any real loan. |
| E3 | BCRA series "Tasa de interés de préstamos personales" read 62,57 on 2026-10-22. | ◐ | BCRA statistics API v4.0, idVariable 14 and 144, read 2026-10-25 through a summarizing fetch tool. The unit is **not confirmed**: it may be the published TNA or a derived rate. Check the series sheet on bcra.gob.ar before using. |
| E4 | If E3 is a TNA, 62,57% TNA equals about 84% TEA. | ◐ | Derived from E1 and E3; stands or falls with E3's unit. |
| E5 | Year-on-year inflation was 33,4% at 2026-09-30. | ◐ | Same API, idVariable 28. The primary source is INDEC; verify there. |
| E6 | Consumer-credit rates in Argentina "pueden superar el 100% anual" (old step 3.2). | ⬜ | No current card-rate series found. Not usable. |
| E7 | "Una tarjeta al 120% TEA" (old step 3.5). | ❌ | Presented as an example, backed by nothing. Replace with E2. |
| E8 | Household loan arrears at a record in mid-2026 (12,9% in July; cards 12,8%; personal loans 16,7%). | ⬜ | Press reports of the BCRA *Informe sobre bancos*. The outlets disagree by month and series. Not usable until read in the BCRA report. |
| E9 | With the same total monthly payment, paying the highest-rate debt first costs less interest in total than any other order. | ✅ | Arithmetic; shown with a worked example, no outside source needed. Needs a calculator or table of ours. |
| E10 | Concentrating repayments on one account raises motivation to get out of debt, most when it is the smallest account. | ◐ | Kettle, Trudel, Blanchard, Häubl (2016), *Journal of Consumer Research* 43(3). Abstract read (field study plus three experiments). Sample sizes and limits not seen. |
| E11 | Starting with small debts is associated with a higher chance of finishing a debt-settlement program; it matters most when the rate gap between small and large debts is modest. | ◐ | Gal and McShane (2012), *Journal of Marketing Research*. Read only through a Kellogg Insight write-up (about 6.000 clients of one settlement firm; observational, so "associated", never "causes"). Abstract not read. |
| E12 | "Bola de nieve motiva, avalancha paga menos interés" (old step 3.4). | ◐ | Half of it is E9 (✅), half is E10/E11 (◐). Say "la investigación encuentra", never "funciona mejor". |

## B. Colchón (the aguada)

| # | Claim | Status | Source and note |
|---|---|---|---|
| E13 | A starter fund of "$500 a $1000 USD" (old step 3.1). | ❌ | A figure from a US radio host's plan; no original. Dropped. |
| E14 | Keep 3 to 6 months of expenses (old step 3.3). | ⬜ | A rule of thumb with no original found. Public copy says "varios meses de gastos esenciales", and the person chooses the number. |
| E15 | In US low and moderate income households, about one month of income in liquid savings (about US$2.500) went with less hardship later: 9,5 percentage points lower chance after up to three years. | ◐ | Gallagher and Sabat, read through a Wharton Pension Research Council blog post. US data; no Argentine equivalent found. Not for public copy; at most "una investigación en EE. UU." once the original is read. |

## C. Recording and following progress (chapters 1 and 2)

| # | Claim | Status | Source and note |
|---|---|---|---|
| E16 | Monitoring progress toward a goal improves reaching it (d = 0,40, 138 randomized studies, N = 19.951); larger when the progress is physically recorded or shared. | ◐ | Harkin et al. (2016), *Psychological Bulletin* 142(2). Abstract-level. Mostly non-financial goals. |
| E17 | Financial education has positive effects on financial knowledge and behavior (76 randomized experiments, 160.000+ people). | ◐ | Kaiser, Lusardi, Menkhoff, Urban (2022), *Journal of Financial Economics* 145(2). Abstract-level. An average across programs. |
| E18 | An aggregation app in Iceland went with 38,4% fewer overdraft fees within 24 months. | ◐ | Carlin, Olafsson, Pagel (2023), *Review of Finance* 27(3). Search summary only; the journal page didn't load. About automatic access to data, not manual logging. |
| E19 | Mobile access to account data lowered spending by 15,7% on average. | ◐ | Levi and Benartzi, "Mind the App". SSRN working paper; check whether it was published. |
| E20 | Habit formation took a median of 66 days, between 18 and 254. | ◐ | Lally et al. (2010), *European Journal of Social Psychology*. Search summary only; the PDF returned 403. |
| E21 | Paying by card raised willingness to pay compared with cash, up to 100%. | ◐ | Prelec and Simester (2001), *Marketing Letters*. One auction of Celtics tickets. |

## What we can say publicly today

- The method and the arithmetic: **E1, E2, E9**, with the formula shown.
- Anything else only as a plain statement of how to do something ("conviene mirar la TEA, no la TNA"), never as a statistic.
- No claim about card rates, arrears, savings buffers or "how many months" until its row turns ✅.

## To close the ◐ rows (needs a person with access)

1. Open the BCRA series sheet for E3 and confirm the unit and date. Find whether a **card** rate series exists (older BCRA notices mention a "Tarjetas" sheet in a rates workbook).
2. Read E5 at INDEC.
3. Read the abstracts of E10, E11, E16 to E21 in the journals (a university library gets past the 403s).
4. Find the original, if any, behind "3 a 6 meses" (E14).
5. Read the BCRA *Informe sobre bancos* for E8.
6. Ask a behavioral-economics academic to review the three or four claims that end up in public copy.
