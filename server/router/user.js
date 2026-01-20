//dotenv para acessar a varialvel de ambiente .env
require("dotenv").config();
//bcrypt para fazer a criptografia da senha do user que vai para o banco
const bcrypt = require("bcrypt");
//express para poder fazer as rotas, requisão e respostas
const express = require("express");
//pool para fazer o crud do banco de dados
const pool = require("../db");
const authToken = require("../middleware/authToken");
const {refreshToken} = require ("../controllers/user.controller")
//jwt pra fazer os tokens de acesso, isso ajuda a proeteger as nossas rotas
const jwt = require("jsonwebtoken");
//router no express para criar rotas como, user, roupas etc.
const router = express.Router();
//criando rotas no express usando o router

//get para pegar os usuarios (experimental)
router.get("/", async (req, res) => {
  try {
    let { email } = req.query;

    const selectUser = await pool.query(
      `select * from public.usuarios where email = $1`,
      [email]
    );
    res.json(selectUser.rows);
  } catch (err) {
    console.error(err.message, "dfasdff");
    res.status(500).json({ error: "Erro interno do servidor", err });
  }
});

//post usando para criar o usuario na tela de cadastro
router.post("/", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const selectVerificarExist = await pool.query(
      `SELECT * FROM PUBLIC.usuarios WHERE email ilike $1`,
      [email]
    );

    if (selectVerificarExist.rowCount > 0) {
      return res.status(409).json({ error: "Usuário já cadastrado" });
    }
    console.log(nome);
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Dados obrigatórios" });
    }
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);
    const postingUser = await pool.query(
      `insert into public.usuarios (nome, email, senha, tipo_user) VALUES
        ($1, $2, $3, $4) RETURNING *`,
      [nome, email, senhaHash, "user"]
    );
    res.status(201).json(postingUser.rows[0]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", detalhes: err.message });
  }
});

//post usando para validar o usuario que está fazendo o login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await pool.query(
      `select * from public.usuarios where email = $1`,
      [email]
    );
    const userInfos = user.rows[0];
    if (user.rows.length !== 1) {
      return res.status(401).json({ msg: "Usuario não encontrado" });
    }
    const senhaValida = await bcrypt.compare(senha, userInfos.senha);
    if (!senhaValida) {
      return res.status(401).json({ msg: "senha Incorreta" });
    }
    // criação do token para quando o usuario for logar no sistema, usando jwt
    const token = jwt.sign({ id: userInfos.id, tipo_user: userInfos.tipo_user }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const refreshToken = jwt.sign(
      { id: userInfos.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await pool.query(`DELETE from public.refresh_tokens where usuario_id = $1`,[userInfos.id])
    // data de expiração (7 dias)
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7);

    await pool.query(`INSERT INTO PUBLIC.refresh_tokens (usuario_id, token, expira_em) VALUES ($1 ,$2 ,$3)`, [userInfos.id, refreshToken, expiraEm]);

    return res.status(200).json({
      nome: userInfos.nome,
      email: userInfos.email,
      token, refreshToken
    });
  } catch (err) {
    res.status(401).json({msg: `error ao logar ${err.message}` });
  }
});

router.post("//refresh-token", refreshToken);

module.exports = router;
