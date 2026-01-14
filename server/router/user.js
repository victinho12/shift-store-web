//dotenv para acessar a varialvel de ambiente .env
require("dotenv").config();
//bcrypt para fazer a criptografia da senha do user que vai para o banco
const bcrypt = require("bcrypt");
//express para poder fazer as rotas, requisão e respostas
const express = require("express");
//pool para fazer o crud do banco de dados
const pool = require("../db");
const authToken = require("../middleware/authToken");
//jwt pra fazer os tokens de acesso, isso ajuda a proeteger as nossas rotas 
const jwt = require("jsonwebtoken");
//router no express para criar rotas como, user, roupas etc.
const router = express.Router();
//criando rotas no express usando o router

//get para pegar os usuarios (experimental)
router.get("/", async (req, res) => {
  try {
    let {email} = req.query;

    const selectUser = await pool.query(`select * from public.usuarios where email = $1`,[email]);
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
  try{
    const {email, senha} = req.body; 
    const user = await pool.query(`select * from public.usuarios where email = $1`,[email]);
    const userInfos = user.rows[0]
    if(user.rows.length !== 1){
      return res.status(401).json({msg: "Usuario não encontrado"});
    }
    const senhaValida = await bcrypt.compare(senha, userInfos.senha);
    if(!senhaValida){
      return res.status(401).json({msg: "senha Incorreta"});
    }
    // criação do token para quando o usuario for logar no sistema, usando jwt
    const token = jwt.sign({email: userInfos.email}, process.env.JWT_SECRET, {expiresIn: '1h'});

    return res.status(200).json({
      nome: userInfos.nome,
      email: userInfos.email,
      token
    });
    
    

  }catch(err){
    res.status(401).json({err})
  }
});


module.exports = router;

