const pool = require("../db");

async function buscarRoupa(req, res) {
  try {
    let { offset, limit, ordem, nome } = req.query;

    nome = nome ? "%" + nome + "%" : "%";
    ordem = ordem && ordem.toLocaleLowerCase() === "asc" ? "ASC" : "DESC";
    offset = parseInt(offset) || 0;
    limit = parseInt(limit) || 50;

    console.log(offset, limit, ordem, nome);

    const query = `SELECT * FROM PUBLIC.roupas where nome ilike $1 ORDER BY id ${ordem} LIMIT $2 OFFSET $3`;
    const resultSelect = await pool.query(query, [nome, limit, offset]);

    res.json(resultSelect.rows);
  } catch (err) {
    res.status(500).json({
      error: "Erro ao listar roupas",
      detalhes: err.message,
    });
  }
};

module.exports = {
    buscarRoupa,
    
}