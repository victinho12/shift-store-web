require("dotenv").config();
const express = require("express");
const router = express.Router();

const uploads = require("../middleware/upload")

const validarKeyApi = require("../middleware/key");
const admin = require("../middleware/admin");
const authToken = require("../middleware/authToken");

const controller = require("../controllers/clothes.controller");

router.get("/", authToken ,controller.buscarRoupa);

router.get("/genero", authToken, controller.buscarRoupaPorGenero);

router.get('/count', authToken, validarKeyApi, admin, controller.contarRoupas )

router.get("/:id", authToken ,controller.buscarRoupaPorId);




router.post("/", authToken ,validarKeyApi, admin, uploads.single("img"), controller.inserirRoupa);

router.delete("/:id", authToken, validarKeyApi, admin, controller.deletarRoupa);

router.put("/:id", authToken, validarKeyApi, admin ,controller.alterarRoupa);

module.exports = router;
