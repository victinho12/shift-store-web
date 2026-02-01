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
      `select 
      pv.id as id,
      p.nome as nome,
      c.nome as cor,
      pv.preco as preco,
      pv.estoque as estoque_qtd,
      pi.img as img,
      pt.nome as tamanho,
      pc.nome as categoria
      from public.produto_variacao pv
      join public.cor c on c.id = pv.id_cor
      join public.produto p on p.id = pv.id_produto
      join public.produto_imagem pi on pi.id_produto = p.id
      join public.tamanho pt on pt.id = pv.id_tamanho
      join public.categoria pc on pc.id = p.id_categoria
      where pv.id = $1`,
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
async function contarRoupas(req, res) {
  try {
    const resCount = await pool.query(
      `SELECT count(*) as total FROM PUBLIC.produto_variacao`,
    );
    res.json(resCount.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
}

async function inserirRoupa(req, res) {
  const client = await pool.connect();
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Imagem não enviada",
      });
    }
    const { nome, cor, tamanho, preco, estoque, categoria_id } = req.body;
    let produtoId;
    let produtoCorNova;
    await client.query("BEGIN");
    const img = req.file.filename;
    const queryBuscarCategoria = `SELECT id from public.categoria where nome ilike $1`;
    const resultBuscarCategoria = await client.query(queryBuscarCategoria, [
      categoria_id,
    ]);
    if (resultBuscarCategoria.rows.length === 0)
      throw new Error("Categoria não encontrada");
    const categoiraId = resultBuscarCategoria.rows[0].id;
    const queryBuscarNome = `SELECT id FROM PUBLIC.produto where nome = $1`;
    const resultBuscarNome = await client.query(queryBuscarNome, [nome]);
    if (resultBuscarNome.rows.length > 0) {
      produtoId = resultBuscarNome.rows[0].id;
    } else {
      const queryCriarProduto = `INSERT INTO public.produto (nome, categoria_id) values ($1, $2) RETURNING *`;
      const resultCriarProduto = await client.query(queryCriarProduto, [
        nome,
        categoiraId,
      ]);
      produtoId = resultCriarProduto.rows[0].id;
    }
    const queryBuscarImg = `SELECT * FROM PUBLIC.produto_imagem where id_produto = $1`;
    const resultBuscarImg = await client.query(queryBuscarImg, [produtoId]);
    if (resultBuscarImg.rows.length === 0) {
      const queryInseirImg = `INSERT INTO PUBLIC.produto_imagem (id_produto, img, principal) values ($1, $2, $3) RETURNING *`;
      const resultInserirImg = await client.query(queryInseirImg, [
        produtoId,
        img,
        true,
      ]);
    } else {
      const queryInseirImg = `INSERT INTO PUBLIC.produto_imagem (id_produto, img, principal) values ($1, $2, $3) RETURNING *`;
      const resultInserirImg = await client.query(queryInseirImg, [
        produtoId,
        img,
        false,
      ]);
    }
    const queryBuscarTamanho = `select id from public.tamanho where nome ilike $1`;
    const resultBuscarTamanho = await client.query(queryBuscarTamanho, [
      tamanho,
    ]);
    let produtoTamanho = resultBuscarTamanho.rows[0].id;
    const queryBuscarCor = `select id from public.cor where nome ilike $1`;
    const resultBuscarCor = await client.query(queryBuscarCor, [cor]);
    if (resultBuscarCor.rows.length === 0) {
      const queryInseirCor = `INSERT INTO PUBLIC.cor (nome) VALUES ($1) RETURNING *`;
      const resultInserirCor = await client.query(queryInseirCor, [cor]);
      produtoCorNova = resultInserirCor.rows[0].id;
    } else {
      produtoCorNova = resultBuscarCor.rows[0].id;
    }
    const queryInserirVariante = `INSERT INTO PUBLIC.produto_variacao (id_produto, id_cor, id_tamanho, preco, estoque) values ($1,$2,$3,$4,$5) RETURNING *`;
    const resultInserirVariante = await client.query(queryInserirVariante, [
      produtoId,
      produtoCorNova,
      produtoTamanho,
      preco,
      estoque,
    ]);

    await client.query("COMMIT");

    res.status(201).json(resultInserirVariante.rows[0]);
    console.log("FILE:", req.file);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Erro ao inserir roupa", msg: err.message });
  } finally {
    client.release();
  }
}

async function deletarRoupa(req, res) {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      `DELETE FROM PUBLIC.produto_variacao where id = $1 RETURNING *`,
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

    const query = `select
    p.id as id_familia,
    pv.id as id,
    p.nome as nome,
    c.nome as cor,
    pv.preco as preco,
    pv.estoque as estoque_qtd,
    pi.img as img,
    pt.nome as tamanho,
    pc.nome as categoria
    from public.produto_variacao pv
    join public.cor c on c.id = pv.id_cor
    join public.produto p on p.id = pv.id_produto
    join public.produto_imagem pi on pi.id_produto = p.id AND pi.principal = true
    join public.tamanho pt on pt.id = pv.id_tamanho 
    join public.categoria pc on pc.id = p.id_categoria where pc.nome ilike $1 limit $2 offset $3 `;

    const resultSelect = await pool.query(query, [categoria, limit, offset]);
    if (resultSelect) {
      couter = couter + 1;
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
  contarRoupas,
};
