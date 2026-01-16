//dotenv para acessar a varialvel de ambiente .env
require("dotenv").config();
//jwt pra fazer os tokens de acesso, isso ajuda a proeteger as nossas rotas 
const jwt = require("jsonwebtoken");

function authToken(req, res, next){
    const autHeader = req.headers['authorization']
     if (!autHeader) {
    return res.status(401).json({ msg: "Token não fornecido" });
  }
    const token = autHeader.split(" ")[1];
    if(!token) return res.sendStatus(401);
       
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) return res.sendStatus(401)
        req.user = user
        next()
    })
}
module.exports = authToken;