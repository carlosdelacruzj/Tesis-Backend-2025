const express = require("express");

const router = express.Router();

const jwt = require("jsonwebtoken");

const pool = require("../database");
const { query } = require("../database");

/*
EN ESTA PARTE IRA TODO LO RELACIONADO CON EL PROYECTO 
EJEM:
-   GESTIONAR PROYECTOS
-   ASIGNAR PERSONAL Y EQUIPOS
*/

/**
 * @swagger
 * /proyecto/consulta/getAllProyecto:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/proyecto/consulta/getAllProyecto", (req, res) => {
  const query = "call SP_getAllProyecto()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /proyecto/consulta/getAllAsignarEquipos:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/proyecto/consulta/getAllAsignarEquipos", (req, res) => {
  const sql = "CALL defaultdb.SP_getAllAsignarEquipos()"; // usa 'defaultdb.' si tu pool no fija DB
  pool.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    return res.status(200).json(rows[0]);
  });
});
/**
 * @swagger
 * /empleado/consulta/getAllEmpleados:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - empleado
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/empleado/consulta/getAllEmpleados", (req, res) => {
  const query = "CALL defaultdb.SP_getAllEmpleados()"; // <-- o sin 'defaultdb.' si el pool ya apunta ahí
  pool.query(query, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error', detail: err.code });
    return res.status(200).json(rows[0]);
  });
});

/**
 * @swagger
 * /equipo/consulta/getAllTipoEquipo:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/equipo/consulta/getAllTipoEquipo", (req, res) => {
  const query = "call SP_getAllTipoEquipo()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /equipo/consulta/getAllEquipo:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/equipo/consulta/getAllEquipo", (req, res) => {
  const query = "call SP_getAllEquipos()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /equipo/consulta/getByTipoEquipo/{idTipoEquipo}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    parameters:
 *    - in: path
 *      name: idTipoEquipo
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/equipo/consulta/getByTipoEquipo/:idTipoEquipo", (req, res) => {
  const { idTipoEquipo } = req.params;
  const query = "call SP_getByTipoEquipo(?)";

  pool.query(query, [idTipoEquipo], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /proyecto/consulta/getByIdProyecto/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    parameters:
 *    - in: path
 *      name: id
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
// GET /proyecto/consulta/getByIdProyecto/:id
router.get("/proyecto/consulta/getByIdProyecto/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Parámetro id inválido" });
  }

  const sql = "CALL defaultdb.SP_getByIdProyecto(?)"; // quita 'defaultdb.' si tu pool ya apunta allí
  pool.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    const item = rows?.[0]?.[0];
    if (!item) return res.status(404).json({ message: "Proyecto no encontrado" });
    return res.status(200).json(item);
  });
});
/**
 * @swagger
 * /proyecto/registro/postProyecto:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    parameters:
 *    - in: body
 *      name: proyecto
 *      description: datos del proyecto
 *      schema:
 *        type: object
 *        required:
 *          - proyecto_nombre
 *        properties:
 *          proyecto_nombre:
 *              type: string
 *          codigo_pedido:
 *              type: integer
 *          fecha_inicio_edicion:
 *              type: string
 *              format: date-time
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/proyecto/registro/postProyecto", (req, res) => {
  const { proyecto_nombre, codigo_pedido, fecha_inicio_edicion } = req.body;

  // Enviar fecha como 'YYYY-MM-DD' (no ISO con 'Z')
  const sql = "CALL defaultdb.SP_postProyecto(?,?,?)";

  pool.query(sql, [proyecto_nombre, codigo_pedido, fecha_inicio_edicion], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error al registrar proyecto", detail: err.code });
    return res.status(201).json({ Status: "Registro exitoso", result: rows?.[0]?.[0] });
  });
});
/**
 * @swagger
 * /proyecto/actualiza/putProyectoById:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    parameters:
 *    - in: body
 *      name: proyecto
 *      description: proyecto
 *      schema:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          finFecha:
 *            type: string
 *            format: date-time
 *          multimedia:
 *            type: integer
 *          edicion:
 *            type: integer
 *          enlace:
 *            type: string
 *          Observacion:
 *            type: string
 *          id:
 *            type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/proyecto/actualiza/putProyectoById", (req, res) => {
  const { finFecha, multimedia, edicion, enlace, id } = req.body;

  const sql = "CALL defaultdb.SP_putProyectoById(?,?,?,?,?)";
  pool.query(sql, [finFecha, multimedia, edicion, enlace, id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Error al actualizar proyecto", detail: err.code });
    }
    const result = rows?.[0]?.[0];
    if (!result || result.rowsAffected === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }
    return res.status(200).json({ Status: "Actualización exitosa", result });
  });
});

// EN ESTA PARTE SE VE TODO ACERCA DEL PEDIDO

/*
EN ESE DOCUMENTO IRA TODO LO RELACIONADO CON EL PEDIDO 
EJEM:
-   GESTIONAR PEDIDO
*/

/**
 * @swagger
 * /pedido/consulta/getAllPedido:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - pedido
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/pedido/consulta/getAllPedido", (req, res) => {
  const query = "call SP_getAllPedido()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

// EN ESTA PARTE SE VE TODO ACERCA DEL PEDIDO

/**
 * @swagger
 * /pedido/consulta/getIndexPedido:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - pedido
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/pedido/consulta/getIndexPedido", (req, res) => {
  const query = "call SP_getIndexPedido()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /eventos/consulta/getAllEventos:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - eventos
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/eventos/consulta/getAllEventos", (req, res) => {
  const query = "call SP_getAllEventos()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /eventos_servicios/consulta/getAllServiciosByEvento:
 *   get:
 *     tags: [eventos_servicios]
 *     summary: Lista servicios por evento (opcional)
 *     parameters:
 *       - in: query
 *         name: evento
 *         required: false
 *         schema:
 *           type: integer
 *         description: Id del evento; si se omite, devuelve todos
 *     responses:
 *       '200': { description: OK }
 */
router.get(
  "/eventos_servicios/consulta/getAllServiciosByEvento",
  (req, res) => {
    const { evento } = req.query;
    const query = "CALL SP_getAllServiciosByEvento(?)";
    const pEvento = (evento === undefined || evento === "" || evento === "undefined") ? null : Number(evento);

    pool.query(query, [pEvento], (err, rows) => {
      if (err) return res.status(500).json({ message: "Error", detail: err.code });
      res.status(200).json(rows?.[0] ?? []);
    });
  }
);

