const express = require("express");
const pool = require("../db");

const router = express.Router();

router.post("/", async(req, res) => {
    try{
        const {nome, email, senha_hash, telefone, cpf} = req.body;
    const resultInsertUser = await pool.query(`INSERT INTO PUBLIC.usuarios (nome, email, senha_hash, telefone, cpf) VALUES ($1,$2,$3,$4,$5) RETURNING *`,[nome,email,senha_hash,telefone,cpf]);
        res.status(201).json(resultInsertUser.rows[0]);
    }catch(err){
        res.status(500).json(
            {
                error: "erro ao enserir usuario", detalhes: err.message
        })
    }
});


module.exports = router;