const pool = require("../db");
const AppError = require("../middleware/AppError");


async function verCart(req, res, next) {
    try {
        const cart = await pool.query(`select cart.id as id_carrinho,u.nome as user_nome,
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

        if (cart.rowCount === 0) return res.send("nenhum dado encontrado no carrrinho");
        return res.json({ ok: true, data: cart.rows });
    } catch (err) {
        return next(err)
    }
}

async function verCartID(req, res, next) {
    try {
        let id = parseInt(req.params.id);
        const cart = await pool.query(`select u.nome as user_nome,
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
        where cart.id = $1
        order by u.nome;`, [id]);
        if (cart.rowCount === 0) return res.send('Nenhum carrinho encontrado com esse id');

        return res.json({ ok: true, data: cart.rows[0] });
    } catch (err) {
        return next(err);
    }
};


async function deltarCart(req, res, next) {
    try {
        let id = parseInt(req.params.id);
        const cart = await pool.query(`delete from public.carrinho_item where id = $1`, [id]);
        if (cart.rowCount === 0) return res.send('carrinho não encontrado');
        return res.send('excluido');
    } catch (err) {
        return next(err);
    }
}

async function addCart(req, res, next) {
    const client = await pool.connect();
    try {
        await client.query(`BEGIN`);
        const { id_usuario, id_produto_variacao, quantidade } = req.body;

        let id_carrinho = null;

        let id_produto_variacaoinumber = Number(id_produto_variacao);
        if (quantidade <= 0) throw new AppError('Quantidade precisa ser um numero inteiro positivo', 404, "QUANTIDADE_INVALIDA");
        if (!Number.isInteger(id_produto_variacaoinumber) || id_produto_variacaoinumber <= 0) throw new AppError("Id da variaçõa do produto deve ser um numero positivo", 404, 'ID_PRODUTO_VARIAÇÃO_INVALIDO');

        const produtoExist = await client.query(`select id from public.produto_variacao where id = $1`,[id_produto_variacao]);
        if(produtoExist.rowCount === 0) throw new AppError("Produto não encontrado", 404, 'PRODUTO_NAO_ENCONTRADO');
        const cartExist = await client.query(`select id from public.carrinho where id_usuario = $1 and status = 'ativo' LIMIT 1`, [id_usuario]);
        if (cartExist.rowCount === 0) {
            const cartNovo = await client.query(`INSERT INTO PUBLIC.carrinho (id_usuario) values ($1) RETURNING id`, [id_usuario]);
            id_carrinho = cartNovo.rows[0].id;
        } else {
            id_carrinho = cartExist.rows[0].id;
        }

        const cartItem = await client.query(`INSERT INTO PUBLIC.carrinho_item (id_carrinho, id_produto_variacao, quantidade) VALUES ($1, $2, $3) on conflict (id_carrinho ,id_produto_variacao) do update set quantidade = public.carrinho_item.quantidade + EXCLUDED.quantidade RETURNING *`, [id_carrinho, id_produto_variacao, quantidade]);
        await client.query(`COMMIT`);
        return res.json({ ok: true, data: cartItem.rows });
    } catch (err) {
        await client.query(`ROLLBACK`);
        return next(err);
    } finally {
        client.release();
    }
}

module.exports = { verCart, verCartID, deltarCart, addCart };