/**
 * @swagger
 * /eventos_servicios/consulta/getAllServiciosByEventoServ/{evento}/{serv}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - eventos_servicios
 *    parameters:
 *    - in: path
 *      name: evento
 *      required: false
 *      type: integer
 *    - in: path
 *      name: serv
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/eventos_servicios/consulta/getAllServiciosByEventoServ/:evento?/:serv?",
  (req, res) => {
    const { evento, serv } = req.params;
    const sql = "CALL SP_getAllServiciosByEventoServ(?, ?)";

    const pEvento = (evento === undefined || evento === "undefined" || evento === "") 
      ? null 
      : Number(evento);
    const pServ   = (serv   === undefined || serv   === "undefined" || serv   === "") 
      ? null 
      : Number(serv);

    pool.query(sql, [pEvento, pServ], (err, rows) => {
      if (err) return res.status(500).json({ message: "Error", detail: err.code });
      res.status(200).json(rows?.[0] ?? []);
    });
  }
);
/**
 * @swagger
 * /pedido/consulta/getByIDPedido/{id}:
 *  get:
 *    tags: [pedido]
 *    summary: Obtiene un pedido por su ID
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      '200': { description: OK }
 *      '400': { description: Parámetro inválido }
 *      '404': { description: Pedido no encontrado }
 *      '500': { description: Error interno }
 */
router.get("/pedido/consulta/getByIDPedido/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Parámetro id inválido" });
  }

  const sql = "CALL defaultdb.SP_getByIDPedido(?)"; // o sin "defaultdb." si tu pool ya apunta ahí
  pool.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    // rows[0] será [] si no hay pedido
    if (!rows?.[0]?.length) return res.status(404).json({ message: "Pedido no encontrado" });
    return res.status(200).json(rows[0][0]); // uno solo por ID
  });
});

/**
 * @swagger
 * /cliente/consulta/getDataCliente/{doc}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - cliente
 *    parameters:
 *    - in: path
 *      name: doc
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/cliente/consulta/getDataCliente/:doc", (req, res) => {
  const { doc } = req.params;
  const query = "call SP_getDataCliente(?)";

  pool.query(query, [doc], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /pedido/consulta/getLastEstadoPedido:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - pedido
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/pedido/consulta/getLastEstadoPedido", (_req, res) => {
  const sql = "CALL defaultdb.SP_getLastEstadoPedido()"; // o sin defaultdb si el pool ya apunta ahí
  pool.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    return res.status(200).json(rows[0][0]); // solo 1 registro
  });
});
/**
 * @swagger
 * /proyecto/consulta/getAllPedidosContratado:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/proyecto/consulta/getAllPedidosContratado", (_req, res) => {
  const sql = "CALL defaultdb.SP_getAllPedidosContratado()";
  pool.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    return res.status(200).json(rows[0]);
  });
});

/**
 * @swagger
 * /servicio/consulta/getAllServicios:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - servicio
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/servicio/consulta/getAllServicios", (req, res) => {
  const query = "call SP_getAllServicios()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /eventos_servicios/registro/postEventoxServicio:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - eventos_servicios
 *    parameters:
 *    - in: body
 *      name: eventos_servicios
 *      description: datos del eventos_servicios
 *      schema:
 *        type: object
 *        required:
 *          - servicio
 *        properties:
 *          servicio:
 *              type: integer
 *          evento:
 *              type: integer
 *          precio:
 *              type: integer
 *          descripcion:
 *              type: string
 *          titulo:
 *              type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/eventos_servicios/registro/postEventoxServicio", async (req, res) => {
  const { servicio, evento, precio, descripcion, titulo } = req.body;

  const sql = "CALL SP_postEventoxServicio(?,?,?,?,?)";
  const pServicio = Number(servicio);
  const pEvento   = Number(evento);
  const pPrecio   = Number(precio); // si viene decimal, asegúrate que no sea NaN

  pool.query(sql, [pServicio, pEvento, pPrecio, descripcion || null, titulo || null], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.sqlMessage || err.code });
    res.status(201).json({ Status: "Registro exitoso", insertedId: rows?.[0]?.[0]?.PK_ExS_Cod });
  });
});

/**
 * @swagger
 * /pedido/registro/postPedido:
 *  post:
 *    consumes:
 *      - application/json
 *    tags:
 *      - pedido
 *    summary: Registra un nuevo pedido
 *    description: Crea un pedido usando Evento-Servicio, DNI del cliente y datos básicos del evento.
 *    parameters:
 *      - in: body
 *        name: pedido
 *        description: Datos requeridos para crear un pedido
 *        schema:
 *          type: object
 *          required:
 *            - ExS
 *            - doc
 *            - fechaCreate
 *            - fechaEvent
 *            - horaEvent
 *            - CodEmp
 *            - Direccion
 *          properties:
 *            ExS:
 *              type: integer
 *              example: 1
 *              description: ID de T_EventoServicio (PK_ExS_Cod)
 *            doc:
 *              type: string
 *              example: "47651234"
 *              description: DNI del cliente (T_Usuario.U_Numero_Documento)
 *            fechaCreate:
 *              type: string
 *              format: date
 *              example: "2025-09-09"
 *              description: Fecha de creación (YYYY-MM-DD)
 *            fechaEvent:
 *              type: string
 *              format: date
 *              example: "2025-10-12"
 *              description: Fecha del evento (YYYY-MM-DD)
 *            horaEvent:
 *              type: string
 *              format: time
 *              example: "16:30:00"
 *              description: Hora del evento (HH:mm:ss)
 *            CodEmp:
 *              type: integer
 *              example: 1
 *              description: ID del empleado asignado (T_Empleados.PK_Em_Cod)
 *            Direccion:
 *              type: string
 *              example: "Casa Prado, Miraflores"
 *              description: Lugar del evento (P_Lugar)
 *    responses:
 *      '201':
 *        description: Registro exitoso
 *        schema:
 *          type: object
 *          properties:
 *            status:
 *              type: string
 *              example: "Registro exitoso"
 *            result:
 *              type: object
 *              properties:
 *                pedidoId:
 *                  type: integer
 *                  example: 42
 *      '400':
 *        description: Petición inválida (datos faltantes o con formato incorrecto)
 *      '404':
 *        description: Cliente no encontrado para el DNI
 *      '500':
 *        description: Error interno
 */
router.post("/pedido/registro/postPedido", (req, res) => {
  const { ExS, doc, fechaCreate, fechaEvent, horaEvent, CodEmp, Direccion } = req.body;

  // ⚠️ Formatos: 'YYYY-MM-DD' y 'HH:mm:ss'
  const q = "CALL defaultdb.SP_postPedido(?,?,?,?,?,?,?)";
  pool.query(q, [ExS, doc, fechaCreate, fechaEvent, horaEvent, CodEmp, Direccion], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error al registrar pedido', detail: err.code });
    return res.status(201).json({ status: 'Registro exitoso', result: rows?.[0]?.[0] });
  });
});
/**
 * @swagger
 * /eventos_servicios/actualiza/putByIdEventoxServicio:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - eventos_servicios
 *    parameters:
 *    - in: body
 *      name: evento_servicio
 *      description: Actualiza un registro de la tabla T_EventoServicio
 *      schema:
 *        type: object
 *        required:
 *          - id           # **PK_ExS_Cod**
 *        properties:
 *          servicio:      # **FK -> PK_S_Cod**
 *            type: integer
 *            example: 2
 *          precio:        # **ExS_Precio**
 *            type: number
 *            format: float
 *            example: 199.99
 *          concepto:      # **ExS_Descripcion**
 *            type: string
 *            example: "Cobertura extendida con álbum"
 *          id:            # **PK_ExS_Cod**
 *            type: integer
 *            example: 1
 *    responses:
 *      '200':
 *        description: Actualización exitosa
 */
