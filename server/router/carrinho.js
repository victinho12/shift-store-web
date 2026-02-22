require("dotenv").config();
const express = require("express");
const router = express.Router();
const validarKeyApi = require("../middleware/key");
const controller = require('../controllers/carrinho.controller');
const authToken = require("../middleware/authToken");

router.get("/", validarKeyApi, controller.verCart);

router.get("/:id", validarKeyApi, controller.verCartID);

router.delete("/:id", validarKeyApi, controller.deltarCart);

router.post("/", validarKeyApi, controller.addCart);

router.put("/:id", validarKeyApi, controller.alterarCart);

module.exports = router;