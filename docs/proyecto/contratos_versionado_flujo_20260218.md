# Contratos Versionados por Pedido (Flujo y Pruebas)

## Flujo implementado

1. Al crear un pedido se genera contrato `v1` en `T_Contrato` con snapshot.
2. Mientras el pedido no este en estado `Contratado`, cada edicion del pedido:
   - si cambia el snapshot contractual, crea una nueva version `vN`,
   - si no hay cambios contractuales, no crea nueva version.
3. Cuando el pedido pasa a `Contratado`, la version vigente se marca como `FINAL`.
4. Si el pedido ya esta `Contratado`, el backend bloquea `PUT /pedido/:id` con `409`.

## Endpoints para front

1. `GET /api/v1/contratos/pedido/:pedidoId`
   - lista historial de versiones del contrato por pedido.
2. `GET /api/v1/contratos/pedido/:pedidoId/vigente`
   - devuelve la version vigente (404 si no existe).
3. `GET /api/v1/contratos/:id`
   - detalle de version de contrato, incluyendo `snapshot`.

## Pruebas manuales sugeridas

1. Crear pedido:
   - `POST /api/v1/pedido`
   - validar que `GET /api/v1/contratos/pedido/:pedidoId` retorna 1 registro, `version=1`, `estado=BORRADOR`, `esVigente=true`.

2. Editar pedido con cambio contractual:
   - `PUT /api/v1/pedido/:pedidoId` cambiando `items`, `lugar`, `dias`, `eventos`, etc.
   - validar nueva version `version=2`, con la anterior en `esVigente=false`.

3. Editar pedido sin cambio contractual real:
   - `PUT /api/v1/pedido/:pedidoId` manteniendo mismos datos contractuales.
   - validar que no aumenta la version.

4. Registrar primer pago para cambiar a contratado:
   - `POST /api/v1/pagos/voucher` (flujo actual).
   - validar en pedido que estado sea `Contratado`.
   - validar `GET /api/v1/contratos/pedido/:pedidoId/vigente` con `estado=FINAL`.

5. Intentar editar pedido contratado:
   - `PUT /api/v1/pedido/:pedidoId`
   - validar respuesta `409` con mensaje de bloqueo.

## Migracion de BD

Ejecutar:

`docs/db/migration_20260218_contrato_versionado.sql`