router.put(
  "/eventos_servicios/actualiza/putByIdEventoxServicio",
  async (req, res) => {
    try {
      const { servicio, precio, concepto, id } = req.body;

      // Normalización: undefined / "" -> null; numéricos válidos -> Number
      const pServicio = (servicio === "" || servicio === undefined) ? null : Number(servicio);
      const pPrecio   = (precio   === "" || precio   === undefined) ? null : Number(precio);
      const pConcepto = (concepto === "" || concepto === undefined) ? null : String(concepto);
      const pId       = (id       === "" || id       === undefined) ? null : Number(id);

      if (pId === null || Number.isNaN(pId)) {
        return res.status(400).json({ message: "El campo 'id' (PK_ExS_Cod) es obligatorio y debe ser numérico." });
      }

      const query = "CALL SP_putByIdEventoxServicio(?,?,?,?)";

      pool.query(query, [pServicio, pPrecio, pConcepto, pId], (err, rows) => {
        if (err) {
          return res.status(500).json({ message: "Error en BD", detail: err.code || err.message });
        }
        // Podrías chequear filas afectadas si tu driver lo expone,
        // pero en procedures suele no venir directo.
        res.status(200).json({ Status: "Actualización exitosa" });
      });
    } catch (e) {
      res.status(500).json({ message: "Error interno", detail: e.message });
    }
  }
);
/**
 * @swagger
 * /pedido/actualiza/putByIdPedido:
 *  put:
 *    consumes:
 *      - application/json
 *    tags:
 *      - pedido
 *    summary: Actualiza un pedido por su ID
 *    parameters:
 *      - in: body
 *        name: pedido
 *        description: Campos actualizables del pedido
 *        schema:
 *          type: object
 *          required:
 *            - id
 *            - estadoPedido
 *            - fechaEvent
 *            - horaEvent
 *            - lugar
 *            - empleado
 *            - estadoPago
 *          properties:
 *            id:
 *              type: integer
 *              example: 1
 *              description: PK del pedido (PK_P_Cod)
 *            estadoPedido:
 *              type: integer
 *              example: 2
 *              description: Estado del pedido (FK_EP_Cod)
 *            fechaEvent:
 *              type: string
 *              format: date
 *              example: "2025-10-12"
 *              description: Fecha del evento (YYYY-MM-DD)
 *            horaEvent:
 *              type: string
 *              format: time
 *              example: "16:30:00"
 *              description: Hora del evento (HH:mm:ss)
 *            lugar:
 *              type: string
 *              example: "Casa Prado, Miraflores"
 *              description: Lugar del evento (P_Lugar)
 *            empleado:
 *              type: integer
 *              example: 1
 *              description: Empleado asignado (FK_Em_Cod)
 *            estadoPago:
 *              type: integer
 *              example: 1
 *              description: Estado de pago (FK_ESP_Cod)
 *    responses:
 *      '200':
 *        description: Actualización exitosa
 *      '400':
 *        description: Petición inválida
 *      '404':
 *        description: Pedido no encontrado
 *      '500':
 *        description: Error interno
 */
router.put("/pedido/actualiza/putByIdPedido", (req, res) => {
  const {
    id,             // PK_P_Cod
    estadoPedido,   // FK_EP_Cod
    fechaEvent,     // 'YYYY-MM-DD'
    horaEvent,      // 'HH:mm:ss'
    lugar,          // P_Lugar
    empleado,       // FK_Em_Cod
    estadoPago      // FK_ESP_Cod
  } = req.body;

  const sql = "CALL defaultdb.SP_putByIdPedido(?,?,?,?,?,?,?)";
  pool.query(sql, [id, estadoPedido, fechaEvent, horaEvent, lugar, empleado, estadoPago], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar pedido', detail: err.code });
    return res.status(200).json({ status: "Actualización exitosa", result: rows?.[0]?.[0] });
  });
});
/**
 * @swagger
 * /proyecto/consulta/getAsignarEquiposById/{id}:
 *  get:
 *    tags: [proyecto]
 *    summary: Lista asignaciones de equipo por proyecto
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      '200': { description: OK }
 *      '400': { description: Parámetro inválido }
 *      '404': { description: Sin asignaciones }
 *      '500': { description: Error interno }
 */
router.get("/proyecto/consulta/getAsignarEquiposById/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Parámetro id inválido" });
  }

  const sql = "CALL defaultdb.SP_getAsignarEquiposById(?)";
  pool.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    const data = rows?.[0] ?? [];
    if (!data.length) return res.status(404).json({ message: "Sin asignaciones para este proyecto" });
    return res.status(200).json(data);
  });
});

/**
 * @swagger
 * /proyecto/actualiza/putByIdAsignarPersonalEquipo:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    parameters:
 *    - in: body
 *      name: proyecto
 *      description: proyecto
 *      schema:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          id:
 *            type: integer
 *          empleado:
 *            type: integer
 *          equipo:
 *            type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/proyecto/actualiza/putByIdAsignarPersonalEquipo", (req, res) => {
  const { id, empleado, equipo } = req.body;

  // valida básico
  if (!Number.isInteger(Number(id)) || !Number.isInteger(Number(empleado)) || !equipo) {
    return res.status(400).json({ message: "Parámetros inválidos" });
  }

  const sql = "CALL defaultdb.SP_putByIdAsignarPersonalEquipo(?,?,?)";
  pool.query(sql, [id, empleado, equipo], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    const r = rows?.[0]?.[0];
    if (!r || r.rowsAffected === 0) return res.status(404).json({ message: "Asignación no encontrada" });
    return res.status(200).json({ status: "Actualización exitosa", result: r });
  });
});

/**
 * @swagger
 * /proyecto/registro/postAsignarPersonalEquipo:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    parameters:
 *    - in: body
 *      name: proyecto
 *      description: datos del proyecto
 *      schema:
 *        type: object
 *        required:
 *          - proyecto
 *        properties:
 *          proyecto:
 *              type: integer
 *          empleado:
 *              type: integer
 *          equipos:
 *              type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/proyecto/registro/postAsignarPersonalEquipo", (req, res) => {
  const { proyecto, empleado, equipos } = req.body; // 'equipos' = un código, ej. "CAM-0002"

  if (!Number.isInteger(Number(proyecto)) ||
      !Number.isInteger(Number(empleado)) ||
      !equipos) {
    return res.status(400).json({ message: "Parámetros inválidos" });
  }

  const sql = "CALL defaultdb.SP_postAsignarPersonalEquipo(?,?,?)";
  pool.query(sql, [proyecto, empleado, equipos], (err, rows) => {
    if (err) {
      // ER_NO_REFERENCED_ROW_2 = FK inválida (proyecto/empleado/equipo no existe)
      return res.status(500).json({ message: "Error", detail: err.code });
    }
    return res.status(201).json({ Status: "Registro exitoso", result: rows?.[0]?.[0] });
  });
});
/**
 * @swagger
 * /proyecto/consulta/getAllEventosProyectos:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/proyecto/consulta/getAllEventosProyectos", (_req, res) => {
  const sql = "CALL defaultdb.SP_getAllEventosProyectos()"; // usa defaultdb si el pool no apunta a esa DB
  pool.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    return res.status(200).json(rows[0]);
  });
});
/**
 * @swagger
 * /contrato/consulta/getAllContratos:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - contrato
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/contrato/consulta/getAllContratos", (req, res) => {
  const query = "call SP_getAllContratos()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /proyecto/delete/deleteAsignarEquipoById/{id}:
 *  delete:
 *    tags: [proyecto]
 *    summary: Elimina una asignación de equipo por id
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: integer
 *        example: 3
 *    responses:
 *      '200': { description: Eliminado }
 *      '400': { description: Parámetro inválido }
 *      '404': { description: No encontrado }
 *      '500': { description: Error interno }
 */
