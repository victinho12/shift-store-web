const express = require("express");
const router = express.Router();
const controller = require("../controllers/venda.controller");
const validarKeyApi = require("../middleware/key");

router.get("/", validarKeyApi, controller.verVendas);

module.exports = router;