const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  //validação se existe no body
  if (!refreshToken) {
    return res.status(401).json({ msg: "Refresh token ausente" });
  }
  //validação de existe no banco
  const tokenDb = await pool.query(
    `SELECT * FROM PUBLIC.refresh_tokens where token = $1`,
    [refreshToken]
  );
  if (tokenDb.rows.length !== 1) {
    return res.status(401).json({ msg: "Refresh token invalido" });
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const novoAcessoToken = jwt.sign(
      {id: payload.id,},
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    return res.json({accessToken: novoAcessoToken});
  } catch (err) {
    return res.status(403).json({ error: "Refresh token expirado" });
  }

};

async function contarUser(req, res) {
  try{
    const resCount = await pool.query(`SELECT count(*) as total_user FROM PUBLIC.usuarios`);
    res.json(resCount.rows[0]);
  }catch(err){
    res.status(500).json({ msg: err.message });
  }
}
module.exports = {
    refreshToken,
    contarUser

}
