const express = require("express");
const router = express.Router();
const controller = require("../controllers/venda.controller");
const validarKeyApi = require("../middleware/key");



router.get("/", validarKeyApi, controller.verVendas);

router.get("/dashboard", validarKeyApi, controller.dashboard);

// fazer router para buscar as vendas pelo id
router.get("/:id", validarKeyApi, controller.GetDetalhesVenda);

router.post("/", validarKeyApi, controller.fazerVenda);

module.exports = router;