router.delete("/proyecto/delete/deleteAsignarEquipoById/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Parámetro id inválido" });
  }

  const sql = "CALL defaultdb.SP_deleteAsignarEquipoById(?)"; // quita defaultdb. si tu pool ya apunta ahí
  pool.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });

    const r = rows?.[0]?.[0];
    if (!r || r.rowsAffected === 0) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }
    return res.status(200).json({ status: "Eliminada", result: r });
  });
});
/**
 * @swagger
 * /proyecto/consulta/getAllEquiposFiltrados:
 *  get:
 *    tags: [proyecto]
 *    summary: Lista equipos filtrados (parámetros opcionales)
 *    parameters:
 *      - in: query
 *        name: fecha
 *        required: false
 *        type: string
 *        format: date
 *        example: 2025-09-11
 *      - in: query
 *        name: proyecto
 *        required: false
 *        type: integer
 *        example: 1
 *      - in: query
 *        name: idTipoEquipo
 *        required: false
 *        type: integer
 *        example: 2
 *    responses:
 *      '200': { description: OK }
 */
router.get("/proyecto/consulta/getAllEquiposFiltrados", (req, res) => {
  const { fecha, proyecto, idTipoEquipo } = req.query;
  const sql = "CALL defaultdb.SP_getAllEquiposFiltrados(?,?,?)";
  const pFecha = fecha ? fecha.slice(0,10) : null;
  const pProy  = proyecto ? Number(proyecto) : null;
  const pTipo  = idTipoEquipo ? Number(idTipoEquipo) : null;

  pool.query(sql, [pFecha, pProy, pTipo], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    res.status(200).json(rows?.[0] ?? []);
  });
});
/**
 * @swagger
 * /mobile/consulta/getAllEventosTodayByEmpl/{fecha}/{idEmpleado}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: fecha
 *      required: false
 *      type: string
 *      format: date-time
 *    - in: path
 *      name: idEmpleado
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/mobile/consulta/getAllEventosTodayByEmpl/:fecha/:idEmpleado",
  (req, res) => {
    const { fecha, idEmpleado } = req.params;
    const query = "call SP_getAllEventosTodayByEmpl(?,?)";

    pool.query(query, [fecha, idEmpleado], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /mobile/consulta/getAllEventosMonthByEmpl/{fecha}/{idEmpleado}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: fecha
 *      required: false
 *      type: string
 *      format: date-time
 *    - in: path
 *      name: idEmpleado
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/mobile/consulta/getAllEventosMonthByEmpl/:fecha/:idEmpleado",
  (req, res) => {
    const { fecha, idEmpleado } = req.params;
    const query = "call SP_getAllEventosMonthByEmpl(?,?)";

    pool.query(query, [fecha, idEmpleado], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /mobile/consulta/getAllEquiposPendientes/{fecha}/{idEmpleado}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: fecha
 *      required: false
 *      type: string
 *      format: date-time
 *    - in: path
 *      name: idEmpleado
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/mobile/consulta/getAllEquiposPendientes/:fecha/:idEmpleado",
  (req, res) => {
    const { fecha, idEmpleado } = req.params;
    const query = "call SP_getAllEquiposPendientes(?,?)";

    pool.query(query, [fecha, idEmpleado], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /mobile/consulta/getAllEventosProgramadosByEmpl/{fecha}/{idEmpleado}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: fecha
 *      required: false
 *      type: string
 *      format: date-time
 *    - in: path
 *      name: idEmpleado
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/mobile/consulta/getAllEventosProgramadosByEmpl/:fecha/:idEmpleado",
  (req, res) => {
    const { fecha, idEmpleado } = req.params;
    const query = "call SP_getAllEventosProgramadosByEmpl(?,?)";

    pool.query(query, [fecha, idEmpleado], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /mobile/consulta/getIniciarSecionTrabajador/{correo}/{pass}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: correo
 *      required: false
 *      type: string
 *      format: email
 *    - in: path
 *      name: pass
 *      required: false
 *      type: string
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/mobile/consulta/getIniciarSecionTrabajador/:correo/:pass",
  (req, res) => {
    const { correo, pass } = req.params;
    const query = "call SP_getIniciarSecionTrabajador(?,?)";

    pool.query(query, [correo, pass], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /eventos_servicios/consulta/getEventoxServicioById/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - eventos_servicios
 *    parameters:
 *    - in: path
 *      name: id
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/eventos_servicios/consulta/getEventoxServicioById/:id",
  (req, res) => {
    const { id } = req.params;
    const query = "call SP_getEventoxServicioById(?)";

    pool.query(query, [id], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /mobile/consulta/getProyectoDetail/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: id
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/mobile/consulta/getProyectoDetail/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getProyectoDetail(?)";

  pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /proyecto/consulta/getAllEventosProyectoById/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    parameters:
 *    - in: path
 *      name: id
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/proyecto/consulta/getAllEventosProyectoById/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getAllEventosProyectoById(?)";

  pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /equipo/consulta/getAllEquiposByIdGroup/{tipoEquipo}/{marca}/{modelo}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    parameters:
 *    - in: path
 *      name: tipoEquipo
 *      required: false
 *      type: integer
 *    - in: path
 *      name: marca
 *      required: false
 *      type: integer
 *    - in: path
 *      name: modelo
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/equipo/consulta/getAllEquiposByIdGroup/:tipoEquipo/:marca/:modelo",
  (req, res) => {
    const norm = (v) =>
      v === undefined || v === null || v === "" || v === "undefined" || v === "null"
        ? null
        : Number(v);

    const tipo   = norm(req.params.tipoEquipo);
    const marca  = norm(req.params.marca);
    const modelo = norm(req.params.modelo);

    const sql = "CALL SP_getAllEquiposByIdGroup(?,?,?)";

    pool.query(sql, [tipo, marca, modelo], (err, rows) => {
      if (err) return res.status(500).json({ message: "Error", detail: err.code });
      res.status(200).json(rows?.[0] ?? []);
    });
  }
);

/**
 * @swagger
 * /equipo/consulta/getAllEquiposGroup:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/equipo/consulta/getAllEquiposGroup", (req, res) => {
  const query = "call SP_getAllEquiposGroup()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /equipo/consulta/getAllMarca:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/equipo/consulta/getAllMarca", (req, res) => {
  const query = "call SP_getAllMarca()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /equipo/consulta//{marca}/{tipo}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    parameters:
 *    - in: path
 *      name: marca
 *      required: false
 *      type: integer
 *    - in: path
 *      name: tipo
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/equipo/consulta/getAllModelo/:marca/:tipo", (req, res) => {
  const query = "CALL SP_getAllModelo(?,?)";
  const { marca, tipo } = req.params;

  // Normaliza: "undefined" o "" -> null; números válidos -> Number
  const pMarca = (marca === "undefined" || marca === "") ? null : Number(marca);
  const pTipo  = (tipo  === "undefined" || tipo  === "") ? null : Number(tipo);

  pool.query(query, [pMarca, pTipo], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    res.status(200).json(rows?.[0] ?? []);
  });
});
/**
 * @swagger
 * /equipo/registro/postEquipo:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    parameters:
 *    - in: body
 *      name: equipo
 *      description: datos del equipo
 *      schema:
 *        type: object
 *        required:
 *          - idEquipo
 *        properties:
 *          idEquipo:
 *              type: string
 *          fecha:
 *              type: string
 *              format: date-time
 *          modelo:
 *              type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/equipo/registro/postEquipo", async (req, res) => {
  const { idEquipo, fecha, modelo } = req.body;
  const query = "call SP_postEquipo(?,?,?)";

  pool.query(query, [idEquipo, fecha, modelo], (err, _rows, fields) => {
    if (!err) {
      res.status(201).json({ Status: "Registro exitoso" });
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /empleado/consulta/getAllEmpleadosDisponible/{idProyecto}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - empleado
 *    parameters:
 *    - in: path
 *      name: idProyecto
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/empleado/consulta/getAllEmpleadosDisponible/:idProyecto",
  (req, res) => {
    const { idProyecto } = req.params;
    const query = "call SP_getAllEmpleadosDisponible(?)";

    pool.query(query, [idProyecto], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /empleado/consulta/getAllEmpleadosList:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - empleado
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/empleado/consulta/getAllEmpleadosList", (req, res) => {
  const query = "CALL defaultdb.SP_getAllEmpleadosList()"; // o quita 'defaultdb.' si tu pool ya usa esa DB
  pool.query(query, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error', detail: err.code });
    res.status(200).json(rows[0]);
  });
});

/**
 * @swagger
 * /empleado/consulta/getEmpleadoByID/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - empleado
 *    parameters:
 *    - in: path
 *      name: id
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/empleado/consulta/getEmpleadoByID/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getEmpleadoByID(?)";

  pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /empleado/registro/postEmpleado:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - empleado
 *    parameters:
 *    - in: body
 *      name: empleado
 *      description: datos del empleado
 *      schema:
 *        type: object
 *        required:
 *          - nombre
 *        properties:
 *          nombre:
 *              type: string
 *          apellido:
 *              type: string
 *          correo:
 *              type: string
 *          celular:
 *              type: string
 *          doc:
 *              type: string
 *          direccion:
 *              type: string
 *          autonomo:
 *              type: integer
 *          cargo:
 *              type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/empleado/registro/postEmpleado", async (req, res) => {
  const { nombre, apellido, correo, celular, doc, direccion, autonomo, cargo } =
    req.body;

  const query = "call SP_postEmpleado(?,?,?,?,?,?,?,?)";

  pool.query(
    query,
    [nombre, apellido, correo, celular, doc, direccion, autonomo, cargo],
    (err, _rows, fields) => {
      if (!err) {
        res.status(201).json({ Status: "Registro exitoso" });
      } else {
        res.json(err);
      }
    }
  );
});

//

/**
 * @swagger
 * /empleado/consulta/getAllCargo:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - empleado
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/empleado/consulta/getAllCargo", (req, res) => {
  const query = "call SP_getAllCargo()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /voucher/consulta/getAllPedidoVoucher/{idEstado}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - voucher
 *    parameters:
 *    - in: path
 *      name: idEstado
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/voucher/consulta/getAllPedidoVoucher/:idEstado", (req, res) => {
  const { idEstado } = req.params;
  const query = "call SP_getAllPedidoVoucher(?)";

  pool.query(query, [idEstado], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /voucher/consulta/getAllVoucherByPedido/{idPedido}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - voucher
 *    parameters:
 *    - in: path
 *      name: idPedido
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/voucher/consulta/getAllVoucherByPedido/:idPedido", (req, res) => {
  const { idPedido } = req.params;
  const query = "call SP_getAllVoucherByPedido(?)";

  pool.query(query, [idPedido], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /voucher/consulta/getVoucherByPedido/{idPedido}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - voucher
 *    parameters:
 *    - in: path
 *      name: idPedido
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/voucher/consulta/getVoucherByPedido/:idPedido", (req, res) => {
  const { idPedido } = req.params;
  const query = "call SP_getVoucherByPedido(?)";

  pool.query(query, [idPedido], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /voucher/registro/postVoucher:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - voucher
 *    parameters:
 *    - in: body
 *      name: voucher
 *      description: datos del voucher
 *      schema:
 *        type: object
 *        required:
 *          - monto
 *        properties:
 *          monto:
 *              type: number
 *              format: double
 *          metodoPago:
 *              type: integer
 *          estadoVoucher:
 *              type: integer
 *          imagen:
 *              type: string
 *          idPedido:
 *              type: integer
 *          fechaRegistro:
 *              type: string
 *              format: date
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/voucher/registro/postVoucher", async (req, res) => {
  const { monto, metodoPago, estadoVoucher, imagen, idPedido, fechaRegistro } =
    req.body;

  const query = "call SP_postVoucher(?,?,?,?,?,?)";

  pool.query(
    query,
    [monto, metodoPago, estadoVoucher, imagen, idPedido, fechaRegistro],
    (err, _rows, fields) => {
      if (!err) {
        res.status(201).json({ Status: "Registro exitoso" });
      } else {
        res.json(err);
      }
    }
  );
});

/**
 * @swagger
 * /voucher/consulta/getAllMetodoPago:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - voucher
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/voucher/consulta/getAllMetodoPago", (req, res) => {
  const query = "call SP_getAllMetodoPago()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /voucher/consulta/getAllEstadoVoucher:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - voucher
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/voucher/consulta/getAllEstadoVoucher", (req, res) => {
  const query = "call SP_getAllEstadoVoucher()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /contrato/consulta/getAllContratosByPedido/{pedido}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - contrato
 *    parameters:
 *    - in: path
 *      name: pedido
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/contrato/consulta/getAllContratosByPedido/:pedido", (req, res) => {
  const { pedido } = req.params;
  const query = "call SP_getAllContratosByPedido(?)";

  pool.query(query, [pedido], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /empleado/actualiza/putEmpleadoById:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - empleado
 *    parameters:
 *    - in: body
 *      name: empleado
 *      description: empleado
 *      schema:
 *        type: object
 *        required:
 *          - ID
 *        properties:
 *          ID:
 *            type: integer
 *          Celular:
 *            type: string
 *          Correo:
 *            type: string
 *          Direccion:
 *            type: string
 *          Estado:
 *            type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/empleado/actualiza/putEmpleadoById", (req, res) => {
  const { ID, Celular, Correo, Direccion, Estado } = req.body;
  pool.query(
    "CALL defaultdb.SP_putEmpleadoById(?,?,?,?,?)",
    [ID, Celular, Correo, Direccion, Estado],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error al actualizar empleado', detail: err.code });
      return res.status(200).json({ status: "Actualización exitosa", result: rows?.[0]?.[0] });
    }
  );
});
/**
 * @swagger
 * /equipo/actualiza/putEstadoEquipo:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    parameters:
 *    - in: body
 *      name: equipo
 *      description: Actualizar el estado de un equipo
 *      schema:
 *        type: object
 *        required:
 *          - idEquipo
 *        properties:
 *          idEquipo:
 *            type: string
 *            example: "CAM-0001"
 *          estado:
 *            type: integer
 *            description: Estado nuevo (1=Disponible, 2=En uso, 3=Mantenimiento). Opcional; si no se envía, el SP hace toggle.
 *            example: 2
 *    responses:
 *      '200':
 *        description: Estado actualizado correctamente
 *      '400':
 *        description: Error en parámetros
 *      '500':
 *        description: Error en servidor o base de datos
 */
