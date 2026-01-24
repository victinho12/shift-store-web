//dotenv para acessar a varialvel de ambiente .env
require("dotenv").config();
//bcrypt para fazer a criptografia da senha do user que vai para o banco
const bcrypt = require("bcrypt");
//express para poder fazer as rotas, requisão e respostas
const express = require("express");
//pool para fazer o crud do banco de dados
const pool = require("../db");
const validarKeyApi = require("../middleware/key");
const admin = require("../middleware/admin");
const authToken = require("../middleware/authToken");
const controller = require ("../controllers/user.controller")
//jwt pra fazer os tokens de acesso, isso ajuda a proeteger as nossas rotas
const jwt = require("jsonwebtoken");
//router no express para criar rotas como, user, roupas etc.
const router = express.Router();
//criando rotas no express usando o router

//get usado para fazer a conta de quantos usuarios estão registrados no sistema 
router.get('/count', authToken, validarKeyApi ,admin ,controller.contarUser);
//get usado para buscar os usuarios na tela de admin
router.get("/", authToken, validarKeyApi , admin, controller.buscarUser)
//post usando para criar o usuario na tela de cadastro
router.post("/", controller.cadastrarUser);
//post usando para validar o usuario que está fazendo o login
router.post("/login", controller.loginUser);
//post usado para fazer refresh do token que ele esta usando e armazenar no banco
router.post("//refresh-token", controller.refreshToken);
router.delete('/:id', authToken, validarKeyApi ,admin ,controller.deletarUser)
module.exports = router;
