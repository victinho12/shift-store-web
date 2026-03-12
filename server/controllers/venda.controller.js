const pool = require("../db");
const AppError = require("../middleware/AppError");


async function verVendas(req, res, next) {
    try {
        const venda = await pool.query(`select u.nome, u.email , v.metodo_pagamento, v.valor_total from public.vendas v join public.usuarios u on u.id = v.id_usuario`);

        const venda_detalhes = await pool.query(`select p.nome as nome_produto, pv.id as id_produto, 
vi.quantidade as qtd ,vi.preco_unitario as preco_unit, vi.subtotal as subtotal
from public.venda_item vi
join public.produto_variacao pv on pv.id = vi.id_produto_variacao
join public.produto p on p.id = pv.id_produto`);


        return res.json({ ok: true, venda: venda.rows, detalhes: venda_detalhes.rows });
    } catch (err) {
        return next(err);
    }
};

async function fazerVenda(req, res, next) {
    const client = await pool.connect();
    try{ 
        await client.query(`BEGIN`);

        const {id_usuario, metodo_pagamento, frete = 0.00, itens } = req.body; 
        let valor_total = 0;
        //PESQUISAR SE O USUARIO EXISTE
        const pesquisar_usuario = await client.query(`SELECT id FROM PUBLIC.usuarios where id = $1`,[id_usuario]);
        //VALIDAR SE O USUARIO EXISTE, SE NÃO EXISTIR ELE DA UM ERRO ESPERADO
        if(pesquisar_usuario.rows.length !== 1) throw new AppError("Usuario não encontrado, crie uma conta ou loge para continuar", 404, "USUARIO_NAO_ENCONTRADO", pesquisar_usuario.rows);

        let id_usuario_exist = pesquisar_usuario.rows[0].id;

        //INSERT QUANDO O USUARIO EXISTIR
        const add_venda = await client.query(`INSERT INTO PUBLIC.vendas (id_usuario, valor_total, metodo_pagamento, frete) VALUES ($1, $2 ,$3 ,$4) RETURNING *`,[id_usuario_exist, valor_total, metodo_pagamento, frete,]);
        let id_vendas = add_venda.rows[0].id;

        for(const item of itens){
            const {id_produto_variacao, quantidade} = item

            const produto = await client.query(`select p.nome as nome, c.nome as categoria, t.nome as tamanho, cr.nome as cor, pv.preco as preco_unitario ,pv.estoque as estoque, pv.id as id_produto_variacao from public.produto_variacao pv
                join public.produto p on p.id = pv.id_produto
                join public.tamanho t on t.id = pv.id_tamanho
                join public.cor cr on cr.id = pv.id_cor
                join public.categoria c on c.id = p.id_categoria
                where pv.id = $1
                `,[id_produto_variacao]
            );
            const preco = produto.rows[0].preco_unitario;
            const estoque = produto.rows[0].estoque;

            if(quantidade > estoque) throw new AppError("Estoque insuficiente", 400, "ESTOQUE_INSUFICIENTE", produto.rows);

            const subtotal = quantidade * preco;
            valor_total = valor_total + subtotal;

            await client.query(`INSERT INTO PUBLIC.venda_item (id_vendas, id_produto_variacao, quantidade, preco_unitario, subtotal) values ($1,$2,$3,$4,$5)`,[id_vendas, id_produto_variacao, quantidade, preco, subtotal]);

            await client.query(`UPDATE PUBLIC.produto_variacao SET estoque = estoque - $1 where id = $2`,[quantidade, id_produto_variacao]);
        }

        await client.query("UPDATE PUBLIC.vendas set valor_total = $1 where id = $2",[valor_total, id_vendas]);
        await client.query(`COMMIT`);

        res.json({
            ok: true, data: "venda realizada com sucesso"
        });

    }catch(err){
        await client.query(`ROLLBACK`);
        return next(err);
        
    }finally {

        client.release();

    }
}

module.exports = { verVendas, fazerVenda };