// PUT /equipo/actualiza/putEstadoEquipo
router.put("/equipo/actualiza/putEstadoEquipo", (req, res) => {
  const { idEquipo, estado } = req.body;           // OJO: idEquipo es STRING (CAM-0001)
  if (!idEquipo) return res.status(400).json({ message: "idEquipo requerido" });

  // Si no mandan estado, puedes fallar o delegar al toggle:
  if (estado === undefined || estado === null) {
    return res.status(400).json({ message: "estado requerido (1,2,3) o usa el endpoint toggle" });
  }
  const pEstado = Number(estado);
  if (![1,2,3].includes(pEstado)) {
    return res.status(400).json({ message: "estado inválido (use 1,2,3)" });
  }

  const sql = "CALL SP_putEstadoEquipo(?,?)";
  pool.query(sql, [idEquipo, pEstado], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.sqlMessage || err.code });
    res.status(200).json(rows?.[0]?.[0] ?? { status: "OK" });
  });
});

/**
 * @swagger
 * /equipo/consulta/getAllContadoresEquiposEstado/{idModelo}:
 *  get:
 *    tags: [equipo]
 *    summary: Contadores de equipos por estado (opcional por modelo)
 *    parameters:
 *      - in: path
 *        name: idModelo
 *        required: false
 *        type: integer
 *        description: ID del modelo (null para todos)
 *        example: 1
 *    responses:
 *      '200': { description: OK }
 *      '500': { description: Error de servidor }
 */
