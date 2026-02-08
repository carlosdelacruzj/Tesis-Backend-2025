# Reglas De Negocio - Devolucion De Equipos

Fecha de definicion: 2026-02-07

Este documento congela las reglas funcionales para el flujo de devolucion de equipos en proyectos.

## 1. Semantica de campos

- `devuelto` representa retorno fisico del equipo.
- `estadoDevolucion` representa la condicion final del equipo al cerrar la devolucion.

No deben mezclarse ambos conceptos.

## 2. Estados permitidos de devolucion

Valores validos de `estadoDevolucion`:

- `DEVUELTO`
- `DANADO`
- `PERDIDO`
- `ROBADO`

## 3. Consistencia obligatoria entre `devuelto` y `estadoDevolucion`

- `DEVUELTO` -> `devuelto = 1`
- `DANADO` -> `devuelto = 1`
- `PERDIDO` -> `devuelto = 0`
- `ROBADO` -> `devuelto = 0`

Si llega una combinacion distinta, la operacion debe rechazarse con error de validacion.

## 4. Estado operativo del equipo (T_Estado_Equipo)

Al confirmar devolucion:

- `DEVUELTO` -> equipo pasa a `Disponible`
- `DANADO` -> equipo pasa a `En Mantenimiento`
- `PERDIDO` -> equipo pasa a `De baja`
- `ROBADO` -> equipo pasa a `De baja`

## 5. Regla de desasignacion por impacto operativo

Cuando `estadoDevolucion` sea `DANADO`, `PERDIDO` o `ROBADO`:

- el equipo debe desasignarse de asignaciones futuras
- el corte es desde el dia siguiente en adelante
- asignaciones historicas (dias pasados) no se modifican

## 6. Compatibilidad de contratos API

- El contrato actual de devolucion puede mantenerse.
- Las reglas anteriores se aplican por logica de backend.
- Se recomienda exponer un endpoint adicional de preview de impacto para frontend (sin persistencia).

