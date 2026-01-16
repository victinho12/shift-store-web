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
      { expiresIn: "15m" }
    );
    return res.json({accessToken: novoAcessoToken});
  } catch (err) {
    return res.status(403).json({ error: "Refresh token expirado" });
  }
};
module.exports = {
    refreshToken,

}