router.get(
  "/equipo/consulta/getAllContadoresEquiposEstado/:idModelo?",
  (req, res) => {
    const { idModelo } = req.params;
    const pModelo =
      !idModelo || idModelo === "undefined" || idModelo === ""
        ? null
        : Number(idModelo);

    const sql = "CALL SP_getAllContadoresEquiposEstado(?)";

    pool.query(sql, [pModelo], (err, rows) => {
      if (err) return res.status(500).json({ message: "Error", detail: err.code });
      res.status(200).json(rows?.[0] ?? []);
    });
  }
);

/**
 * @swagger
 * /equipo/consulta/getExistEquipo/{numSerie}:
 *   get:
 *     tags: [equipo]
 *     summary: Verifica si existe un equipo por número de serie
 *     parameters:
 *       - in: path
 *         name: numSerie
 *         required: true
 *         schema:
 *           type: string
 *         description: Código/serie del equipo (ej. CAM-0001)
 *     responses:
 *       '200':
 *         description: OK (existsFlag 0/1)
 */
router.get("/equipo/consulta/getExistEquipo/:numSerie", (req, res) => {
  const { numSerie } = req.params;
  const query = "CALL defaultdb.SP_getExistEquipo(?)"; // <— con prefijo si aplica

  pool.query(query, [numSerie], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error", detail: err.code });
    // rows[0] tendrá [{ existsFlag: 0|1 }]
    res.status(200).json(rows?.[0]?.[0] ?? { existsFlag: 0 });
  });
});

