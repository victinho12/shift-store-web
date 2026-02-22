require("dotenv").config();
const express = require("express");
const router = express.Router();
const uploads = require("../middleware/upload")
const validarKeyApi = require("../middleware/key");
const admin = require("../middleware/admin");
const authToken = require("../middleware/authToken");
const controller = require("../controllers/clothes.controller");

console.log("Tipos:", {
  authToken: typeof authToken,
  validarKeyApi: typeof validarKeyApi,
  admin: typeof admin,
  contarRoupas: typeof controller?.contarRoupas,
});

router.get("/genero", controller.buscarRoupaPorGenero);

router.get('/count', authToken, validarKeyApi, admin, controller.contarRoupas);

router.get("/:id", controller.buscarRoupaPorId);

router.post("/", authToken, validarKeyApi, admin, uploads.single("img"), controller.inserirRoupa);

router.delete("/:id", authToken, validarKeyApi, admin, controller.deletarRoupa);

router.put("/update/:id", authToken, validarKeyApi, admin, controller.alterarRoupa);

module.exports = router;
