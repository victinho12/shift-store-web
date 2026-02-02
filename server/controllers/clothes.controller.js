const pool = require("../db");
const AppError = require("../middleware/AppError");

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
      `SELECT sum(estoque) as total FROM PUBLIC.produto_variacao`,
    );
    let resultado = resCount.rows[0].total;
    res.json({ res: resultado });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
}

async function inserirRoupa(req, res, next) {
  const client = await pool.connect();
  try {
    if (!req.file) {
      throw new AppError("Img não encontrada", 400, "IMG_NAO_ENCONTRADA");
    }
    const { nome, cor, tamanho, preco, estoque, categoria_id } = req.body;
    let produtoId;
    let produtoCorNova;

    await client.query("BEGIN");
    const img = req.file.filename;
    console.log(req.body, img);
    const queryBuscarCategoria = `SELECT id FROM public.categoria WHERE id = $1`;

    const resultBuscarCategoria = await client.query(queryBuscarCategoria, [
      Number(categoria_id),
    ]);
    if (resultBuscarCategoria.rows.length === 0)
      throw new AppError(
        "Categoria não encontrada",
        400,
        "GENERO_NAO_ENCONTRADO",
      );
    const categoiraId = resultBuscarCategoria.rows[0].id;
    const queryBuscarNome = `SELECT id FROM PUBLIC.produto where nome = $1`;
    const resultBuscarNome = await client.query(queryBuscarNome, [nome]);
    if (resultBuscarNome.rows.length > 0) {
      produtoId = resultBuscarNome.rows[0].id;
    } else {
      const queryCriarProduto = `INSERT INTO public.produto (nome, id_categoria) values ($1, $2) RETURNING id`;
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
    if (resultBuscarTamanho.rows.length === 0) {
      throw new AppError(
        "Tamanho não encontrado",
        404,
        "TAMANHO_NAO_ENCONTRADO",
      );
    }
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
    const queryInserirVariante = `
  INSERT INTO public.produto_variacao (id_produto, id_cor, id_tamanho, preco, estoque)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (id_produto, id_cor, id_tamanho)
  DO UPDATE SET
    estoque = public.produto_variacao.estoque + EXCLUDED.estoque,
    preco = EXCLUDED.preco
  RETURNING *
`;

    const resultInserirVariante = await client.query(queryInserirVariante, [
      produtoId,
      produtoCorNova,
      produtoTamanho,
      preco,
      estoque,
    ]);

    await client.query("COMMIT");

    return res.status(201).json({ ok: true, data: resultInserirVariante.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    return next(err);
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
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Roupa não encontrada" });
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

async function buscarRoupaPorGenero(req, res, next) {
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
    if (resultSelect.rowCount === 0)
      throw new AppError("Erro de servidor", 500, "INTERNER_SERVER_ERRO");
    return res.json({ ok: true, data: resultSelect.rows });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  buscarRoupaPorId,
  inserirRoupa,
  deletarRoupa,
  alterarRoupa,
  buscarRoupaPorGenero,
  contarRoupas,
};
