const pool = require("../db");
const AppError = require("../middleware/AppError");

async function verVendas(req, res, next) {
  try {
    const venda = await pool.query(
      `select v.id as id_venda ,u.nome, u.email ,v.parcelas ,v.metodo_pagamento, v.valor_total, v.criado_em as data_compra from public.vendas v join public.usuarios u on u.id = v.id_usuario`,
    );

    const couterVendas = await pool.query("select count(id) from public.vendas")
    const faturamento = await pool.query("select sum(valor_total) as faturamento from public.vendas");
    return res.json({ ok: true, venda: venda.rows, count: couterVendas.rows[0], faturamento: faturamento.rows[0] });
  } catch (err) {
    return next(err);
  }
}

async function GetDetalhesVenda(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const detalhes = await pool.query(
      `select p.nome as produto, vi.quantidade as quantidade_solicitada, vi.preco_unitario, vi.subtotal, t.nome as tamanho, vi.id_vendas, v.criado_em as data_da_compra, v.parcelas
        from public.venda_item vi 
        join public.produto_variacao pv on pv.id = vi.id_produto_variacao
        join public.produto p on p.id = pv.id_produto
        join public.tamanho t on t.id = pv.id_tamanho
        join public.vendas v on v.id = vi.id_vendas
        where vi.id_vendas = $1`,
      [id],
    );
    if (detalhes.rowCount === 0) throw new AppError("detalhes não encontrados");
    return res.json({ detalhes: detalhes.rows[0] });
  } catch (err) {
    return next(err);
  }
}

async function fazerVenda(req, res, next) {
  //atribuir conexão unica para a query
  const client = await pool.connect();
  try {
    //beggin para começar as querys
    await client.query(`BEGIN`);
    //body da requisisão
    const {
      id_usuario,
      metodo_pagamento,
      frete = 0.0,
      itens,
      parcelas,
    } = req.body;
    let valor_total = 0;
    //PESQUISAR SE O USUARIO EXISTE
    const pesquisar_usuario = await client.query(
      `SELECT id FROM PUBLIC.usuarios where id = $1`,
      [id_usuario],
    );
    //VALIDAR SE O USUARIO EXISTE, SE NÃO EXISTIR ELE DA UM ERRO ESPERADO

    //verifica se o usuario existi
    if (pesquisar_usuario.rows.length !== 1)
      throw new AppError(
        "Usuario não encontrado, crie uma conta ou loge para continuar",
        404,
        "USUARIO_NAO_ENCONTRADO",
        pesquisar_usuario.rows,
      );
    let id_usuario_exist = pesquisar_usuario.rows[0].id;

    //INSERT QUANDO O USUARIO EXISTIR
    const add_venda = await client.query(
      `INSERT INTO PUBLIC.vendas (id_usuario, valor_total, metodo_pagamento, frete, parcelas) VALUES ($1, $2 ,$3 ,$4, $5) RETURNING *`,
      [id_usuario_exist, valor_total, metodo_pagamento, frete, parcelas],
    );
    let id_vendas = add_venda.rows[0].id;

    //um for para percorrer os itens do carrinho
    for (const item of itens) {
      const { id_produto_variacao, quantidade } = item;
      //select que ve se o produto existe
      const produto = await client.query(
        `select p.nome as nome, c.nome as categoria, t.nome as tamanho, cr.nome as cor, pv.preco as preco_unitario ,pv.estoque as estoque, pv.id as id_produto_variacao from public.produto_variacao pv
                join public.produto p on p.id = pv.id_produto
                join public.tamanho t on t.id = pv.id_tamanho
                join public.cor cr on cr.id = pv.id_cor
                join public.categoria c on c.id = p.id_categoria
                where pv.id = $1
                `,
        [id_produto_variacao],
      );
      if (produto.rows.length !== 1) {
        throw new AppError(
          "Produto não encontrado",
          404,
          "PRODUTO_NAO_ENCONTRADO",
        );
      }
      //pega o preco unitario no select
      const preco = produto.rows[0].preco_unitario;
      //pega a quantidade da roupa que tem em estoque
      const estoque = produto.rows[0].estoque;
      //faz validação se a quantidade que o usuario quer é maior que a quantidade que tem no estoque
      if (quantidade > estoque)
        throw new AppError(
          "Estoque insuficiente",
          400,
          "ESTOQUE_INSUFICIENTE",
          produto.rows,
        );
      //faz o conversão para o subtotal da roupa
      const subtotal = quantidade * preco;
      //soma o valor total
      valor_total = valor_total + subtotal;
      //faz o insert da venda item
      await client.query(
        `INSERT INTO PUBLIC.venda_item (id_vendas, id_produto_variacao, quantidade, preco_unitario, subtotal) values ($1,$2,$3,$4,$5)`,
        [id_vendas, id_produto_variacao, quantidade, preco, subtotal],
      );
      //atualiza a quantiade em estoque
      await client.query(
        `UPDATE PUBLIC.produto_variacao SET estoque = estoque - $1 where id = $2`,
        [quantidade, id_produto_variacao],
      );
    }
    //atualiza o valor total da compra
    await client.query(
      "UPDATE PUBLIC.vendas set valor_total = $1 where id = $2",
      [valor_total, id_vendas],
    );
    await client.query("delete from PUBLIC.carrinho where id_usuario = $1", [
      id_usuario,
    ]);
    await client.query(`COMMIT`);

    //da ok e envia um json que a compra foi realizada com successo
    res.json({
      ok: true,
      data: "venda realizada com sucesso",
    });
  } catch (err) {
    // se algo der errado com as querys ele da um rollback para não inserirr ou atualizar nada no banco com erro
    await client.query(`ROLLBACK`);
    // e mostra no terminal os status do erro
    return next(err);
  } finally {
    // finaliza a query
    client.release();
  }
}

module.exports = { verVendas, fazerVenda, GetDetalhesVenda };
