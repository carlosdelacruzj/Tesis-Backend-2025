// src/app.js
require("dotenv").config(); // debe ser la PRIMERA línea

const express = require("express");
const app = express();

const cors = require("cors");
const errorHandler = require("./middlewares/error-handler");
const authMiddleware = require("./middlewares/auth"); // 🔑 nuevo import

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const pool = require("./db"); // index.js por convención

//Extended
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "TP-2021",
      description: "Api de TP2021 ",
      contact: {
        name: "r.k.villanueva.laurente@gmail.com",
      },
      servers: ["http://localhost:3000"],
    },
  },
  apis: ["src/app.js", "src/routes/core.js", "src/routes/proyecto.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//settings
app.set("port", process.env.PORT || 3000);

//Middlewares
app.use(cors());
app.use(express.json({ extended: false }));

// Healthcheck público
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 👉 tu lógica de auth se aplica aquí
app.use(authMiddleware);

//Routes
app.use(require("./routes/core"));
app.use(require("./routes/proyecto"));

// 404 (si no cayó en ninguna ruta)
app.use((req, res, _next) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// Manejador de errores (último siempre)
app.use(errorHandler);

app.listen(app.get("port"), () => {
  console.log("Server on port ", app.get("port"));
});
