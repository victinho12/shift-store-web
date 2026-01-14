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
async function buscarRoupaPorId(req, res) {
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
}

async function inserirRoupa(req, res) {
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
}

module.exports = {
    buscarRoupa,
    buscarRoupaPorId,
    inserirRoupa,
    
}