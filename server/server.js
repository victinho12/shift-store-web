require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const validar_chave_api_shfit = require("./middleware/key");
const errorHandler = require("./middleware/errorHendler");

const usuarioRouter = require("./router/user");
const clothesRouter = require("./router/clothes");
const cartRouter = require("./router/carrinho");
const vendas = require("./router/venda");

const app = express();

// 🔥 CORS CONFIG
const corsOptions = {
  origin: [
    "https://victinho12-shift-store-web-2glm.vercel.app",
    "https://shift-store-web.vercel.app",
    "https://shift-store-web-front.onrender.com",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "shift-api-key"],
  credentials: true,
};

// 🔥 MUITO IMPORTANTE (ordem correta)
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // libera preflight
app.use(express.json());

// Static (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔥 ROTAS PÚBLICAS (SEM API KEY)
app.use("/user", usuarioRouter);

// 🔒 ROTAS PROTEGIDAS
app.use("/roupas", validar_chave_api_shfit, clothesRouter);
app.use("/cart", validar_chave_api_shfit, cartRouter);
app.use("/vendas", validar_chave_api_shfit, vendas);

// Rota raiz
app.get("/", (req, res) => {
  res.send("api rodando");
});

// 404
app.use((req, res, next) => {
  const err = new Error("Rota não encontrada");
  err.statusCode = 404;
  err.code = "NOT_FOUND";
  next(err);
});

// error handler (sempre por último)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});