/**
 * @swagger
 * /cliente/consulta/getAllCliente:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - cliente
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/cliente/consulta/getAllCliente", (req, res) => {
  const query = "call SP_getAllClientes()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /cliente/registro/postCliente:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - cliente
 *    parameters:
 *    - in: body
 *      name: cliente
 *      description: datos del cliente
 *      schema:
 *        type: object
 *        required:
 *          - nombre
 *        properties:
 *          nombre:
 *              type: string
 *          apellido:
 *              type: string
 *          correo:
 *              type: string
 *              format: email
 *          numDoc:
 *              type: string
 *          celular:
 *              type: string
 *          direccion:
 *              type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/cliente/registro/postCliente", async (req, res) => {
  const { nombre, apellido, correo, numDoc, celular, direccion } = req.body;
  const query = "CALL SP_postCliente(?,?,?,?,?,?)";

  pool.query(query, [nombre, apellido, correo, numDoc, celular, direccion], (err) => {
    if (err) {
      console.error('SP_postCliente error:', { code: err.code, errno: err.errno, sqlState: err.sqlState });
      return res.status(500).json({ message: 'Error al registrar cliente', detail: err.code });
    }
    return res.status(201).json({ status: "Registro exitoso" });
  });
});

/**
 * @swagger
 * /cliente/actualiza/putClienteById:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - cliente
 *    parameters:
 *    - in: body
 *      name: cliente
 *      description: cliente
 *      schema:
 *        type: object
 *        required:
 *          - idCliente
 *        properties:
 *          idCliente:
 *            type: integer
 *          correo:
 *            type: string
 *            format: email
 *          celular:
 *            type: string  
 *          direccion:          
 *            type: string             
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/cliente/actualiza/putClienteById", async (req, res) => {
  const { idCliente, correo, celular, direccion } = req.body;
  const query = "call SP_putClienteById(?,?,?,?)";
  pool.query(query, [idCliente, correo, celular, direccion], (err, rows, fields) => {
    if (!err) {
      res.status(201).json({ Status: "Actualizacion exitosa" });
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /eventos/consulta/getDetailEvento/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - eventos
 *    parameters:
 *    - in: path
 *      name: id
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/eventos/consulta/getDetailEvento/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getDetailEvento(?)";

  pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /cliente/consulta/getByIdCliente/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - cliente
 *    parameters:
 *    - in: path
 *      name: id
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/cliente/consulta/getByIdCliente/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getByIdCliente(?)";

  pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /usuario/consulta/getIniciarSesion/{correo}/{pass}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - usuario
 *    parameters:
 *    - in: path
 *      name: correo
 *      type: string
 *      format: email
 *    - in: path
 *      name: pass
 *      type: string
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/usuario/consulta/getIniciarSesion/:correo/:pass", (req, res) => {
  const { correo, pass } = req.params;
  const query = "call SP_getIniciarSesion(?,?)";

  pool.query(query, [correo, pass], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});
/**
 * @swagger
 * /usuario/consulta/envioCorreoValidacion/{correo}:
 *   get:
 *     tags:
 *       - usuario
 *     summary: Valida si existe un usuario por correo
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Correo electrónico a validar
 *     responses:
 *       "200":
 *         description: "Devuelve { existe: 1 } si existe, { existe: 0 } si no"
 *       "500":
 *         description: "Error de servidor"
 */
router.get("/usuario/consulta/envioCorreoValidacion/:correo", (req, res) => {
  const { correo } = req.params;
  const query = "CALL SP_envioCorreoValidacion(?)";

  pool.query(query, [correo], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Error en BD", detail: err });
    }
    // rows[0][0] trae el resultado SELECT ... existe
    res.status(200).json(rows?.[0]?.[0] ?? { existe: 0 });
  });
});
/**
 * @swagger
 * /usuario/consulta/getValidacionCodex/{solicitante}/{codigo}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - usuario
 *    parameters:
 *    - in: path
 *      name: solicitante
 *      type: string
 *      format: email
 *    - in: path
 *      name: codigo
 *      type: string
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/usuario/consulta/getValidacionCodex/:solicitante/:codigo",
  (req, res) => {
    const { solicitante, codigo } = req.params;
    const query = "call SP_getValidacionCodex(?,?)";

    pool.query(query, [solicitante, codigo], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /mobile/consulta/equiposListPendientes/{pro}/{idEmpleado}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: pro
 *      type: integer
 *    - in: path
 *      name: idEmpleado
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/mobile/consulta/equiposListPendientes/:pro/:idEmpleado",
  (req, res) => {
    const { pro, idEmpleado } = req.params;
    const query = "call SP_EQUIPOSLISTPENDIENTES(?,?)";

    pool.query(query, [pro, idEmpleado], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /usuario/actualiza/actualizarPassword:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - usuario
 *    parameters:
 *    - in: body
 *      name: pass
 *      description: pass
 *      schema:
 *        type: object
 *        required:
 *          - pass
 *        properties:
 *          pass:
 *            type: string
 *          correo:
 *            type: string
 *            format: email
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/usuario/actualiza/actualizarPassword", async (req, res) => {
  const { pass, correo } = req.body;
  const query = "call SP_actualizarPassword(?,?)";
  pool.query(query, [pass, correo], (err, rows, fields) => {
    if (!err) {
      res.status(201).json({ Status: "Actualizacion exitosa" });
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /mobile/actualiza/putEquipoAlquiladoID:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: body
 *      name: id
 *      description: id
 *      schema:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          id:
 *            type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/mobile/actualiza/putEquipoAlquiladoID", async (req, res) => {
  const { id } = req.body;
  const query = "call SP_putEquipoAlquiladoID(?)";
  pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.status(201).json({ Status: "Actualizacion exitosa" });
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /equiposAlquilado/consulta/getAllEquiposAlquilado:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equiposAlquilado
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/equiposAlquilado/consulta/getAllEquiposAlquilado", (req, res) => {
  const query = "call SP_getAllEquiposAlquilados()";
  pool.query(query, (err, rows) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /equiposAlquilado/consulta/getEquipoAlquiladoByID/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equiposAlquilado
 *    parameters:
 *    - in: path
 *      name: id
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/equiposAlquilado/consulta/getEquipoAlquiladoByID/:id",
  (req, res) => {
    const { id } = req.params;
    const query = "call SP_getEquipoAlquiladoByID(?)";

    pool.query(query, [id], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /dashboard/consulta/getReporteListaEquipo:
 *   get:
 *     tags:
 *       - dashboard
 *     summary: Reporte con la lista de equipos (para dashboard)
 *     description: Devuelve código de equipo, tipo, modelo, marca, estado y fecha de ingreso.
 *     responses:
 *       "200":
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   equipoCodigo:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                   modelo:
 *                     type: string
 *                   marca:
 *                     type: string
 *                   estado:
 *                     type: string
 *                   fechaIngreso:
 *                     type: string
 *                     format: date
 *       "500":
 *         description: Error de servidor
 */
router.get("/dashboard/consulta/getReporteListaEquipo", (req, res) => {
  const query = "CALL SP_getReporteListaEquipo()";
  pool.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(rows?.[0] ?? []);
  });
});
/**
 * @swagger
 * /dashboard/consulta/getReporteProyectosXMes:
 *   get:
 *     tags:
 *       - dashboard
 *     summary: Reporte de proyectos agrupados por mes y año
 *     responses:
 *       '200':
 *         description: Lista de meses con total de proyectos creados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   anio:
 *                     type: integer
 *                     example: 2025
 *                   mes:
 *                     type: integer
 *                     example: 10
 *                   totalProyectos:
 *                     type: integer
 *                     example: 3
 *       '500':
 *         description: Error de servidor
 */
