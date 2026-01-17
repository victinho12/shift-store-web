require("dotenv").config();
const express = require("express");
const validar_chave_api_shfit = require("./middleware/key");
//const multer = require("multer");
const cors = require('cors');
const path = require("path");
const usuarioRouter = require("./router/user");
const clothesRouter = require("./router/clothes");

const app = express();
app.use(cors());
app.use(express.json());


// Rotas principais
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);
app.use(validar_chave_api_shfit);
app.use('/roupas', clothesRouter);
app.use('/user', usuarioRouter);

// Rota raiz
app.get("/", (req, res) => {
    res.send('api rodando');
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("http://localhost:3000 rodando")
})