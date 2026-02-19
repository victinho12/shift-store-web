require("dotenv").config();
const express = require("express");
const router = express.Router();
const validarKeyApi = require("../middleware/key");
const controller = require('../controllers/carrinho.controller');

router.get("/", validarKeyApi, controller.verCart);

router.get("/:id", validarKeyApi, controller.verCartID);

router.delete("/:id", validarKeyApi, controller.deltarCart);

module.exports = router;