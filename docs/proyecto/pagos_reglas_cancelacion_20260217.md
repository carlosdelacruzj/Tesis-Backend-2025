# Reglas De Pagos Y Cancelacion (2026-02-17)

## Objetivo
Dejar definidas las reglas funcionales para clasificar pedidos en el modulo de pagos cuando hay cancelaciones.

## Reglas Aprobadas
1. `Pagados`:
- Solo pedidos no cancelados con pago completo.

2. `Cerrados`:
- Pedidos con cierre financiero (`P_CierreFinancieroTipo = RETENCION_CANCEL_CLIENTE`).
- Pedidos con estado de pago `Cerrado`.
- Pedidos cancelados con movimiento financiero (`MontoAbonado > 0`), aunque no tengan nota de credito.

3. `Pendientes` y `Parciales`:
- Solo pedidos activos (no cancelados).

## Caso Basico Cubierto
Escenario: cliente paga adelanto y luego cancela (sin nota de credito).

Resultado esperado:
- Pedido/proyecto quedan cancelados.
- El pedido debe verse en `GET /pagos/cerrados`.

Implementacion aplicada:
- Migracion `docs/db/migration_20260217_sp_pagos_cerrados_cancelados_con_abono.sql`
- Ajuste de `sp_pedido_saldo_listar_cerrados` para incluir cancelados con `MontoAbonado > 0`.
- Ajuste backend en cancelacion para sincronizar estado de pago:
  - `src/modules/pagos/pagos.service.js`
  - `src/modules/proyecto/proyecto.service.js`
  - Regla efectiva: pedido `Cancelado` + `MontoAbonado > 0` => `FK_ESP_Cod = Cerrado`.

## Nota Importante
La clasificacion ahora queda consistente tanto en listado (`/pagos/cerrados`) como en el estado de pago persistido del pedido.

## Backfill De Datos Existentes
Si ya existen pedidos historicos en estado cancelado con abono y estado de pago antiguo, ejecutar:
- `docs/db/migration_20260217_fix_estado_pago_cancelados_con_abono.sql`

## Pruebas Manuales Validadas
### Prueba 1 (Validada OK)
- Escenario:
  - Pedido con pago parcial.
  - Proyecto con 1 sola fecha.
  - Cancelacion de la fecha por parte del cliente.
- Resultado observado:
  - Proyecto cancelado.
  - Pedido cancelado.
  - Estado de pago del pedido pasa a `Cerrado`.
  - En modulo pagos, el pedido aparece en `Cerrados`.
  - Se visualiza 1 sola boleta (sin NC adicional).
- Visto bueno:
  - Correcto segun las reglas definidas.

### Prueba 2 (Validada OK)
- Escenario:
  - Pedido con pago parcial.
  - Luego se completa el pago y el pedido pasa a `Pagado`.
  - Proyecto con 1 sola fecha.
  - Se cancela el proyecto (por lo tanto se cancela el pedido).
- Resultado observado:
  - Estado de pago cambia de `Pagado` a `Cerrado` al cancelarse.
  - En modulo pagos, el pedido aparece en `Cerrados`.
  - Se visualizan 2 comprobantes (correspondientes a los 2 pagos registrados).
- Visto bueno:
  - Correcto segun las reglas definidas.

### Prueba 3 (Validada OK)
- Escenario:
  - Pedido creado con 2 fechas.
  - Se realiza primer pago.
  - Proyecto inicia.
  - Primer dia se cumple sin problema.
  - Segundo dia se cancela por el cliente.
- Resultado observado:
  - Proyecto se mantiene en `En ejecucion`.
  - Pedido se mantiene en estado de pago `Parcial`.
  - El pedido aparece en filtro `Parciales`.
- Visto bueno:
  - Correcto con la logica actual: la cancelacion parcial de dias no cancela automaticamente todo el proyecto/pedido.

### Prueba 4 (Validada OK)
- Escenario:
  - Pedido con 2 fechas.
  - Se paga en 2 partes hasta estado de pago `Pagado`.
  - Se cancela el proyecto por los 2 dias.
- Resultado observado:
  - Proyecto cancelado.
  - Pedido cancelado.
  - Estado de pago cambia a `Cerrado`.
  - Estado de pedido queda en `Cancelado`.
- Visto bueno:
  - Correcto segun las reglas definidas para cancelacion total con movimiento financiero.

### Prueba 5 (Validada OK)
- Escenario:
  - Pedido creado con 2 dias.
  - Se realiza el primer pago.
  - Luego se cancela el proyecto completo (2 dias), cancelando pedido en automatico.
- Resultado observado:
  - Estado de pago pasa a `Cerrado`.
  - Estado de pedido pasa a `Cancelado`.
  - Se visualiza 1 solo comprobante de pago (el unico pago registrado).
- Visto bueno:
  - Correcto segun las reglas definidas.

### Prueba 6 (Validada OK)
- Escenario:
  - Pedido con 1 fecha.
  - Pago parcial registrado.
  - Cancelacion por problema de la empresa (responsable interno).
- Resultado observado:
  - Proyecto queda `Cancelado`.
  - Pedido queda `Cancelado`.
  - Estado de pago queda `Cerrado`.
  - En pagos/cerrados se visualizan 2 comprobantes:
    - 1 comprobante de pago (`188.80`).
    - 1 nota de credito (`377.60`).
- Visto bueno:
  - Correcto con la logica actual para cancelacion interna (genera NC automatica y cierra flujo financiero).

### Prueba 7 (Validada OK)
- Escenario:
  - Pedido con 1 fecha.
  - 1 pago por el monto completo (estado de pago `Pagado`).
  - Cancelacion por problema de la empresa (problema interno).
- Resultado observado:
  - Proyecto queda `Cancelado`.
  - Pedido queda `Cancelado`.
  - Estado de pago queda `Cerrado`.
  - Se visualizan 2 comprobantes:
    - 1 boleta por el monto completo.
    - 1 nota de credito por el monto completo.
- Visto bueno:
  - Correcto con la logica actual para cancelacion interna de pedidos pagados al 100% (reversion total con NC y cierre financiero).

### Prueba 8 (Validada OK)
- Escenario:
  - Pedido creado con 2 fechas.
  - Se realiza el primer pago parcial.
  - Se inicia el proyecto y se cumple el primer dia.
  - Se realiza el segundo pago.
  - El segundo dia se cancela por problema interno (culpa de la empresa).
- Resultado observado:
  - El pedido se mantiene en `En ejecucion`.
  - El estado de pago se mantiene en `Cerrado`.
  - Se visualizan 3 comprobantes:
    - 2 boletas correspondientes a los 2 pagos realizados.
    - 1 nota de credito por el monto del dia cancelado.
- Visto bueno:
  - Correcto para el modelo operativo/financiero del negocio.
  - Criterio aplicado: puede existir desacople intencional entre estado operativo (`En ejecucion`) y estado financiero (`Cerrado`) cuando los pagos se liquidan antes del evento y la cancelacion es parcial.
