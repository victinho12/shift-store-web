require("dotenv").config();
const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let {offset, limit, ordem, nome} = req.query;

    nome = nome ? '%' + nome + '%': '%';
    ordem = ordem && ordem.toLocaleLowerCase() === "asc" ? "ASC": "DESC";
    offset = parseInt(offset) || 0
    limit = parseInt(limit) || 50;
    
    console.log(offset, limit, ordem, nome);

    const query = `SELECT * FROM PUBLIC.roupas where nome ilike $1 ORDER BY id ${ordem} LIMIT $2 OFFSET $3`;
    const resultSelect = await pool.query(query,[nome, limit, offset]);

    res.json(resultSelect.rows);
  } catch (err) {
    res.status(500).json({
      error: "Erro ao listar roupas",
      detalhes: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resultSelectId = await pool.query(
      `SELECT * FROM PUBLIC.roupas where id = $1`,
      [id]
    );
    res.json(resultSelectId.rows);
  } catch (err) {
    res.status(500).json({
      error: "Erro ao listar roupas",
      detalhes: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome, cor, tamanho, preco, quantidade } = req.body;
    const resultPost = await pool.query(
      `INSERT INTO PUBLIC.roupas (nome, cor, tamanho, preco, quantidade) VALUES ($1, $2, $3, $4, $5) RETURNING * `,
      [nome, cor, tamanho, preco, quantidade]
    );
    res.status(201).json(resultPost.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao inserir roupa", detalhes: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(`DELETE FROM PUBLIC.roupas where id = $1 `, [
      id,
    ]);
    if(result === ""){res.send("roupa ja excluida")};
    res.send("roupa excluida com succeso");
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao inserir roupa", detalhes: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try{
    const id = parseInt(req.params.id);
    const resultUpdate = await pool.query(`UPDATE PUBLIC.roupas `);
  }catch(err){
    res.send("erro ao atulizar roupa", err.message)
  }
})

module.exports = router;