router.get("/dashboard/consulta/getReporteProyectosXMes", (req, res) => {
  const query = "call SP_getReporteProyectosXMes()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /dashboard/consulta/getReportEventosContado:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - dashboard
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/dashboard/consulta/getReportEventosContado", (req, res) => {
  const query = "call SP_getReportEventosContador()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /dashboard/consulta/getReporteEstadoProyectos:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - dashboard
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/dashboard/consulta/getReporteEstadoProyectos", (req, res) => {
  const query = "call SP_getReporteEstadoProyectos()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /dashboard/consulta/getReporteGanancias:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - dashboard
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/dashboard/consulta/getReporteGanancias", (req, res) => {
  const query = "call SP_getReporteGanancias()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /equiposAlquilado/registro/postEquipoAlquilado:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equiposAlquilado
 *    parameters:
 *    - in: body
 *      name: tipoEquipo
 *      description: datos del tipoEquipo
 *      schema:
 *        type: object
 *        required:
 *          - tipoEquipo
 *        properties:
 *          tipoEquipo:
 *              type: string
 *          marca:
 *              type: string
 *          modelo:
 *              type: string
 *          serie:
 *              type: string
 *          fechaEntrada:
 *              type: string
 *              format: date-time
 *          fechaSalida:
 *              type: string
 *              format: date-time
 *          fk_Pro_Cod:
 *              type: integer
 *          fk_Empleado_Cod:
 *              type: integer
 *          estado:
 *              type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.post(
  "/equiposAlquilado/registro/postEquipoAlquilado",
  async (req, res) => {
    const {
      tipoEquipo,
      marca,
      modelo,
      serie,
      fechaEntrada,
      fechaSalida,
      fk_Pro_Cod,
      fk_Empleado_Cod,
      estado,
    } = req.body;
    const query = "call SP_postEquipoAlquilado(?,?,?,?,?,?,?,?,?)";

    pool.query(
      query,
      [
        tipoEquipo,
        marca,
        modelo,
        serie,
        fechaEntrada,
        fechaSalida,
        fk_Pro_Cod,
        fk_Empleado_Cod,
        estado,
      ],
      (err, _rows, fields) => {
        if (!err) {
          res.status(201).json({ Status: "Registro exitoso" });
        } else {
          res.json(err);
        }
      }
    );
  }
);

/**
 * @swagger
 * /perfiles/consulta/getAllPerfiles:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - perfiles
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/perfiles/consulta/getAllPerfiles", (req, res) => {
  const query = "call SP_getAllPerfiles()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /perfiles/consulta/getByIdPerfil/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - perfiles
 *    parameters:
 *    - in: path
 *      name: id
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/perfiles/consulta/getByIdPerfil/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getByIdPerfil(?)";

  pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /perfiles/consulta/getAllRoles:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - perfiles
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/perfiles/consulta/getAllRoles", (req, res) => {
  const query = "call SP_getAllRoles()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /perfiles/registro/postPermiso:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - perfiles
 *    parameters:
 *    - in: body
 *      name: perfiles
 *      description: datos del perfiles
 *      schema:
 *        type: object
 *        required:
 *          - nombre
 *        properties:
 *          nombre:
 *              type: string
 *          apellido:
 *              type: string
 *          correo:
 *              type: string
 *          doc:
 *              type: string
 *          celular:
 *              type: string
 *          direccion:
 *              type: string
 *          rol:
 *              type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/perfiles/registro/postPermiso", async (req, res) => {
  const { nombre, apellido, correo, doc, celular, direccion, rol } = req.body;

  const query = "call SP_postPermiso(?,?,?,?,?,?,?)";

  pool.query(
    query,
    [nombre, apellido, correo, doc, celular, direccion, rol],
    (err, _rows, fields) => {
      if (!err) {
        res.status(201).json({ Status: "Registro exitoso" });
      } else {
        res.json(err);
      }
    }
  );
});

/**
 * @swagger
 * /perfiles/actualiza/putPermiso:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - perfiles
 *    parameters:
 *    - in: body
 *      name: perfiles
 *      description: perfiles
 *      schema:
 *        type: object
 *        required:
 *          - ID
 *        properties:
 *          ID:
 *            type: integer
 *          Celular:
 *            type: string
 *          Correo:
 *            type: string
 *          Direccion:
 *            type: string
 *          rol:
 *            type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/perfiles/actualiza/putPermiso", async (req, res) => {
  const { ID, Celular, Correo, Direccion, rol } = req.body;

  const query = "call SP_putPermiso(?,?,?,?,?)";
  pool.query(
    query,
    [ID, Celular, Correo, Direccion, rol],
    (err, rows, fields) => {
      if (!err) {
        res.status(201).json({ Status: "Actualizacion exitosa" });
      } else {
        res.json(err);
      }
    }
  );
});

/**
 * @swagger
 * /mobile/consulta/getNotificaciones/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: id
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/mobile/consulta/getNotificaciones/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getNotificaciones(?)";

  pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /mobile/consulta/getAllEquiposAsignados/{idEmpleado}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: idEmpleado
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/mobile/consulta/getAllEquiposAsignados/:idEmpleado",
  (req, res) => {
    const { idEmpleado } = req.params;
    const query = "call SP_getAllEquiposAsignados(?)";

    pool.query(query, [idEmpleado], (err, rows, fields) => {
      if (!err) {
        res.status(200).json(rows[0]);
      } else {
        res.json(err);
      }
    });
  }
);

/**
 * @swagger
 * /mobile/consulta/getAllReportes:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/mobile/consulta/getAllReportes", (req, res) => {
  const query = "call SP_getAllReportes()";

  pool.query(query, (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /mobile/registro/postReporte:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: body
 *      name: mobile
 *      description: datos del mobile
 *      schema:
 *        type: object
 *        required:
 *          - proyecto
 *        properties:
 *          proyecto:
 *              type: integer
 *          empleado:
 *              type: integer
 *          reporte:
 *              type: string
 *          fechaHora:
 *              type: string
 *              format: date-time
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/mobile/registro/postReporte", async (req, res) => {
  const { proyecto, empleado, reporte, fechaHora } = req.body;
  const query = "call SP_postReporte(?,?,?,?)";

  pool.query(
    query,
    [proyecto, empleado, reporte, fechaHora],
    (err, _rows, fields) => {
      if (!err) {
        res.status(201).json({ Status: "Registro exitoso" });
      } else {
        res.json(err);
      }
    }
  );
});

/**
 * @swagger
 * /mobile/registro/postNotificacion:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: body
 *      name: mobile
 *      description: datos del mobile
 *      schema:
 *        type: object
 *        required:
 *          - titulo
 *        properties:
 *          titulo:
 *              type: string
 *          cuerpo:
 *              type: string
 *          id:
 *              type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/mobile/registro/postNotificacion", async (req, res) => {
  const { titulo, cuerpo, id } = req.body;
  const query = "call SP_postNotificacion(?,?,?)";

  pool.query(query, [titulo, cuerpo, id], (err, _rows, fields) => {
    if (!err) {
      res.status(201).json({ Status: "Registro exitoso" });
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /mobile/consulta/getReportesID/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - mobile
 *    parameters:
 *    - in: path
 *      name: id
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/mobile/consulta/getReportesID/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getReportesID(?)";

  pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

module.exports = router;
