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
  const query = "call SP_getAllProyects()";

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
  const query = "call SP_getAllAsignarEquipos()";

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
  const query = "call SP_getAllEmpleados()";

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
router.get("/proyecto/consulta/getByIdProyecto/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getByIdProyecto(?)";

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
router.post("/proyecto/registro/postProyecto", async (req, res) => {
  const { proyecto_nombre, codigo_pedido, fecha_inicio_edicion } = req.body;
  const query = "call SP_postProyect(?,?,?)";

  pool.query(
    query,
    [proyecto_nombre, codigo_pedido, fecha_inicio_edicion],
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
router.put("/proyecto/actualiza/putProyectoById", async (req, res) => {
  const { finFecha, multimedia, edicion, enlace, Observacion, id } = req.body;
  const query = "call SP_putProyectoById(?,?,?,?,?,?)";
  pool.query(
    query,
    [finFecha, multimedia, edicion, enlace, Observacion, id],
    (err, rows, fields) => {
      if (!err) {
        res.status(201).json({ Status: "Actualizacion exitosa" });
      } else {
        res.json(err);
      }
    }
  );
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
 * /eventos_servicios/consulta/getAllServiciosByEvento/{evento}:
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
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/eventos_servicios/consulta/getAllServiciosByEvento/:evento",
  (req, res) => {
    const { evento } = req.params;
    const query = "call SP_getAllServiciosByEvento(?)";

    pool.query(query, [evento], (err, rows, fields) => {
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
  "/eventos_servicios/consulta/getAllServiciosByEventoServ/:evento/:serv",
  (req, res) => {
    const { evento, serv } = req.params;
    const query = "call SP_getAllServiciosByEventoServ(?,?)";

    pool.query(query, [evento, serv], (err, rows, fields) => {
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
 * /pedido/consulta/getByIDPedido/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - pedido
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
router.get("/pedido/consulta/getByIDPedido/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getByIDPedido(?)";

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
router.get("/pedido/consulta/getLastEstadoPedido", (req, res) => {
  const query = "call SP_getLastEstadoPedido()";

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
router.get("/proyecto/consulta/getAllPedidosContratado", (req, res) => {
  const query = "call SP_getAllPedidosContratado()";

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
router.post(
  "/eventos_servicios/registro/postEventoxServicio",
  async (req, res) => {
    const { servicio, evento, precio, descripcion, titulo } = req.body;
    const query = "call SP_postEventoxServicio(?,?,?,?,?)";

    pool.query(
      query,
      [servicio, evento, precio, descripcion, titulo],
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
 * /pedido/registro/postPedido:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - pedido
 *    parameters:
 *    - in: body
 *      name: pedido
 *      description: datos del pedido
 *      schema:
 *        type: object
 *        required:
 *          - Nombre
 *        properties:
 *          Nombre:
 *              type: string
 *          ExS:
 *              type: integer
 *          doc:
 *              type: string
 *          fechaCreate:
 *            type: string
 *            format: date-time
 *          fechaEvent:
 *            type: string
 *            format: date-time
 *          horaEvent:
 *              type: string
 *          CodEmp:
 *              type: integer
 *          Direccion:
 *              type: string
 *          Ubicacion:
 *              type: string
 *          Latitud:
 *              type: string
 *          Longitud:
 *              type: string
 *          fechaEvent2:
 *              type: string
 *              format: date-time
 *          horaEvent2:
 *              type: string
 *          Direccion2:
 *              type: string
 *          Ubicacion2:
 *              type: string
 *          Latitud2:
 *              type: string
 *          Longitud2:
 *              type: string
 *          Observacion:
 *              type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/pedido/registro/postPedido", async (req, res) => {
  const {
    Nombre,
    ExS,
    doc,
    fechaCreate,
    fechaEvent,
    horaEvent,
    CodEmp,
    Direccion,
    Ubicacion,
    Latitud,
    Longitud,
    fechaEvent2,
    horaEvent2,
    Direccion2,
    Ubicacion2,
    Latitud2,
    Longitud2,
    Observacion,
  } = req.body;
  const query = "call SP_postPedido(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  pool.query(
    query,
    [
      Nombre,
      ExS,
      doc,
      fechaCreate,
      fechaEvent,
      horaEvent,
      CodEmp,
      Direccion,
      Ubicacion,
      Latitud,
      Longitud,
      fechaEvent2,
      horaEvent2,
      Direccion2,
      Ubicacion2,
      Latitud2,
      Longitud2,
      Observacion,
    ],
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
 * /eventos_servicios/actualiza/putByIdEventoxServicio:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - eventos_servicios
 *    parameters:
 *    - in: body
 *      name: eventos_servicios
 *      description: eventos_servicios
 *      schema:
 *        type: object
 *        required:
 *          - servicio
 *        properties:
 *          servicio:
 *            type: integer
 *          titulo:
 *            type: string
 *          precio:
 *            type: integer
 *          concepto:
 *            type: string
 *          id:
 *            type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.put(
  "/eventos_servicios/actualiza/putByIdEventoxServicio",
  async (req, res) => {
    const { servicio, titulo, precio, concepto, id } = req.body;
    const query = "call SP_putByIdEventoxServicio(?,?,?,?,?)";
    pool.query(
      query,
      [servicio, titulo, precio, concepto, id],
      (err, rows, fields) => {
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
 * /pedido/actualiza/putByIdPedido:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - pedido
 *    parameters:
 *    - in: body
 *      name: pedido
 *      description: pedido
 *      schema:
 *        type: object
 *        required:
 *          - EP_Cod
 *        properties:
 *          EP_Cod:
 *            type: integer
 *          fecha:
 *            type: string
 *            format: date-time
 *          hora:
 *            type: string
 *          ubicacion:
 *            type: string
 *          lugar:
 *            type: string
 *          latitud:
 *            type: string
 *          longitud:
 *            type: string
 *          fecha2:
 *            type: string
 *            format: date-time
 *          hora2:
 *            type: string
 *          ubicacion2:
 *            type: string
 *          lugar2:
 *            type: string
 *          latitud2:
 *            type: string
 *          longitud2:
 *            type: string
 *          id:
 *            type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/pedido/actualiza/putByIdPedido", async (req, res) => {
  const {
    EP_Cod,
    fecha,
    hora,
    ubicacion,
    lugar,
    latitud,
    longitud,
    fecha2,
    hora2,
    ubicacion2,
    lugar2,
    latitud2,
    longitud2,
    id,
  } = req.body;
  const query = "call SP_putByIdPedido(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  pool.query(
    query,
    [
      EP_Cod,
      fecha,
      hora,
      ubicacion,
      lugar,
      latitud,
      longitud,
      fecha2,
      hora2,
      ubicacion2,
      lugar2,
      latitud2,
      longitud2,
      id,
    ],
    (err, rows, fields) => {
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
 * /proyecto/consulta/getAsignarEquiposById/{id}:
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
router.get("/proyecto/consulta/getAsignarEquiposById/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_getAsignarEquiposById(?)";

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
router.put(
  "/proyecto/actualiza/putByIdAsignarPersonalEquipo",
  async (req, res) => {
    const { id, empleado, equipo } = req.body;
    const query =
      "call SP_putByIdAsignarPersonalEquipo(?,?,?,?,?,?,?,?,?,?,?,?,?)";
    pool.query(query, [id, empleado, equipo], (err, rows, fields) => {
      if (!err) {
        res.status(201).json({ Status: "Registro exitoso" });
      } else {
        res.json(err);
      }
    });
  }
);

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
router.post(
  "/proyecto/registro/postAsignarPersonalEquipo",
  async (req, res) => {
    const { proyecto, empleado, equipos } = req.body;
    const query = "call SP_postAsignarPersonalEquipo(?,?,?)";

    pool.query(query, [proyecto, empleado, equipos], (err, _rows, fields) => {
      if (!err) {
        res.status(201).json({ Status: "Registro exitoso" });
      } else {
        res.json(err);
      }
    });
  }
);

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
router.get("/proyecto/consulta/getAllEventosProyectos", (req, res) => {
  const query = "call SP_getAllEventosProyectos()";

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
router.delete("/proyecto/delete/deleteAsignarEquipoById/:id", (req, res) => {
  const { id } = req.params;
  const query = "call SP_deleteAsignarEquipoById(?)";

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
 * /proyecto/consulta/getAllEquiposFiltrados/{fecha}/{proyecto}/{idTipoEquipo}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - proyecto
 *    parameters:
 *    - in: path
 *      name: fecha
 *      required: false
 *      type: string
 *      format: date-time
 *    - in: path
 *      name: proyecto
 *      required: false
 *      type: integer
 *    - in: path
 *      name: idTipoEquipo
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/proyecto/consulta/getAllEquiposFiltrados/:fecha/:proyecto/:idTipoEquipo",
  (req, res) => {
    const { fecha, proyecto, idTipoEquipo } = req.params;
    const query = "call SP_getAllEquiposFiltrados(?,?,?)";

    pool.query(query, [fecha, proyecto, idTipoEquipo], (err, rows, fields) => {
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
    const { tipoEquipo, marca, modelo } = req.params;
    const query = "call SP_getAllEquiposByIdGroup(?,?,?)";

    pool.query(query, [tipoEquipo, marca, modelo], (err, rows, fields) => {
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
 * /equipo/consulta/getAllModelo/{marca}/{tipo}:
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
  const query = "call SP_getAllModelo(?,?)";
  const { marca, tipo } = req.params;

  pool.query(query, [marca, tipo], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
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
  const query = "call SP_getAllEmpleadosList()";

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
router.put("/empleado/actualiza/putEmpleadoById", async (req, res) => {
  const { ID, Celular, Correo, Direccion, Estado } = req.body;

  const query = "call SP_putEmpleadoById(?,?,?,?,?)";
  pool.query(
    query,
    [ID, Celular, Correo, Direccion, Estado],
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
 * /equipo/actualiza/putEstadoEquipo:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    parameters:
 *    - in: body
 *      name: equipo
 *      description: equipo
 *      schema:
 *        type: object
 *        required:
 *          - idEquipo
 *        properties:
 *          idEquipo:
 *            type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/equipo/actualiza/putEstadoEquipo", async (req, res) => {
  const { idEquipo } = req.body;
  const query = "call SP_putEstadoEquipo(?)";
  pool.query(query, [idEquipo], (err, rows, fields) => {
    if (!err) {
      res.status(201).json({ Status: "Actualizacion exitosa" });
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /equipo/consulta/getAllContadoresEquiposEstado/{idModelo}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    parameters:
 *    - in: path
 *      name: idModelo
 *      required: false
 *      type: integer
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get(
  "/equipo/consulta/getAllContadoresEquiposEstado/:idModelo",
  (req, res) => {
    const { idModelo } = req.params;
    const query = "call SP_getAllContadoresEquiposEstado(?)";

    pool.query(query, [idModelo], (err, rows, fields) => {
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
 * /equipo/consulta/getExistEquipo/{numSerie}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - equipo
 *    parameters:
 *    - in: path
 *      name: numSerie
 *      type: string
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/equipo/consulta/getExistEquipo/:numSerie", (req, res) => {
  const { numSerie } = req.params;
  const query = "call SP_getExistEquipo(?)";

  pool.query(query, [numSerie], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
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

  const query = "call SP_postCliente(?,?,?,?,?,?)";

  pool.query(
    query,
    [nombre, apellido, correo, numDoc, celular, direccion],
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
 *    responses:
 *      '201':
 *        description: Created
 */
router.put("/cliente/actualiza/putClienteById", async (req, res) => {
  const { idCliente, correo, celular } = req.body;
  const query = "call SP_putClienteById(?,?,?)";
  pool.query(query, [idCliente, correo, celular], (err, rows, fields) => {
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
 * /usuario/consulta/envioCorreoValidacion/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - cliente
 *    parameters:
 *    - in: path
 *      name: correo
 *      type: string
 *      format: email
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/usuario/consulta/envioCorreoValidacion/:correo", (req, res) => {
  const { correo } = req.params;
  const query = "call SP_envioCorreoValidacion(?)";

  pool.query(query, [correo], (err, rows, fields) => {
    if (!err) {
      res.status(200).json(rows[0]);
    } else {
      res.json(err);
    }
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
router.get("/dashboard/consulta/getReporteListaEquipo", (req, res) => {
  const query = "call SP_getReporteListaEquipo()";

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
 * /dashboard/consulta/getReporteProyectosXMes:
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
