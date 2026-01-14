require("dotenv").config();

const pool = require("../db");

async function validarKeyApi(req, res, next) {
  try {
    const API_KEY_FRONT = req.header("shift-api-key");
    if (!API_KEY_FRONT) {
      return res.status(401).json({ erro: "chave da api não informada" });
    }
    const result = await pool.query(
      `select * from public.api_keys where api_key = $1;`,
      [API_KEY_FRONT]
    );
    const keyData = result.rows[0];
    //console.table(result.rows[0]);
    const hoje = new Date().toISOString().split("T")[0];
    //console.log(hoje);
    if (result.rows.length !== 1) {
      return res.status(401).json({ erro: "chave de api invalida" });
    }
    let ultima_data = result.rows[0].criado_em;
    let formatarUltima_data = new Date(ultima_data).toISOString().split("T")[0];
    //console.log(formatarUltima_data);
    let novoConsumo = 0;
    if (formatarUltima_data !== hoje) {
      await pool.query(
        `update public.api_keys set criado_em = $1,consumo = $2 where api_key ilike $3`,
        [hoje, novoConsumo, API_KEY_FRONT]
      );
    }
    if (result.rows[0].consumo >= result.rows[0].limite) {
      return res.status(429).json({ erro: "limite diario atingido" });
    }
    if (result.rows.length == 1) {
      let consumo1 = result.rows[0].consumo;
      consumo1 = consumo1 + 1;
      const consumo = await pool.query(
        `update public.api_keys set consumo = $1 where api_key ilike $2 RETURNING *`,
        [consumo1, API_KEY_FRONT]
      );

      req.API_KEY_FRONT = {
        id: keyData.id,
        role: keyData.role, // admin | user
        plano: keyData.plano,
      };

      next();
    } else {
      console.log("chave invalida", API_KEY_FRONT);
      return res.status(500).json({ mensagem: "CHAVE INVALIDA DA API" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
}
module.exports = validarKeyApi;
