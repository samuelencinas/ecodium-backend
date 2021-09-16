const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require('mongoose');
const Archivo = require('../models/archivos');
const Diapositiva = require('../models/diapositiva');

// Multer - Middleware para el manejo de archivos subidos por el usuario
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});
var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Sólo se permiten archivos de tipo .jpg, .png y .jpeg!'));
    }
  }
});

// FUNCIONALIDAD: Subir imágenes (ya sea foto de perfil, etc..)
router.post("/subirArchivo", upload.single('file'), async (req, res, next) => {
  const file = req.file;
  if (!file || !file.filename) {
    res.status(500).json({mensaje: "error"});
  } else {
  res.status(200).json(file.filename);
  }
});


// FUNCIONALIDAD: Obtener siguiente nivel del usuario 
router.get("/siguienteNivel", (req, res, next) => {

    const usuario = req.isAuthenticated() ? req.user : undefined;
      if (!!usuario){
      const siguienteNivel = Number(Number(usuario.nivel)+1);
      const data = require('../json/leveling.json');
      if (!!siguienteNivel){
          return res.status(200).json(data.filter(e => e.nivel === siguienteNivel)[0]);
      } else {
          return res.status(500).json({mensaje: "error"});
      }
    } else {
      return res.status(500).json({mensaje: "error"});
    }
});

// FUNCIONALIDAD: Obtener las diapositivas
router.get("/diapositivas", (req, res, next) => {
  Diapositiva.find({}, function(err, diapositivas) {
    if (!!diapositivas) {
      return res.status(200).json(diapositivas);
    } else {
      return res.status(500).json({mensaje: "error"});
    }
  });
});

/**
 * COMUNIDAD
 */

module.exports = router;
