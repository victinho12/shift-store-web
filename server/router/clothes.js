require("dotenv").config();
const express = require("express");
const pool = require("../db");
const router = express.Router();
const uploads = require("../middleware/upload")
const validarKeyApi = require("../middleware/key");
const controller = require("../controllers/clothes.controller");
const admin = require("../middleware/admin");

router.get("/", validarKeyApi, admin , controller.buscarRoupa);

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

router.post("/", uploads.single("img"),async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Imagem não enviada"
      });
    }
    const { nome, cor, tamanho, preco, quantidade } = req.body;
    const img = req.file.filename;
    const resultPost = await pool.query(
      `INSERT INTO PUBLIC.roupas (nome, cor, tamanho, preco, quantidade, img) VALUES ($1, $2, $3, $4, $5, $6) RETURNING * `,
      [nome, cor, tamanho, preco, quantidade, img]
    );
    res.status(201).json(resultPost.rows[0]);
     console.log("FILE:", req.file);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao inserir roupa", detalhes: err.message });
  };
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
});

module.exports = router;
