require("dotenv").config();
const express = require("express");
const validar_chave_api_shfit = require("./key");

const cors = require('cors');

const usuarioRouter = require("./router/usuarios")
const clothesRouter = require("./router/clothes");

const app = express();
app.use(cors());
app.use(express.json());


// Rotas principais
app.use(validar_chave_api_shfit);
app.use('/roupas', clothesRouter);
app.use('/usuario', usuarioRouter);

// Rota raiz
app.get("/", (req, res) => {
    res.send('api rodando');
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, "localhost", () => {
    console.log("http://localhost:3000 rodando")
})