const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { purge } = require("../router/user");


async function buscarUser(req, res) {
  try {
    let { email } = req.query;

    email = email ? "%" + email + "%" : "%";
    const query = `select * from public.usuarios where email ilike $1`;
    const selectUser = await pool.query(query,[email]
    );
    if(selectUser.rows.length === 0){
      res.status(400).json({msg: "Usuario não encontrado"})
    };
    res.json(selectUser.rows);
  } catch (err) {
    console.error(err.message, "dfasdff");
    res.status(500).json({ error: "Erro interno do servidor", err });
  }
}

async function cadastrarUser(req, res) {
  try {
    const { nome, email, senha, tipo_user } = req.body;
    
    const selectVerificarExist = await pool.query(
      `SELECT * FROM PUBLIC.usuarios WHERE email ilike $1`,
      [email]
    );

    if (selectVerificarExist.rows.length !== 0) {
      return res.status(409).json({ msg: "Usuário já cadastrado" });
    }
    console.log(nome);
    if (!nome || !email || !senha) {
      return res.status(400).json({ msg: "Dados obrigatórios" });
    }
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);
    const postingUser = await pool.query(
      `insert into public.usuarios (nome, email, senha, tipo_user) VALUES
        ($1, $2, $3, $4) RETURNING *`,
      [nome, email, senhaHash, tipo_user]
    );
    res.status(201).json(postingUser.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro interno do servidor", msg: err.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, senha } = req.body;
    const user = await pool.query(
      `select * from public.usuarios where email = $1`,
      [email]
    );
    const userInfos = user.rows[0];
    if (user.rows.length !== 1) {
      return res.status(401).json({ msg: "Usuario não encontrado" });
    }
    const senhaValida = await bcrypt.compare(senha, userInfos.senha);
    if (!senhaValida) {
      return res.status(401).json({ msg: "senha Incorreta" });
    }
    // criação do token para quando o usuario for logar no sistema, usando jwt
    const token = jwt.sign({ id: userInfos.id, tipo_user: userInfos.tipo_user }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const refreshToken = jwt.sign(
      { id: userInfos.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await pool.query(`DELETE from public.refresh_tokens where usuario_id = $1`,[userInfos.id])
    // data de expiração (7 dias)
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7);

    await pool.query(`INSERT INTO PUBLIC.refresh_tokens (usuario_id, token, expira_em) VALUES ($1 ,$2 ,$3)`, [userInfos.id, refreshToken, expiraEm]);

    return res.status(200).json({
      nome: userInfos.nome,
      email: userInfos.email,
      token, refreshToken
    });
  } catch (err) {
    res.status(401).json({msg: `error ao logar ${err.message}` });
  }
}


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

async function deletarUser(req, res) {
  try{
    const id = parseInt(req.params.id);
    const resDeleteUser = await pool.query(`delete from public.usuarios where id = $1 RETURNING *`,[id]);
    if (resDeleteUser.rows.length !== 1) return res.status(404).json({ error: "Usuario não encontrado" });
     res.status(204).end();
  }catch(err){
    res.status(401).json({msg: "Não foi possivel deletar usuario"})
  }
};
async function mudarUser(req, res) {
  try{
    let id = parseInt(req.params.id);
    let {nome, email} = req.body;
    update = `update public.usuarios set nome = COALESCE($1, nome), email = COALESCE($2, email) where id = $3 RETURNING *`;

    const resUpdate = await pool.query(update,[nome, email, id]);
    if(resUpdate.rows.length !== 1){
      console.table(resUpdate.rows);
      return res.status(500).json({msg: "Usuario não encontrado"});
    }
    res.json(resUpdate.rows[0]);
  }catch(err){
    res.status(401).json({msg: err.message});
  }
};

async function buscarUserPorId(req, res) {
  try{
    let id = parseInt(req.params.id);
    selectId = `select * from public.usuarios where id = $1`;
    const resSelectId = await pool.query(selectId,[id]);

    if(resSelectId.rows.length !== 1) return res.status(500).json({msg: "Usuario não encontrado"});
    res.json(resSelectId.rows);
  }catch(err){
    res.status(401).json({msg: err.message})
  }
}


module.exports = {
    refreshToken,
    contarUser,
    buscarUser,
    cadastrarUser,
    loginUser,
    deletarUser,
    mudarUser,
    buscarUserPorId

}
