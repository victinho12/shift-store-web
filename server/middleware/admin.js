const express = require("express");

function admin(req, res, next){
    if (req.user.tipo_user !== "admin") {
    return res.status(403).json({ error: "Acesso apenas para administradores", err });
  }
  next();
}

module.exports = admin;