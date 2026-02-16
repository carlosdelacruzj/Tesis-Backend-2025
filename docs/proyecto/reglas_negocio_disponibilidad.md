# Reglas De Negocio - Disponibilidad Operativa

Fecha de vigencia inicial: 15-02-2026
Endpoint principal: `GET /api/v1/pedido/disponibilidad/diaria?fecha=YYYY-MM-DD`

## 1. Objetivo

Este documento define de forma estable:
- como se calcula la disponibilidad diaria,
- que significan los niveles operativos (`ALTA`, `LIMITADA`, `CRITICA`),
- y que reglas deben mantenerse cuando se modifique el backend o frontend.

## 2. Unidad de evaluacion

- La evaluacion es por dia calendario (`YYYY-MM-DD`).
- No se usa rango horario en esta version.

## 3. Estados de pedido que reservan capacidad

Reservan capacidad:
- `Contratado`
- `En ejecucion`

No reservan capacidad:
- Cotizaciones y cualquier estado fuera de la lista anterior.

## 4. Reglas base de capacidad

### 4.1 Personal

- Solo se considera personal operativo de campo (`TiEm_OperativoCampo = 1`).
- El personal se separa en:
- `interno` (equipo propio)
- `freelance` (autonomo)
- Para reserva por rol, se descuenta primero `interno` y luego `freelance`.

### 4.2 Equipos

- Se cuentan equipos en estado `Disponible`.
- Se descuenta reserva por servicio en la fecha consultada.

## 5. Criticidad de recursos

### 5.1 Personal critico

- Todo rol operativo excepto roles que contengan `Asistente`.

### 5.2 Equipos criticos

- Tipos de equipo cuyo nombre contenga:
- `camara`
- `lente`

### 5.3 Equipos secundarios

- Todo tipo de equipo que no sea critico.

## 6. Bloque disponibilidadDia (respuesta API)

El endpoint devuelve:
- `disponibilidadDia.nivel`: `ALTA | LIMITADA | CRITICA`
- `disponibilidadDia.requiereApoyoExterno`: boolean
- `disponibilidadDia.motivos`: lista de mensajes
- `disponibilidadDia.riesgos`:
- `personalCriticoInterno`: `OK | AJUSTADO | INSUFICIENTE`
- `equiposCriticosInternos`: `OK | AJUSTADO | INSUFICIENTE`
- `equiposSecundariosInternos`: `OK | AJUSTADO | INSUFICIENTE`

## 7. Semantica de niveles

- `ALTA`: recursos criticos internos con holgura.
- `LIMITADA`: hay cobertura, pero con margen bajo en criticos o secundarios.
- `CRITICA`: falta disponibilidad interna en recursos criticos; se requiere apoyo externo para operar.

Nota:
- En esta etapa no se usa `NO_DISPONIBLE`; se asume que puede existir contingencia externa.

## 8. Regla de mantenimiento

Cuando se creen o cambien niveles/estados/reglas de disponibilidad:
- actualizar este archivo en la misma tarea,
- registrar la fecha,
- describir impacto en backend y frontend.

## 9. Registro de cambios

- 15-02-2026:
- Se agrega `disponibilidadDia` al endpoint diario.
- Se oficializan niveles `ALTA`, `LIMITADA`, `CRITICA`.
- Se prioriza evaluacion por recursos criticos internos y se usa freelance como apoyo externo.
