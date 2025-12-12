require("dotenv").config();
const KEY_API_SHIFT = process.env.KEY_API_SHIFT_STORE

const couter = 0


function validarKeyApi(req,res, next){
    const KEY_API_FRONT = req.header("shift-api-key");
    if(KEY_API_FRONT === KEY_API_SHIFT && couter <=3){
        if(couter > 3){
            return
        }
        next();
        console.log("Deu bom")

    }else{
        res.status(500).json({Mensagem: "Chave ínvalida"});
        console.log("chave do front invalida");
    }
}

module.exports = validarKeyApi;