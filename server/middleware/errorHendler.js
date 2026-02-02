require("dotenv").config();

function errorHendler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === "production";


  console.error("Error: ", {
    message: err.message,
    status,
    path: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    stack: isProd ? undefined : err.stack,
  });
  return res.status(status).json({
    ok: false,
    message: err.message || "Erro Interno do servidor",
    code: err.code || "INTERNAL_ERROR",
    details: err.details || null,
    stack: isProd ? undefined : err.stack,
  });
}

module.exports = errorHendler;
