const pool = require("../db");
const AppError = require("../middleware/AppError");

async function buscarRoupaPorId(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const isNum = Number(id);
    if (!Number.isInteger(isNum) || isNum <= 0) throw new AppError('Id invalido', 400, 'ID_INVALIDO');
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
    return res.json({ ok: true, data: resultSelectId.rows[0] });
  } catch (err) {
    return next(err);
  }
}
async function contarRoupas(req, res, next) {
  try {
    const resCount = await pool.query(
      `SELECT sum(estoque) as total FROM PUBLIC.produto_variacao`,
    );
    let resultado = resCount.rows[0].total;
    return res.json({ ok: true, data: resultado });
  } catch (err) {
    return next(err);
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


    const queryBuscarImg = `SELECT * FROM PUBLIC.produto_imagem where id_produto = $1`;
    const resultBuscarImg = await client.query(queryBuscarImg, [produtoId]);
    if (resultBuscarImg.rows.length === 0) {
      const queryInseirImg = `INSERT INTO PUBLIC.produto_imagem (id_produto, img, principal, id_cor, id_tamanho) values ($1, $2, $3, $4, $5) RETURNING *`;
      const resultInserirImg = await client.query(queryInseirImg, [
        produtoId,
        img,
        true,
        produtoCorNova,
        produtoTamanho
      ]);
    } else {
      const queryInseirImg = `INSERT INTO PUBLIC.produto_imagem (id_produto, img, principal, id_cor, id_tamanho) values ($1, $2, $3, $4, $5) RETURNING *`;
      const resultInserirImg = await client.query(queryInseirImg, [
        produtoId,
        img,
        false,
        produtoCorNova,
        produtoTamanho
      ]);
    };




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

    return res
      .status(201)
      .json({ ok: true, data: resultInserirVariante.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    return next(err);
  } finally {
    client.release();
  }
};

async function deletarRoupa(req, res, next) {
  const client = await pool.connect();

  try {
    const id = parseInt(req.params.id);
    const isNum = Number(id);
    if (!Number.isInteger(isNum) || isNum <= 0)
      throw new AppError("Id invalido", 400, "ID_INVALIDO");
    await client.query('BEGIN');

    const result = await client.query(
      `DELETE FROM PUBLIC.produto_variacao where id = $1 RETURNING id_produto, id_cor, id_tamanho`,
      [id],
    );
    if (result.rowCount === 0) {
      throw new AppError('Produto não encontrado', 404, 'PRODUTO_NAO_ENCONTRADO');
    }
    let produto_cor = result.rows[0].id_cor;
    let produto_tamanho = result.rows[0].id_tamanho;
    let produto_id = result.rows[0].id_produto;
    console.log(produto_id);
    const delete_img = await client.query(`DELETE FROM PUBLIC.produto_imagem where id_produto = $1 and id_cor = $2 and id_tamanho = $3 RETURNING *`, [produto_id, produto_cor, produto_tamanho]);
    if (result.rows.length === 0) {
      throw new AppError(
        "Produto não encontrado",
        404,
        "PRODUTO_NAO_ENCONTRADO",
      );
    }
    await client.query('COMMIT');
    return res.json({ ok: true, data: `Produto Excluido com succeso ${delete_img.rows[0].id}` });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
};

async function alterarRoupa(req, res, next) {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id);
    const isNum = Number(id);
    if (!Number.isInteger(isNum) || isNum <= 0) throw new AppError("Id invalido", 400, "ID_INVALIDO");
    const { nome, cor, tamanho, preco, quantidade, categoria } = req.body;
    let nomeProduct;
    let corProduct;
    let tamanhoProduct;
    let categoriaProduct;
    await client.query("BEGIN");

    const buscarIdProduto = await client.query(`SELECT * FROM PUBLIC.produto_variacao where id = $1`, [id]);
    if (buscarIdProduto.rowCount === 0) throw new AppError('Produto não encontrado', 404, "PRODUTO_NAO_ENCONTRADO");
    const buscarNome = await client.query(`SELECT id FROM PUBLIC.produto where nome = $1`, [nome]);
    if (buscarNome.rowCount === 0) throw new AppError('Nome não encontrado', 404, "NOME_NAO_ENCONTRADO");
    nomeProduct = buscarNome.rows[0].id;
    const buscarCorProduto = await client.query(`SELECT id FROM PUBLIC.cor where nome = $1`, [cor]);
    if (buscarCorProduto.rowCount === 0) {
      const novaCor = await client.query(`INSERT INTO PUBLIC.cor ()`)
    }
    corProduct = buscarCorProduto.rows[0].id;
    const buscarTamanhoProduto = await client.query(`SELECT id FROM PUBLIC.tamanho where nome = $1`, [tamanho]);
    if (buscarTamanhoProduto.rowCount === 0) throw new AppError('Tamanho não encontrado', 404, 'TAMANHO_NAO_ENCONTRADO');
    tamanhoProduct = buscarTamanhoProduto.rows[0].id;
    const buscarCategoriaProduto = await client.query(`SELECT id from public.categoria where nome = $1`, categoria);
    if (buscarCategoriaProduto.rowCount === 0) throw new AppError('Categoria não encontrada', 404, "CATEGORIA_NAO_ENCONTRADA");
    categoriaProduct = buscarCategoriaProduto.rows[0].id



    const alterarRoupa = await client.query('UPDATE PUBLIC.produto_variacao set id_produto =  COALESCE($1, id_produto), id_cor = COALESCE($2, id_cor), id_tamanho = COALESCE($3, id_tamanho), preco = COALESCE($4, preco), estoque = COALESCE($5, estoque) WHERE id = $6 RETURNING *', [nomeProduct ?? null, corProduct ?? null, tamanhoProduct ?? null, preco ?? null, quantidade ?? null, id]);
    if (alterarRoupa.rowCount === 0) throw new AppError('Não foi possivel alterrar roupa', 400, "ROUPAS_NAO_ALTERADA");
    await client.query("COMMIT");
    return res.json({ ok: true, data: alterarRoupa.rows[0].id });
  } catch (err) {
    await client.query("ROLLBACK");
    return next(err);
  }
};

async function buscarRoupaPorGenero(req, res, next) {
  try {
    let { offset, limit, ordem, categoria_nome, nome } = req.query;
    const nomeProd = nome ? `%${nome}%` : "%";
    const categoria = categoria_nome ? `%${categoria_nome}%` : "%";
    ordem = ordem && ordem.toLocaleLowerCase() === "asc" ? "ASC" : "DESC";
    offset = Number.isInteger(parseInt(offset)) ? parseInt(offset) : 0;
    limit = Number.isInteger(parseInt(limit)) ? parseInt(limit) : 50;

    const query = `
select
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

left join lateral (
  select pi2.img
  from public.produto_imagem pi2
  where pi2.id_produto = p.id
    and pi2.id_cor = pv.id_cor
  order by pi2.principal desc, pi2.id asc
  limit 1
) pi on true

join public.tamanho pt on pt.id = pv.id_tamanho
join public.categoria pc on pc.id = p.id_categoria
where pc.nome ilike $1 and p.nome ilike $4
limit $2 offset $3;
`;

    const resultSelect = await pool.query(query, [categoria, limit, offset, nomeProd]);
    if (resultSelect.rowCount === 0)
      throw new AppError("Roupa não encontrada", 404, "ROUPA_NAO_ENCOTRADA");
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
