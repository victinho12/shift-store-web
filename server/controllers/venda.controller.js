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

module.exports = { verVendas };