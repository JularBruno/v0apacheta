# Deshacer la última migración: contrato del backend

El front ya está hecho: `components/importar/undo-last-import.tsx`, que se muestra en `/dashboard/importar`, usa estos endpoints a través de `lib/actions/movements.ts`. Hasta que existan, `GET /last` responde 404 y la tarjeta no aparece.

## Modelo

- Agregar una tabla `MovementImport` con `id`, `userId`, `createdAt` y `undoneAt` (null mientras siga activa).
- Agregar `importId` (nullable, FK) en `Movement`. Los movimientos creados a mano o con la carga masiva con IA quedan en null, así que el deshacer nunca los toca.
- Guardar qué categorías y tags creó cada import, en una tabla o como arrays en `MovementImport`.
- `POST /v1/movement/upload` (sin `dryRun`) crea la fila `MovementImport` y le pone el `importId` a cada movimiento, todo en la misma transacción que ya usa. Opcionalmente devuelve `importId` en la respuesta.

## `GET /v1/movement/upload/last`

Devuelve el import más reciente del usuario con `undoneAt = null`.

```json
200 { "importId": "uuid", "importedAt": "2026-10-19T15:30:00.000Z", "movements": 412 }
404 cuando no hay ninguno
```

`movements` es la cantidad de movimientos de ese import que todavía existen, sin contar los borrados a mano.

## `DELETE /v1/movement/upload/:importId`

Se ejecuta todo en una sola transacción:

1. Verificar que el import sea del usuario (si no, 404) y que no esté deshecho (si ya lo está, 409).
2. Borrar los movimientos con ese `importId`.
3. Recalcular el saldo del usuario una sola vez, sumando el delta de los movimientos borrados (gasto: +monto; ingreso: −monto). Si el recálculo de `lastBalance` es por movimiento, recalcularlo para los que vienen después.
4. Borrar las categorías y los tags que creó ese import y que ya no usa ningún movimiento.
5. Poner `undoneAt = now()`. Después de esto, `GET /last` pasa a devolver el import anterior, así que se puede deshacer de a uno.

```json
200 {
  "importId": "uuid",
  "deleted": 412,
  "balance": { "previous": 50000, "current": 20000 },
  "removed": { "categories": ["supermercado"], "tags": ["coto"] }
}
404 / 409 { "statusCode": 409, "message": "La migración ya fue deshecha." }
```

El front muestra `message` tal cual en el toast de error, así que conviene que esté en español.

## Imports anteriores a este cambio

Los imports que ya existen no tienen `importId`, así que este endpoint no los puede deshacer. Si hace falta, un script puntual puede agruparlos por `userId` + `updatedAt` (todos los movimientos de un import comparten ese timestamp con diferencia de segundos) y crearles su `MovementImport`.
