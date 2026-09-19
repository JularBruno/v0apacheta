# Import examples

Ready-made `.xlsx` files for the bulk-import endpoints. Regenerate with
`npm run gen:import-examples` (source: `scripts/gen-import-examples.ts`).

| File | Endpoint | What it shows |
|---|---|---|
| `ejemplo-movimientos.xlsx` | `POST /v1/movement/upload` | All valid rows, one per default category (`Hogar`, `Compras`, `Comestibles`, `Transporte`, `Servicios`, `Entretenimiento`, `Deportes`, `Salud`, `Belleza`, `Trabajo`, `Ingreso` — the set `UserService.register` creates for every new user), so importing it for a fresh user creates **no new categories**. Mixes explicit `Tipo` with blank `Tipo` (sign decides) to show both work. Balance goes 0 → 962 000. |
| `ejemplo-movimientos-con-errores.xlsx` | `POST /v1/movement/upload` | 2 valid rows + 5 rows, each failing for one distinct reason: non-numeric `Monto`, `Monto` = 0, unparseable `Fecha`, empty `Fecha`, unrecognised `Tipo`. Valid rows still import and the balance only moves by their amount. |
| `ejemplo-patrimonio.xlsx` | `POST /v1/financial-element/upload` | Patrimony history for **several assets in one file**: every row names its `Elemento`. The elements must already exist (create them in the app first): `Caja de ahorro`, `Cuenta en dólares`, `Inversiones (broker)`, `Tarjeta de crédito`, `Préstamo auto`. |
| `ejemplo-patrimonio-sin-elemento.xlsx` | `POST /v1/financial-element/upload?financialElementId=<id>` | The **"I picked the asset in the UI"** flow: no `Elemento` / `ID Elemento` columns at all — just `Fecha, Descripción, Monto, Tipo`. Every row falls back to the element id passed in the query string. |
| `ejemplo-patrimonio-con-errores.xlsx` | `POST /v1/financial-element/upload` | One valid row + four bad rows (non-numeric amount, impossible date, mistyped element name → "¿quisiste decir?", currency mismatch). Valid rows still import. |

## Two ways to tell the patrimony import *which* asset

1. **Multi-asset file** (`ejemplo-patrimonio.xlsx`): every row carries `Elemento`
   (name) or `ID Elemento` (UUID). Use this when one upload covers several
   assets/liabilities at once.
2. **Pre-selected asset** (`ejemplo-patrimonio-sin-elemento.xlsx`): if the
   frontend already asked "which asset?" before the file picker, pass
   `?financialElementId=<uuid>` on the upload — the sheet doesn't need an
   Elemento column at all, every row with none falls back to that element. A row
   *can* still name a different element explicitly; the default only fills in
   what a row is missing. Passing an id you don't own returns `400`.

## `Tipo` is optional — on both sheets

`Fecha` and `Monto` are the only required columns. When `Tipo` is blank the
**sign of `Monto` decides**: negative → Gasto, positive → Ingreso. `Tipo` only
exists to override that when you need to (e.g. a refund you want tagged
`Ingreso` even though it's entered as a negative reversal). Both example files
mix explicit and blank `Tipo` on purpose.

The template served at `GET /v1/movement/upload/template` (and the identical
`GET /v1/financial-element/upload/template`) is the blank version with instructions
and dropdowns.
