require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
const pool = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { email } = req.query;

    const selectUser = await pool.query(
      `select * from public.usuarios where email ilike $1;`,
      [email]
    );
    res.json(selectUser.rows);
  } catch (err) {
    console.error(err.message, "dfasdff");
    res.status(500).json({ error: "Erro interno do servidor", err });
  }
});

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

module.exports = router;
