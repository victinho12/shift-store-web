const express = require("express");

function admin(req, res, next){
    if (!req.API_KEY_FRONT || req.API_KEY_FRONT.role !== "admin") {
      console.log("não deu", req.API_KEY_FRONT.role);
    return res.status(403).json({ error: "Acesso apenas para administradores" });
  }
  next();
  console.log("deu", req.API_KEY_FRONT.role);
}

module.exports = admin;