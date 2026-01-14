require("dotenv").config();
const express = require("express");
const pool = require("../db");
const router = express.Router();
const uploads = require("../middleware/upload")
const validarKeyApi = require("../middleware/key");
const controller = require("../controllers/clothes.controller");
const admin = require("../middleware/admin");

router.get("/", controller.buscarRoupa);

router.get("/:id", controller.buscarRoupaPorId);

router.post("/", uploads.single("img"), validarKeyApi, admin, controller.inserirRoupa);

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
