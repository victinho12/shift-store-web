const pool = require("../db");
let couter = 1;
async function buscarRoupa(req, res) {
  try {
    let { offset, limit, ordem, nome } = req.query;

    nome = nome ? "%" + nome + "%" : "%";
    ordem = ordem && ordem.toLocaleLowerCase() === "asc" ? "ASC" : "DESC";
    offset = parseInt(offset) || 0;
    limit = parseInt(limit) || 50;

    const query = `SELECT * FROM PUBLIC.roupas where nome ilike $1 ORDER BY id ${ordem} LIMIT $2 OFFSET $3`;
    const resultSelect = await pool.query(query, [nome, limit, offset]);

    res.json(resultSelect.rows);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
}
async function buscarRoupaPorId(req, res) {
  try {
    const id = parseInt(req.params.id);
    const resultSelectId = await pool.query(
      `select roupas.id, roupas.nome as nome_roupa, categoria.nome as cate_nome, roupas.cor, roupas.tamanho, roupas.preco, roupas.img, roupas.quantidade from public.roupas
  join categoria on roupas.categoria_id = categoria.id where roupas.id = $1`,
      [id],
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
        error: "Imagem não enviada",
      });
    }
    const { nome, cor, tamanho, preco, quantidade, categoria_id } = req.body;
    const img = req.file.filename;
    const resultPost = await pool.query(
      `INSERT INTO PUBLIC.roupas (nome, cor, tamanho, preco, quantidade, img, categoria_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING * `,
      [nome, cor, tamanho, preco, quantidade, img, categoria_id],
    );
    res.status(201).json(resultPost.rows[0]);
    console.log("FILE:", req.file);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao inserir roupa", detalhes: err.message });
  }
}

async function deletarRoupa(req, res) {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      `DELETE FROM PUBLIC.roupas where id = $1 `,
      [id],
    );
    if (result === "") {
      res.send("roupa ja excluida");
    }
    res.send("roupa excluida com succeso");
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao deletar roupa", detalhes: err.message });
  }
}

async function alterarRoupa(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { nome, cor, tamanho, preco, quantidade } = req.body;
    const resultUpdate = await pool.query(
      `UPDATE PUBLIC.roupas set nome = $1, cor = $2, tamanho = $3, preco = $4, quantidade = $5 where id = $6 RETURNING nome, id`,
      [nome, cor, tamanho, preco, quantidade, id],
    );
    res.status(200).json({
      msg: `Roupa ${resultUpdate.rows[0].nome} foi alterada com succeso`,
    });
  } catch (err) {
    res
      .status(400)
      .json({ msg: `Não foi possivel alterar essa roupa ${err.message}` });
  }
}

async function buscarRoupaPorGenero(req, res) {
  try {
    let { offset, limit, ordem, categoria_nome } = req.query;
    const categoria = categoria_nome ? `%${categoria_nome}%` : "%";
    ordem = ordem && ordem.toLocaleLowerCase() === "asc" ? "ASC" : "DESC";
    offset = Number.isInteger(parseInt(offset)) ? parseInt(offset) : 0;
    limit = Number.isInteger(parseInt(limit)) ? parseInt(limit) : 50;

    const query = `select roupas.id, roupas.nome as nome_roupa, categoria.nome as cate_nome, roupas.cor, roupas.tamanho, roupas.preco, roupas.img from public.roupas
  join categoria on roupas.categoria_id = categoria.id where categoria.nome ilike $1 ORDER BY roupas.nome ${ordem} LIMIT $2 OFFSET $3`;

    const resultSelect = await pool.query(query, [categoria, limit, offset]);
    if(resultSelect){
      couter = couter + 1
    }
    res.json(resultSelect.rows);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
}

module.exports = {
  buscarRoupa,
  buscarRoupaPorId,
  inserirRoupa,
  deletarRoupa,
  alterarRoupa,
  buscarRoupaPorGenero,
};
