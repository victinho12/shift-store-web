const pool = require("../db");
const AppError = require("../middleware/AppError");

async function verCart(req, res, next) {
  try {
    const cart =
      await pool.query(`select cart_item.id as cart_id_item,cart.id as id_carrinho,u.nome as user_nome,
        p.nome as produto_nome_solicitado,
        cart_item.quantidade as qtd_carrinho, 
        pv.estoque as qtd_estoque,
        t.nome as produto_tamanho_solicitado,
        c.nome as produto_cor_solicitado,
        (pv.preco * cart_item.quantidade) as valor_total
        from public.carrinho_item cart_item
        join public.carrinho cart on cart.id = cart_item.id_carrinho
        join public.usuarios u on u.id = cart.id_usuario
        join public.produto_variacao pv on pv.id = cart_item.id_produto_variacao
        join public.produto p on p.id = pv.id_produto
        join public.tamanho t on t.id = pv.id_tamanho
        join public.cor c on c.id = pv.id_cor
        where cart.status ilike 'ativo'
        order by u.nome;
        `);

    if (cart.rowCount === 0)
      return res.send("nenhum dado encontrado no carrrinho");
    return res.json({ ok: true, data: cart.rows });
  } catch (err) {
    return next(err);
  }
}

async function verCartID(req, res, next) {
  try {
    const id = parseInt(req.params.id); // ou req.body.id

    const cart = await pool.query(
      `SELECT
  cart_item.id as cart_id_item,
  u.nome AS user_nome,
  p.nome AS produto_nome_solicitado,
  cart_item.quantidade AS qtd_carrinho,
  pv.estoque AS qtd_estoque,
  t.nome AS produto_tamanho_solicitado,
  c.nome AS produto_cor_solicitado,
  (pv.preco * cart_item.quantidade) AS valor_total,
  SUM(cart_item.quantidade) OVER (PARTITION BY u.id) AS total_itens_carrinho
FROM public.carrinho_item cart_item
JOIN public.carrinho cart ON cart.id = cart_item.id_carrinho
JOIN public.usuarios u ON u.id = cart.id_usuario
JOIN public.produto_variacao pv ON pv.id = cart_item.id_produto_variacao
JOIN public.produto p ON p.id = pv.id_produto
JOIN public.tamanho t ON t.id = pv.id_tamanho
JOIN public.cor c ON c.id = pv.id_cor
WHERE u.id = $1
ORDER BY cart_item.id;`,
      [id],
    );
    if (cart.rowCount === 0)
      return res.send("Nenhum carrinho encontrado com esse id");

    return res.json({ ok: true, data: cart.rows, quantidade: cart.rows[0].total_itens_carrinho });
  } catch (err) {
    return next(err);
  }
}

async function deltarCart(req, res, next) {
  try {
    let id = parseInt(req.params.id);
    let isId = Number(id);
    if (!Number.isInteger(isId) || id <= 0 || id == NaN || undefined || "")
      throw new AppError(
        "O id precisa ser um numero positivo inteiro",
        400,
        "ID_NAO_RECONHECIDO",
        id,
      );
    const cart = await pool.query(
      `delete from public.carrinho_item where id = $1`,
      [id],
    );
    if (cart.rowCount === 0) throw new AppError("Não foi possivel excluir item", 400, "ITEN_NOT_DELETED", cart.rows);
    return res.json({data: cart.rows[0]});
  } catch (err) {
    return next(err);
  }
};
async function addCart(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id_usuario, id_produto_variacao, quantidade } = req.body;

    const idVarNum = Number(id_produto_variacao);
    const qtdNum = Number(quantidade);

    if (!Number.isInteger(idVarNum) || idVarNum <= 0) {
      throw new AppError(
        "Id da variação do produto deve ser um número positivo",
        400,
        "ID_PRODUTO_VARIACAO_INVALIDO",
      );
    }

    if (!Number.isInteger(qtdNum) || qtdNum <= 0) {
      throw new AppError(
        "Quantidade precisa ser um número inteiro positivo",
        400,
        "QUANTIDADE_INVALIDA",
      );
    }

    // produto existe?
    const produtoExist = await client.query(
      `select estoque from public.produto_variacao where id = $1`,
      [idVarNum],
    );
    if (produtoExist.rowCount === 0) {
      throw new AppError(
        "Produto não encontrado",
        404,
        "PRODUTO_NAO_ENCONTRADO",
      );
    }

    // pega/gera carrinho
    const cartExist = await client.query(
      `select c.id from public.carrinho c where c.id_usuario = $1 and c.status = 'ativo' limit 1`,
      [id_usuario],
    );

    let id_carrinho;
    if (cartExist.rowCount === 0) {
      const cartNovo = await client.query(
        `insert into public.carrinho (id_usuario) values ($1) returning id`,
        [id_usuario],
      );
      id_carrinho = cartNovo.rows[0].id;
    } else {
      id_carrinho = cartExist.rows[0].id;
    }

    // upsert item no carrinho
    const cartItem = await client.query(
      `insert into public.carrinho_item (id_carrinho, id_produto_variacao, quantidade)
       values ($1, $2, $3)
       on conflict (id_carrinho, id_produto_variacao)
       do update set quantidade = public.carrinho_item.quantidade + excluded.quantidade
       returning *`,
      [id_carrinho, idVarNum, qtdNum],
    );

    // valida estoque com quantidade final
    const estoque = Number(produtoExist.rows[0].estoque);
    const quantidadeFinal = Number(cartItem.rows[0].quantidade);

    if (quantidadeFinal > estoque) {
      throw new AppError(
        "Quantidade em estoque indisponível",
        400,
        "ESTOQUE_INDISPONIVEL",
        `Quantidade que você tentou ${quantidadeFinal}, mas temos apenas ${estoque} em estoque`,
      );
    }

    await client.query("COMMIT");
    return res.json({ ok: true, data: cartItem.rows });
  } catch (err) {
    await client.query("ROLLBACK");
    return next(err);
  } finally {
    client.release();
  }
}
async function alterarCart(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { quantidade } = req.body;
    if (quantidade < 0)
      throw new AppError(
        "Quantidade de alteração invalida, selecione um valor inteiro positivo",
        400,
        "QUANTIDADE_INDISPONIVEL",
      );
    const cart = await pool.query(
      `UPDATE PUBLIC.carrinho_item set quantidade = $1 where id = $2 RETURNING id`,
      [quantidade, id],
    );
    if (cart.rowCount === 0)
      throw new AppError(
        "Não foi possivel alterar valor",
        400,
        "VALOR_INVALIDO",
        `O id do carrinho ${id}, quantidade: ${quantidade}`,
      );
    res.json({ ok: true, data: cart.rows.id });
  } catch (err) {
    return next(err);
  }
}


module.exports = { verCart, verCartID, deltarCart, addCart, alterarCart };
