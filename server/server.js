require("dotenv").config();
const express = require("express");
const validar_chave_api_shfit = require("./middleware/key");
const errorHandler = require("./middleware/errorHendler");
const cors = require("cors");
const path = require("path");
const usuarioRouter = require("./router/user");
const clothesRouter = require("./router/clothes");
const cartRouter = require('./router/carrinho');
const vendas = require("./router/venda");
const app = express();

app.use(cors({
  origin: [
    "https://shift-store-web.vercel.app",
    "https://shift-store-web-front.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// Static (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middlewares globais (key api)
app.use(validar_chave_api_shfit);

// Rotas
app.use("/roupas", clothesRouter);
app.use("/user", usuarioRouter);
app.use('/cart', cartRouter);
app.use("/vendas", vendas)
// Rota raiz
app.get("/", (req, res) => {
  res.send("api rodando");
});

// 404 opcional (recomendado)
app.use((req, res, next) => {
  const err = new Error("Rota não encontrada");
  err.statusCode = 404;
  err.code = "NOT_FOUND";
  next(err);
});

// ✅ errorHandler SEMPRE antes do listen e por último entre os app.use
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("http://localhost:3000 rodando");
});
